/**
 * Detective Board page with React Flow
 */
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Toolbar,
} from '@mui/material';
import { ArrowBack, Save, Download } from '@mui/icons-material';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { detectiveBoardService } from '@/services/detectiveBoardService';
import { evidenceService } from '@/services/evidenceService';
import { Evidence } from '@/types/api';
import { Loading } from '@/components/common/Loading';
import { ROUTES } from '@/constants/routes';

// Custom node component for evidence
const EvidenceNode = ({ data }: { data: { label: string; evidence: Evidence } }) => {
  return (
    <Paper
      sx={{
        p: 2,
        minWidth: 150,
        border: '2px solid #1976d2',
        borderRadius: 2,
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold">
        {data.label}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {data.evidence.evidence_type}
      </Typography>
    </Paper>
  );
};

const nodeTypes = {
  evidence: EvidenceNode,
};

export const DetectiveBoardPage: React.FC = () => {
  const { caseId } = useParams<{ caseId?: string }>();
  const navigate = useNavigate();
  
  // If no caseId, redirect to cases page to select a case
  useEffect(() => {
    if (!caseId) {
      navigate(ROUTES.CASES);
    }
  }, [caseId, navigate]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!caseId) return;

      try {
        setIsLoading(true);
        // Load evidence for the case
        const evidenceData = await evidenceService.getEvidence({ case: parseInt(caseId) });
        setEvidence(evidenceData.results);

        // Load or create detective board
        try {
          const board = await detectiveBoardService.getDetectiveBoard(parseInt(caseId));
          if (board && board.board_data) {
            // Restore board state
            if (board.board_data.nodes) {
              setNodes(board.board_data.nodes);
            }
            if (board.board_data.edges) {
              setEdges(board.board_data.edges);
            }
          } else {
            // Create initial nodes from evidence
            const initialNodes: Node[] = evidenceData.results.map((ev, index) => ({
              id: `evidence-${ev.id}`,
              type: 'evidence',
              position: { x: index * 200, y: index * 150 },
              data: { label: ev.title, evidence: ev },
            }));
            setNodes(initialNodes);
          }
        } catch {
          // Board doesn't exist, create initial nodes
          const initialNodes: Node[] = evidenceData.results.map((ev, index) => ({
            id: `evidence-${ev.id}`,
            type: 'evidence',
            position: { x: index * 200, y: index * 150 },
            data: { label: ev.title, evidence: ev },
          }));
          setNodes(initialNodes);
        }
      } catch (err: any) {
        console.error('Failed to load detective board:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [caseId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const handleSave = async () => {
    if (!caseId) return;

    try {
      setIsSaving(true);
      await detectiveBoardService.saveDetectiveBoard({
        case: parseInt(caseId),
        board_data: {
          nodes,
          edges,
        },
      });
    } catch (err: any) {
      console.error('Failed to save board:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    // For now, just log the board data
    console.log('Exporting board:', { nodes, edges });
    alert('Export functionality will be implemented');
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 100px)', py: 2 }}>
      <Toolbar sx={{ mb: 2, justifyContent: 'space-between' }}>
        <Box>
          <IconButton onClick={() => navigate(ROUTES.CASES)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ ml: 2, display: 'inline' }}>
            Detective Board - Case #{caseId}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={isSaving}
            sx={{ mr: 1 }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExport}>
            Export
          </Button>
        </Box>
      </Toolbar>

      <Box sx={{ height: 'calc(100% - 80px)', border: '1px solid #ddd', borderRadius: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </Box>
    </Container>
  );
};

