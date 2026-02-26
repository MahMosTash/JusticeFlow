import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Alert, Snackbar, Typography, Skeleton } from '@mui/material';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchBoard,
  fetchCaseEvidence,
  fetchCaseSuspects,
  saveBoard,
  setNodes as setReduxNodes,
  setEdges as setReduxEdges,
  addNode,
  clearBoard,
  clearErrors,
} from '@/store/slices/detectiveBoardSlice';

import BoardSidebar from '@/components/detectiveBoard/nodes/BoardSidebar';
import BoardToolbar from '@/components/detectiveBoard/nodes/BoardToolbar';
import EvidenceNode from '@/components/detectiveBoard/nodes/EvidenceNode';
import SuspectNode from '@/components/detectiveBoard/nodes/SuspectNode';
import CaseNode from '@/components/detectiveBoard/nodes/CaseNode';

import {
  BoardNode,
  BoardEdge,
  EvidenceNodeData,
  SuspectNodeData,
  SidebarEvidenceItem,
  SidebarSuspectItem,
} from '@/types/detectiveBoard';
import detectiveBoardService from '@/services/detectiveBoardService';

// ─── Register custom node types ───────────────────────────────────────────────

const nodeTypes: NodeTypes = {
  evidence: EvidenceNode,
  suspect: SuspectNode,
  case: CaseNode,
};

// ─── Role check helper ─────────────────────────────────────────────────────────

const EDITOR_ROLES = ['Detective', 'Sergeant'];

function userCanEdit(roles: { name: string }[]): boolean {
  return roles.some((r) => EDITOR_ROLES.includes(r.name));
}

// ─── Inner board (must be inside ReactFlowProvider) ───────────────────────────

