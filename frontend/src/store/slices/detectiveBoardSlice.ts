import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Node, Edge } from 'reactflow';
import detectiveBoardService from '@/services/detectiveBoardService';
import { DetectiveBoardState, BoardNode, BoardEdge, PersistedBoardData } from '@/types/detectiveBoard';
import { DetectiveBoard } from '@/types/api';

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialState: DetectiveBoardState = {
  board: null,
  nodes: [],
  edges: [],
  evidenceItems: [],
  suspects: [],
  loading: false,
  saving: false,
  error: null,
  saveError: null,
  isDirty: false,
  lastSaved: null,
};

// ─── Thunks ────────────────────────────────────────────────────────────────────

export const fetchBoard = createAsyncThunk(
  'detectiveBoard/fetchBoard',
  async (caseId: number, { rejectWithValue }) => {
    try {
      const board = await detectiveBoardService.getBoardByCase(caseId);
      return board;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch board');
    }
  }
);

export const fetchCaseEvidence = createAsyncThunk(
  'detectiveBoard/fetchCaseEvidence',
  async (caseId: number, { rejectWithValue }) => {
    try {
      const evidence = await detectiveBoardService.getCaseEvidence(caseId);
      return evidence;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch evidence');
    }
  }
);

export const fetchCaseSuspects = createAsyncThunk(
  'detectiveBoard/fetchCaseSuspects',
  async (caseId: number, { rejectWithValue }) => {
    try {
      const suspects = await detectiveBoardService.getCaseSuspects(caseId);
      return suspects;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch suspects');
    }
  }
);

export const saveBoard = createAsyncThunk(
  'detectiveBoard/saveBoard',
  async (
    {
      boardId,
      nodes,
      edges,
      viewport,
    }: { boardId: number; nodes: BoardNode[]; edges: BoardEdge[]; viewport?: any },
    { rejectWithValue }
  ) => {
    try {
      const boardData: PersistedBoardData = { nodes, edges, viewport };
      const updated = await detectiveBoardService.updateBoardData(boardId, boardData);
      return updated;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to save board');
    }
  }
);

export const addBoardConnection = createAsyncThunk(
  'detectiveBoard/addConnection',
  async (
    payload: {
      boardId: number;
      sourceEvidenceId: number;
      targetEvidenceId: number;
      connectionType: string;
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const connection = await detectiveBoardService.addConnection(
        payload.boardId,
        payload.sourceEvidenceId,
        payload.targetEvidenceId,
        payload.connectionType,
        payload.notes
      );
      return connection;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to add connection');
    }
  }
);

export const proposeSuspectThunk = createAsyncThunk(
  'detectiveBoard/proposeSuspect',
  async (
    payload: { caseId: number; suspectId: number; boardId: number },
    { rejectWithValue }
  ) => {
    try {
      const result = await detectiveBoardService.proposeSuspect(
        payload.caseId,
        payload.suspectId,
        payload.boardId
      );
      return result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to propose suspect');
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const detectiveBoardSlice = createSlice({
  name: 'detectiveBoard',
  initialState,
  reducers: {
    setNodes(state, action: PayloadAction<BoardNode[]>) {
      state.nodes = action.payload;
      state.isDirty = true;
    },
    setEdges(state, action: PayloadAction<BoardEdge[]>) {
      state.edges = action.payload;
      state.isDirty = true;
    },
    addNode(state, action: PayloadAction<BoardNode>) {
      // Prevent duplicate nodes (same evidenceId or suspectId)
      const exists = state.nodes.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.nodes.push(action.payload);
        state.isDirty = true;
      }
    },
    clearBoard(state) {
      state.board = null;
      state.nodes = [];
      state.edges = [];
      state.evidenceItems = [];
      state.suspects = [];
      state.isDirty = false;
      state.error = null;
      state.saveError = null;
      state.lastSaved = null;
    },
    markClean(state) {
      state.isDirty = false;
    },
    clearErrors(state) {
      state.error = null;
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchBoard ──────────────────────────────────────────────────────────
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.board = action.payload;

        // Restore persisted nodes/edges from board_data
        const boardData = action.payload.board_data as PersistedBoardData | null;
        if (boardData?.nodes) {
          state.nodes = boardData.nodes;
        }
        if (boardData?.edges) {
          state.edges = boardData.edges;
        }
        state.isDirty = false;
        state.lastSaved = action.payload.last_modified;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── fetchCaseEvidence ───────────────────────────────────────────────────
    builder
      .addCase(fetchCaseEvidence.fulfilled, (state, action) => {
        state.evidenceItems = action.payload.map((e: any) => ({
          id: e.id,
          title: e.title,
          evidence_type: e.evidence_type,
          description: e.description,
          recorded_by: e.recorded_by?.full_name || e.recorded_by?.username || 'Unknown',
          created_date: e.created_date,
        }));
      });

    // ── fetchCaseSuspects ───────────────────────────────────────────────────
    builder
      .addCase(fetchCaseSuspects.fulfilled, (state, action) => {
        state.suspects = action.payload.map((s: any) => ({
          id: s.id,
          name: s.name,
          national_id: s.national_id,
          status: s.status,
          days_under_investigation: s.days_under_investigation,
        }));
      });

    // ── saveBoard ───────────────────────────────────────────────────────────
    builder
      .addCase(saveBoard.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(saveBoard.fulfilled, (state, action) => {
        state.saving = false;
        state.board = action.payload;
        state.isDirty = false;
        state.lastSaved = new Date().toISOString();
      })
      .addCase(saveBoard.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload as string;
      });
  },
});

export const {
  setNodes,
  setEdges,
  addNode,
  clearBoard,
  markClean,
  clearErrors,
} = detectiveBoardSlice.actions;

export default detectiveBoardSlice.reducer;
