import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Save,
  Download,
  ZoomIn,
  ZoomOut,
  FitScreen,
  ArrowBack,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useReactFlow } from 'reactflow';
import { useNavigate } from 'react-router-dom';

interface BoardToolbarProps {
  boardTitle: string;
  saving: boolean;
  saveError: string | null;
  isDirty: boolean;
  lastSaved: string | null;
  readOnly: boolean;
  caseId: number;
  onSave: () => void;
  onExport: () => void;
}

const BoardToolbar: React.FC<BoardToolbarProps> = ({
  boardTitle,
  saving,
  saveError,
  isDirty,
  lastSaved,
  readOnly,
  caseId,
  onSave,
  onExport,
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const navigate = useNavigate();

  const getLastSavedLabel = () => {
    if (!lastSaved) return null;
    const date = new Date(lastSaved);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        bgcolor: '#050d1a',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        gap: 1.5,
        zIndex: 10,
      }}
    >
      {/* Back button */}
      <Tooltip title={`Back to Case #${caseId}`}>
        <IconButton
          size="small"
          onClick={() => navigate(`/cases/${caseId}`)}
          sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#4fc3f7' } }}
        >
          <ArrowBack fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

      {/* Title */}
      <Typography
        variant="subtitle2"
        sx={{
          color: '#4fc3f7',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: 0.5,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        🕵️ {boardTitle}
      </Typography>

      {/* Status indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {saving && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CircularProgress size={12} sx={{ color: '#4fc3f7' }} />
            <Typography variant="caption" sx={{ color: '#4fc3f7', fontSize: '0.65rem' }}>
              Saving...
            </Typography>
          </Box>
        )}
        {!saving && saveError && (
          <Chip
            icon={<ErrorIcon sx={{ fontSize: '12px !important' }} />}
            label="Save failed"
            size="small"
            sx={{ bgcolor: '#ef535022', color: '#ef5350', fontSize: '0.62rem', height: 20 }}
          />
        )}
        {!saving && !saveError && lastSaved && (
          <Chip
            icon={<CheckCircle sx={{ fontSize: '12px !important' }} />}
            label={`Saved ${getLastSavedLabel()}`}
            size="small"
            sx={{ bgcolor: '#66bb6a22', color: '#66bb6a', fontSize: '0.62rem', height: 20 }}
          />
        )}
        {isDirty && !saving && (
          <Chip
            label="Unsaved changes"
            size="small"
            sx={{ bgcolor: '#ffa72622', color: '#ffa726', fontSize: '0.62rem', height: 20 }}
          />
        )}
        {readOnly && (
          <Chip
            label="Read Only"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', height: 20 }}
          />
        )}
      </Box>

      <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

      {/* Zoom Controls */}
      <Tooltip title="Zoom In">
        <IconButton
          size="small"
          onClick={() => zoomIn()}
          sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff' } }}
        >
          <ZoomIn fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Zoom Out">
        <IconButton
          size="small"
          onClick={() => zoomOut()}
          sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff' } }}
        >
          <ZoomOut fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Fit to view">
        <IconButton
          size="small"
          onClick={() => fitView({ padding: 0.2, duration: 500 })}
          sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff' } }}
        >
          <FitScreen fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

      {/* Export */}
      <Tooltip title="Export board as PNG">
        <IconButton
          size="small"
          onClick={onExport}
          sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#ffe082' } }}
        >
          <Download fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Save */}
      {!readOnly && (
        <Button
          variant="contained"
          size="small"
          onClick={onSave}
          disabled={saving || !isDirty}
          startIcon={saving ? <CircularProgress size={12} color="inherit" /> : <Save sx={{ fontSize: '14px !important' }} />}
          sx={{
            bgcolor: '#1565c0',
            fontSize: '0.72rem',
            py: 0.4,
            px: 1.5,
            '&:hover': { bgcolor: '#1976d2' },
            '&:disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' },
          }}
        >
          Save Board
        </Button>
      )}
    </Box>
  );
};

export default BoardToolbar;
