/**
 * Detective Board API service
 * Handles all communication with /api/detective-board/ endpoints
 */
import api from './api';
import { DetectiveBoard, Evidence, Suspect, BoardEvidenceConnection } from '@/types/api';
import { PersistedBoardData } from '@/types/detectiveBoard';

const detectiveBoardService = {
  // ── Board CRUD ────────────────────────────────────────────────────────────

  /**
   * Fetch board for a specific case. Creates one if it doesn't exist (backend handles it).
   */
  async getBoardByCase(caseId: number): Promise<DetectiveBoard> {
    const response = await api.get<DetectiveBoard>(`/api/detective-board/?case=${caseId}`);
    // DRF may return a list or single object depending on your viewset
    const data = response.data;
    if (Array.isArray(data)) {
      if (data.length === 0) {
        // Create a new board for this case
        return await detectiveBoardService.createBoard(caseId);
      }
      return data[0];
    }
    return data;
  },

  async createBoard(caseId: number): Promise<DetectiveBoard> {
    const response = await api.post<DetectiveBoard>('/api/detective-board/', {
      case: caseId,
      board_data: { nodes: [], edges: [] },
    });
    return response.data;
  },

  async updateBoardData(
    boardId: number,
    boardData: PersistedBoardData
  ): Promise<DetectiveBoard> {
    const response = await api.patch<DetectiveBoard>(
      `/api/detective-board/${boardId}/`,
      { board_data: boardData }
    );
    return response.data;
  },

  // ── Evidence & Suspects (sidebar data) ───────────────────────────────────

  async getCaseEvidence(caseId: number): Promise<Evidence[]> {
    const response = await api.get<any>(`/api/evidence/?case=${caseId}`);
    // Handle paginated or plain list
    return Array.isArray(response.data) ? response.data : response.data.results ?? [];
  },

  async getCaseSuspects(caseId: number): Promise<Suspect[]> {
    const response = await api.get<any>(`/api/suspects/?case=${caseId}`);
    return Array.isArray(response.data) ? response.data : response.data.results ?? [];
  },

  // ── Connections ───────────────────────────────────────────────────────────

  async addConnection(
    boardId: number,
    sourceEvidenceId: number,
    targetEvidenceId: number,
    connectionType: string = 'related',
    notes?: string
  ): Promise<BoardEvidenceConnection> {
    const response = await api.post<BoardEvidenceConnection>(
      `/api/detective-board/${boardId}/add_connection/`,
      {
        source_evidence: sourceEvidenceId,
        target_evidence: targetEvidenceId,
        connection_type: connectionType,
        notes: notes || '',
      }
    );
    return response.data;
  },

  async removeConnection(boardId: number, connectionId: number): Promise<void> {
    await api.delete(
      `/api/detective-board/${boardId}/remove_connection/${connectionId}/`
    );
  },

  // ── Suspect Proposals ─────────────────────────────────────────────────────

  async proposeSuspect(
    caseId: number,
    suspectId: number,
    boardId: number
  ): Promise<any> {
    const response = await api.post(
      `/api/cases/${caseId}/propose_suspect/`,
      { suspect_id: suspectId, board_id: boardId }
    );
    return response.data;
  },

  async reviewSuspect(
    caseId: number,
    suspectId: number,
    action: 'approve' | 'reject',
    comments?: string
  ): Promise<any> {
    const response = await api.post(
      `/api/cases/${caseId}/review_suspect/`,
      { suspect_id: suspectId, action, comments: comments || '' }
    );
    return response.data;
  },

  // ── Export ─────────────────────────────────────────────────────────────────

  async exportBoardAsImage(boardElement: HTMLElement): Promise<string> {
    const { toPng } = await import('html-to-image');
    return toPng(boardElement, {
      backgroundColor: '#1a1a2e',
      quality: 0.95,
    });
  },
};

export default detectiveBoardService;
