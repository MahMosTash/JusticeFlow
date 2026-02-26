/**
 * Detective Board - Visual evidence analysis with React Flow
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  MarkerType,
  NodeProps,
  Handle,
  Position,
  EdgeProps,
  getBezierPath,
  BaseEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Badge,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Add,
  Delete,
  Fingerprint,
  Photo,
  VideoLibrary,
  MicNone,
  Description,
  DirectionsCar,
  Person,
  ChevronLeft,
  ChevronRight,
  FilterList,
} from '@mui/icons-material';
import { detectiveBoardService } from '@/services/detectiveBoardService';
import { evidenceService } from '@/services/evidenceService';
import { Evidence } from '@/types/api';
import { Loading } from '@/components/common/Loading';
import { ROUTES } from '@/constants/routes';

// ─── Evidence type config ───────────────────────────────────────────────
const EVIDENCE_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  physical:          { color: '#ef5350', icon: <Fingerprint fontSize="small" />, label: 'Physical' },
  digital:           { color: '#42a5f5', icon: <Description fontSize="small" />, label: 'Digital' },
  witness_statement: { color: '#66bb6a', icon: <Person fontSize="small" />, label: 'Witness' },
  document:          { color: '#ffa726', icon: <Description fontSize="small" />, label: 'Document' },
  photo:             { color: '#ab47bc', icon: <Photo fontSize="small" />, label: 'Photo' },
  video:             { color: '#26c6da', icon: <VideoLibrary fontSize="small" />, label: 'Video' },
  audio:             { color: '#ec407a', icon: <MicNone fontSize="small" />, label: 'Audio' },
  license_plate:     { color: '#ff7043', icon: <DirectionsCar fontSize="small" />, label: 'License Plate' },
};

const getEvidenceConfig = (type: string) =>
  EVIDENCE_CONFIG[type] ?? { color: '#78909c', icon: <Fingerprint fontSize="small" />, label: type };

// ─── Custom Evidence Node ───────────────────────────────────────────────
const EvidenceNode = ({ data, selected }: NodeProps) => {
  const cfg = getEvidenceConfig(data.evidence?.evidence_type ?? '');
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: '#ff1744', width: 10, height: 10, border: '2px solid #fff' }} />
      <Box
        sx={{
          minWidth: 160,
          maxWidth: 200,
          background: selected
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
          border: `2px solid ${selected ? '#ff1744' : cfg.color}`,
          borderRadius: 2,
          p: 1.5,
          cursor: 'grab',
          boxShadow: selected
            ? `0 0 20px ${cfg.color}88, 0 4px 20px rgba(0,0,0,0.6)`
            : `0 0 10px ${cfg.color}44, 0 4px 12px rgba(0,0,0,0.5)`,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: `0 0 20px ${cfg.color}88, 0 4px 20px rgba(0,0,0,0.6)`,
            borderColor: cfg.color,
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={0.75} mb={0.5}>
          <Box sx={{ color: cfg.color, display: 'flex' }}>{cfg.icon}</Box>
          <Chip
            label={cfg.label}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              bgcolor: `${cfg.color}22`,
              color: cfg.color,
              border: `1px solid ${cfg.color}44`,
              fontWeight: 700,
            }}
          />
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: '#e0e0e0',
            fontWeight: 600,
            fontSize: '0.78rem',
            lineHeight: 1.3,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {data.label}
        </Typography>
        {data.evidence?.witness_name && (
          <Typography variant="caption" sx={{ color: '#90a4ae', fontSize: '0.65rem', mt: 0.25, display: 'block' }}>
            👤 {data.evidence.witness_name}
          </Typography>
        )}
      </Box>
      <Handle type="source" position={Position.Right} style={{ background: '#ff1744', width: 10, height: 10, border: '2px solid #fff' }} />
    </>
  );
};

// ─── Custom Red Edge ────────────────────────────────────────────────────
const RedEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected }: EdgeProps) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      {/* Glow layer */}
      <path
        d={edgePath}
        fill="none"
        stroke={selected ? '#ff6b6b' : '#ff1744'}
        strokeWidth={selected ? 6 : 4}
        strokeOpacity={0.25}
        style={{ filter: 'blur(3px)' }}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#ff6b6b' : '#ff1744',
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: selected ? '6 3' : undefined,
        }}
        markerEnd={`url(#red-arrow-${id})`}
      />
      <defs>
        <marker
          id={`red-arrow-${id}`}
          markerWidth="12"
          markerHeight="12"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={selected ? '#ff6b6b' : '#ff1744'} />
        </marker>
      </defs>
    </>
  );
};

const nodeTypes = { evidence: EvidenceNode };
const edgeTypes = { red: RedEdge };