const BoardCanvas: React.FC<{
  caseId: number;
  readOnly: boolean;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (instance: ReactFlowInstance) => void;
}> = ({ caseId, readOnly, reactFlowWrapper, reactFlowInstance, setReactFlowInstance }) => {
  const dispatch = useAppDispatch();
  const { board, nodes: reduxNodes, edges: reduxEdges } = useAppSelector(
    (s) => s.detectiveBoard
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(reduxNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reduxEdges as Edge[]);

  // Sync redux → local flow state on initial load
  useEffect(() => {
    setNodes(reduxNodes as Node[]);
  }, [reduxNodes]); // eslint-disable-line

  useEffect(() => {
    setEdges(reduxEdges as Edge[]);
  }, [reduxEdges]); // eslint-disable-line

  // Propagate local → redux so toolbar's save works
  useEffect(() => {
    dispatch(setReduxNodes(nodes as BoardNode[]));
  }, [nodes]); // eslint-disable-line

  useEffect(() => {
    dispatch(setReduxEdges(edges as BoardEdge[]));
  }, [edges]); // eslint-disable-line

  const onConnect = useCallback(
    (connection: Connection) => {
      if (readOnly) return;
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#4fc3f7' },
            style: { stroke: '#4fc3f7', strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [readOnly, setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (readOnly || !reactFlowWrapper.current || !reactFlowInstance) return;

      const rawData = event.dataTransfer.getData('application/reactflow-node');
      if (!rawData) return;

      const { nodeType, data } = JSON.parse(rawData) as {
        nodeType: 'evidence' | 'suspect';
        data: SidebarEvidenceItem | SidebarSuspectItem;
      };

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      if (nodeType === 'evidence') {
        const ev = data as SidebarEvidenceItem;
        const newNode: BoardNode = {
          id: `evidence-${ev.id}`,
          type: 'evidence',
          position,
          data: {
            evidenceId: ev.id,
            title: ev.title,
            evidenceType: ev.evidence_type,
            description: ev.description,
            recordedBy: ev.recorded_by,
            createdDate: ev.created_date,
          } satisfies EvidenceNodeData,
        };
        dispatch(addNode(newNode));
      } else if (nodeType === 'suspect') {
        const su = data as SidebarSuspectItem;
        const newNode: BoardNode = {
          id: `suspect-${su.id}`,
          type: 'suspect',
          position,
          data: {
            suspectId: su.id,
            name: su.name,
            nationalId: su.national_id,
            status: su.status,
            daysUnderInvestigation: su.days_under_investigation,
          } satisfies SuspectNodeData,
        };
        dispatch(addNode(newNode));
      }
    },
    [readOnly, reactFlowWrapper, reactFlowInstance, dispatch]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <Box
      ref={reactFlowWrapper}
      sx={{ flex: 1, height: '100%', bgcolor: '#030a14' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={true}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#4fc3f7', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#4fc3f7' },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.06)"
        />
        <Controls
          style={{
            background: '#0d1f35',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
          }}
        />
        <MiniMap
          style={{
            background: '#050d1a',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
          }}
          nodeColor={(node) => {
            if (node.type === 'evidence') return '#4fc3f7';
            if (node.type === 'suspect') return '#ef9a9a';
            return '#9c88ff';
          }}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </Box>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const DetectiveBoardPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const parsedCaseId = parseInt(caseId ?? '0', 10);

  const dispatch = useAppDispatch();
  const {
    board,
    nodes,
    edges,
    evidenceItems,
    suspects,
    loading,
    saving,
    saveError,
    isDirty,
    lastSaved,
  } = useAppSelector((s) => s.detectiveBoard);

  // Get current user roles for permission check
  const currentUser = useAppSelector((s) => s.auth.user);
  const readOnly = !currentUser || !userCanEdit(currentUser.roles ?? []);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  // ── Load data on mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (!parsedCaseId) return;
    dispatch(fetchBoard(parsedCaseId));
    dispatch(fetchCaseEvidence(parsedCaseId));
    dispatch(fetchCaseSuspects(parsedCaseId));

    return () => {
      dispatch(clearBoard());
    };
  }, [parsedCaseId, dispatch]);

  // ── Show save error as snackbar ──────────────────────────────────────────
  useEffect(() => {
    if (saveError) {
      setSnackMsg(saveError);
      setSnackOpen(true);
    }
  }, [saveError]);

  // ── Sidebar drag start ────────────────────────────────────────────────────
  const handleSidebarDragStart = useCallback(
    (
      event: React.DragEvent,
      nodeType: 'evidence' | 'suspect',
      data: SidebarEvidenceItem | SidebarSuspectItem
    ) => {
      event.dataTransfer.setData(
        'application/reactflow-node',
        JSON.stringify({ nodeType, data })
      );
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  // ── Save board ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!board || readOnly) return;
    const viewport = reactFlowInstance?.getViewport();
    await dispatch(saveBoard({ boardId: board.id, nodes, edges, viewport }));
    setSnackMsg('Board saved successfully!');
    setSnackOpen(true);
  }, [board, readOnly, reactFlowInstance, nodes, edges, dispatch]);

  // ── Auto-save every 60s if dirty ──────────────────────────────────────────
  useEffect(() => {
    if (readOnly || !board) return;
    const interval = setInterval(() => {
      if (isDirty) handleSave();
    }, 60_000);
    return () => clearInterval(interval);
  }, [isDirty, handleSave, readOnly, board]);

  // ── Export as PNG ──────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (!reactFlowWrapper.current) return;
    try {
      const dataUrl = await detectiveBoardService.exportBoardAsImage(reactFlowWrapper.current);
      const link = document.createElement('a');
      link.download = `detective-board-case-${parsedCaseId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      setSnackMsg('Export failed. Please try again.');
      setSnackOpen(true);
    }
  }, [parsedCaseId]);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#030a14' }}>
        <Box sx={{ width: 240, p: 2, borderRight: '1px solid rgba(255,255,255,0.07)' }}>
          {[1, 2, 3, 4, 5].map((k) => (
            <Skeleton
              key={k}
              variant="rectangular"
              height={48}
              sx={{ mb: 1, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.05)' }}
            />
          ))}
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Skeleton variant="rectangular" height={52} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
          <Box sx={{ flex: 1, bgcolor: '#030a14' }} />
        </Box>
      </Box>
    );
  }

  return (
    <ReactFlowProvider>
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          bgcolor: '#030a14',
          flexDirection: 'column',
        }}
      >
        {/* Toolbar (needs useReactFlow, must be inside ReactFlowProvider) */}
        <ToolbarWrapper
          boardTitle={board ? `Case #${parsedCaseId} — Detective Board` : 'Detective Board'}
          saving={saving}
          saveError={saveError}
          isDirty={isDirty}
          lastSaved={lastSaved}
          readOnly={readOnly}
          caseId={parsedCaseId}
          onSave={handleSave}
          onExport={handleExport}
        />

        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <BoardSidebar
            evidenceItems={evidenceItems}
            suspects={suspects}
            loading={loading}
            onDragStart={handleSidebarDragStart}
            readOnly={readOnly}
          />

          {/* Canvas */}
          <BoardCanvas
            caseId={parsedCaseId}
            readOnly={readOnly}
            reactFlowWrapper={reactFlowWrapper}
            reactFlowInstance={reactFlowInstance}
            setReactFlowInstance={setReactFlowInstance}
          />
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackOpen}
          autoHideDuration={3500}
          onClose={() => {
            setSnackOpen(false);
            dispatch(clearErrors());
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={saveError ? 'error' : 'success'}
            onClose={() => {
              setSnackOpen(false);
              dispatch(clearErrors());
            }}
            sx={{
              bgcolor: saveError ? '#1a0505' : '#051a0d',
              color: saveError ? '#ef9a9a' : '#a5d6a7',
              border: `1px solid ${saveError ? '#ef535055' : '#66bb6a55'}`,
            }}
          >
            {snackMsg}
          </Alert>
        </Snackbar>
      </Box>
    </ReactFlowProvider>
  );
};

// ─── Toolbar wrapper (inside ReactFlowProvider context) ────────────────────────
const ToolbarWrapper: React.FC<React.ComponentProps<typeof BoardToolbar>> = (props) => (
  <BoardToolbar {...props} />
);

export default DetectiveBoardPage;