const defaultEdgeOptions = {
  type: 'red',
  animated: false,
};

// ─── Main Page ──────────────────────────────────────────────────────────
export const DetectiveBoardPage: React.FC = () => {
  const { caseId } = useParams<{ caseId?: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [boardId, setBoardId] = useState<number | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!caseId) { navigate(ROUTES.CASES); return; }
    loadData();
  }, [caseId]);

  const loadData = async () => {
    if (!caseId) return;
    setIsLoading(true);
    try {
      const evidenceData = await evidenceService.getEvidence({ case: parseInt(caseId) });
      const evList: Evidence[] = evidenceData.results ?? evidenceData;
      setEvidenceList(evList);

      try {
        const board = await detectiveBoardService.getDetectiveBoard(parseInt(caseId));
        if (board) {
          setBoardId(board.id ?? null);
          if (board.board_data?.nodes?.length) {
            const hydratedNodes = board.board_data.nodes.map((n: Node) => {
              const evId = parseInt(n.id.replace('evidence-', ''));
              const ev = evList.find(e => e.id === evId);
              if (ev) return { ...n, data: { label: ev.title, evidence: ev } };
              return n;
            });
            setNodes(hydratedNodes);
            setEdges(board.board_data.edges ?? []);
          } else {
            initNodesFromEvidence(evList);
          }
        } else {
          initNodesFromEvidence(evList);
        }

      } catch {
        initNodesFromEvidence(evList);
      }
    } catch (err) {
      console.error('Failed to load board data:', err);
      setSnackbar({ open: true, msg: 'Failed to load board data', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const initNodesFromEvidence = (evList: Evidence[]) => {
    const cols = Math.ceil(Math.sqrt(evList.length)) || 1;
    const initialNodes: Node[] = evList.map((ev, index) => ({
      id: `evidence-${ev.id}`,
      type: 'evidence',
      position: {
        x: (index % cols) * 240 + 80,
        y: Math.floor(index / cols) * 180 + 60,
      },
      data: { label: ev.title, evidence: ev },
    }));
    setNodes(initialNodes);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, type: 'red' }, eds));
    },
    [setEdges]
  );

  const handleSave = async () => {
    if (!caseId) return;
    setIsSaving(true);
    try {
      const saved = await detectiveBoardService.saveDetectiveBoard({
        case: parseInt(caseId),
        board_data: { nodes, edges },
      });
      setBoardId(saved.id ?? null);
      setSnackbar({ open: true, msg: 'Board saved successfully!', severity: 'success' });
    } catch (err) {
      console.error('Save failed:', err);
      setSnackbar({ open: true, msg: 'Failed to save board', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };


  const handleAddEvidence = (ev: Evidence) => {
    const existingNode = nodes.find(n => n.id === `evidence-${ev.id}`);
    if (existingNode) {
      setSnackbar({ open: true, msg: 'Evidence already on board', severity: 'error' });
      return;
    }
    const newNode: Node = {
      id: `evidence-${ev.id}`,
      type: 'evidence',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: { label: ev.title, evidence: ev },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleRemoveSelected = () => {
    setNodes((nds) => nds.filter(n => !n.selected));
    setEdges((eds) => eds.filter(e => !e.selected));
  };

  const evidenceOnBoard = new Set(nodes.map(n => n.id));
  const filteredEvidence = filterType
    ? evidenceList.filter(e => e.evidence_type === filterType)
    : evidenceList;

  const evidenceTypes = [...new Set(evidenceList.map(e => e.evidence_type))];

  if (isLoading) return <Loading fullScreen />;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#050510' }}>
      {/* ── Top Bar ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          bgcolor: '#0a0a1a',
          borderBottom: '1px solid #ff174422',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => navigate(ROUTES.CASES)} sx={{ color: '#ff1744' }}>
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              color: '#e0e0e0',
              fontFamily: "'Courier New', monospace",
              fontWeight: 700,
              letterSpacing: 1,
              '& span': { color: '#ff1744' },
            }}
          >
            DETECTIVE BOARD <span>#{caseId}</span>
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <Tooltip title="Remove selected nodes/edges">
            <IconButton onClick={handleRemoveSelected} sx={{ color: '#ff5252' }}>
              <Delete />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save />}
            onClick={handleSave}
            disabled={isSaving}
            sx={{
              bgcolor: '#ff1744',
              '&:hover': { bgcolor: '#d50000' },
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {isSaving ? 'SAVING...' : 'SAVE'}
          </Button>
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Evidence Sidebar */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={sidebarOpen}
          PaperProps={{
            sx: {
              position: 'relative',
              width: 260,
              bgcolor: '#0a0a1a',
              borderRight: '1px solid #ff174422',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <Box sx={{ p: 1.5, borderBottom: '1px solid #ff174422' }}>
            <Typography variant="caption" sx={{ color: '#ff1744', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>
              Evidence Items
            </Typography>
            <Typography variant="caption" sx={{ color: '#546e7a', display: 'block', mt: 0.25 }}>
              Click to add to board
            </Typography>
          </Box>

          {/* Type filters */}
          <Box sx={{ p: 1, borderBottom: '1px solid #ff174422', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              label="All"
              size="small"
              onClick={() => setFilterType(null)}
              sx={{
                bgcolor: filterType === null ? '#ff174433' : 'transparent',
                border: `1px solid ${filterType === null ? '#ff1744' : '#37474f'}`,
                color: filterType === null ? '#ff1744' : '#78909c',
                fontSize: '0.65rem',
                cursor: 'pointer',
              }}
            />
            {evidenceTypes.map(type => {
              const cfg = getEvidenceConfig(type);
              return (
                <Chip
                  key={type}
                  label={cfg.label}
                  size="small"
                  onClick={() => setFilterType(type === filterType ? null : type)}
                  sx={{
                    bgcolor: filterType === type ? `${cfg.color}22` : 'transparent',
                    border: `1px solid ${filterType === type ? cfg.color : '#37474f'}`,
                    color: filterType === type ? cfg.color : '#78909c',
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </Box>

          <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
            {filteredEvidence.map(ev => {
              const cfg = getEvidenceConfig(ev.evidence_type);
              const onBoard = evidenceOnBoard.has(`evidence-${ev.id}`);
              return (
                <ListItem key={ev.id} disablePadding divider sx={{ borderColor: '#0d1117' }}>
                  <ListItemButton
                    onClick={() => handleAddEvidence(ev)}
                    disabled={onBoard}
                    sx={{
                      py: 1,
                      opacity: onBoard ? 0.4 : 1,
                      '&:hover': { bgcolor: `${cfg.color}11` },
                    }}
                  >
                    <Box sx={{ color: cfg.color, mr: 1, display: 'flex' }}>{cfg.icon}</Box>
                    <ListItemText
                      primary={ev.title}
                      secondary={cfg.label}
                      primaryTypographyProps={{ fontSize: '0.78rem', color: '#cfd8dc', fontWeight: onBoard ? 400 : 600 }}
                      secondaryTypographyProps={{ fontSize: '0.65rem', color: cfg.color }}
                    />
                    {onBoard && (
                      <Chip label="Added" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: '#1b2a1b', color: '#66bb6a' }} />
                    )}
                    {!onBoard && <Add fontSize="small" sx={{ color: '#546e7a' }} />}
                  </ListItemButton>
                </ListItem>
              );
            })}
            {filteredEvidence.length === 0 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#546e7a' }}>No evidence found</Typography>
              </Box>
            )}
          </List>
        </Drawer>

        {/* Toggle sidebar button */}
        <IconButton
          onClick={() => setSidebarOpen(v => !v)}
          sx={{
            position: 'absolute',
            left: sidebarOpen ? 252 : 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            bgcolor: '#0a0a1a',
            border: '1px solid #ff174444',
            color: '#ff1744',
            width: 20,
            height: 48,
            borderRadius: '0 4px 4px 0',
            '&:hover': { bgcolor: '#ff174422' },
            transition: 'left 0.2s',
          }}
        >
          {sidebarOpen ? <ChevronLeft fontSize="small" /> : <ChevronRight fontSize="small" />}
        </IconButton>

        {/* React Flow Canvas */}
        <Box sx={{ flex: 1, bgcolor: '#050510' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            style={{ background: '#050510' }}
          >
            <Background
              color="#1a1a2e"
              gap={24}
              size={1}
              style={{ opacity: 0.8 }}
            />
            <Controls
              style={{
                background: '#0a0a1a',
                border: '1px solid #ff174422',
                borderRadius: 8,
              }}
            />
            <MiniMap
              nodeColor={(n) => {
                const ev = n.data?.evidence;
                if (!ev) return '#37474f';
                return getEvidenceConfig(ev.evidence_type).color;
              }}
              style={{
                background: '#0a0a1a',
                border: '1px solid #ff174422',
                borderRadius: 8,
              }}
              maskColor="rgba(5, 5, 16, 0.7)"
            />
          </ReactFlow>

          {/* Help hint */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: '#0a0a1a99',
              border: '1px solid #ff174422',
              borderRadius: 2,
              px: 2,
              py: 0.75,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#546e7a', fontFamily: 'monospace' }}>
              Drag to connect nodes • <span style={{ color: '#ff1744' }}>Red lines</span> show connections • Delete key removes selected
            </Typography>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DetectiveBoardPage;
