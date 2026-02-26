import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tooltip,
  Skeleton,
  InputAdornment,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  ExpandLess,
  Fingerprint,
  PersonSearch,
} from '@mui/icons-material';
import { SidebarEvidenceItem, SidebarSuspectItem } from '@/types/detectiveBoard';

const EVIDENCE_TYPE_COLORS: Record<string, string> = {
  witness_statement: '#4fc3f7',
  biological: '#ef9a9a',
  vehicle: '#a5d6a7',
  identification: '#ffe082',
  other: '#ce93d8',
};

interface BoardSidebarProps {
  evidenceItems: SidebarEvidenceItem[];
  suspects: SidebarSuspectItem[];
  loading: boolean;
  onDragStart: (
    event: React.DragEvent,
    nodeType: 'evidence' | 'suspect',
    data: SidebarEvidenceItem | SidebarSuspectItem
  ) => void;
  readOnly: boolean;
}

const DraggableEvidenceItem = ({
  item,
  onDragStart,
  readOnly,
}: {
  item: SidebarEvidenceItem;
  onDragStart: BoardSidebarProps['onDragStart'];
  readOnly: boolean;
}) => {
  const color = EVIDENCE_TYPE_COLORS[item.evidence_type] ?? '#ce93d8';

  return (
    <Tooltip title={item.description || item.title} placement="right">
      <ListItem
        draggable={!readOnly}
        onDragStart={(e) => !readOnly && onDragStart(e, 'evidence', item)}
        sx={{
          mb: 0.5,
          borderRadius: 1.5,
          border: '1px solid rgba(255,255,255,0.06)',
          bgcolor: 'rgba(255,255,255,0.03)',
          cursor: readOnly ? 'default' : 'grab',
          transition: 'all 0.15s ease',
          py: 0.75,
          px: 1,
          '&:hover': readOnly
            ? {}
            : {
                bgcolor: `${color}11`,
                borderColor: `${color}44`,
                transform: 'translateX(2px)',
              },
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip
                label={item.evidence_type.replace('_', ' ')}
                size="small"
                sx={{
                  bgcolor: `${color}22`,
                  color,
                  fontSize: '0.55rem',
                  height: 16,
                  border: `1px solid ${color}44`,
                }}
              />
            </Box>
          }
          secondary={
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.7rem',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.title}
            </Typography>
          }
          sx={{ m: 0 }}
        />
      </ListItem>
    </Tooltip>
  );
};

const DraggableSuspectItem = ({
  item,
  onDragStart,
  readOnly,
}: {
  item: SidebarSuspectItem;
  onDragStart: BoardSidebarProps['onDragStart'];
  readOnly: boolean;
}) => {
  return (
    <ListItem
      draggable={!readOnly}
      onDragStart={(e) => !readOnly && onDragStart(e, 'suspect', item)}
      sx={{
        mb: 0.5,
        borderRadius: 1.5,
        border: '1px solid rgba(255,100,100,0.1)',
        bgcolor: 'rgba(255,100,100,0.03)',
        cursor: readOnly ? 'default' : 'grab',
        transition: 'all 0.15s ease',
        py: 0.75,
        px: 1,
        '&:hover': readOnly
          ? {}
          : {
              bgcolor: 'rgba(255,100,100,0.08)',
              borderColor: 'rgba(255,100,100,0.3)',
              transform: 'translateX(2px)',
            },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <ListItemText
        primary={
          <Typography
            variant="caption"
            sx={{ color: '#ffe0e0', fontWeight: 600, fontSize: '0.72rem' }}
          >
            {item.name}
          </Typography>
        }
        secondary={
          <Typography variant="caption" sx={{ color: 'rgba(255,200,200,0.45)', fontSize: '0.62rem' }}>
            {item.status} {item.days_under_investigation ? `· ${item.days_under_investigation}d` : ''}
          </Typography>
        }
        sx={{ m: 0 }}
      />
    </ListItem>
  );
};

const BoardSidebar: React.FC<BoardSidebarProps> = ({
  evidenceItems,
  suspects,
  loading,
  onDragStart,
  readOnly,
}) => {
  const [search, setSearch] = useState('');
  const [evidenceOpen, setEvidenceOpen] = useState(true);
  const [suspectsOpen, setSuspectsOpen] = useState(true);

  const filteredEvidence = evidenceItems.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.evidence_type.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSuspects = suspects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: 240,
        height: '100%',
        bgcolor: '#050d1a',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: '#4fc3f7',
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            mb: 1,
          }}
        >
          🔍 Board Elements
        </Typography>
        <TextField
          size="small"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} />
              </InputAdornment>
            ),
            sx: {
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.7)',
              bgcolor: 'rgba(255,255,255,0.04)',
              borderRadius: 1.5,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
            },
          }}
        />
        {!readOnly && (
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem', mt: 0.5, display: 'block' }}
          >
            Drag items onto the board
          </Typography>
        )}
      </Box>

      {/* Scrollable list */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
        {/* Evidence Section */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', px: 0.5, py: 0.75 }}
          onClick={() => setEvidenceOpen((o) => !o)}
        >
          <Fingerprint sx={{ fontSize: 14, color: '#4fc3f7', mr: 0.5 }} />
          <Typography
            variant="caption"
            sx={{ color: '#4fc3f7', fontWeight: 700, flex: 1, fontSize: '0.68rem', letterSpacing: 1 }}
          >
            EVIDENCE ({filteredEvidence.length})
          </Typography>
          {evidenceOpen ? (
            <ExpandLess sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
          ) : (
            <ExpandMore sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
          )}
        </Box>

        <Collapse in={evidenceOpen}>
          <List disablePadding>
            {loading
              ? [1, 2, 3].map((k) => (
                  <Skeleton
                    key={k}
                    variant="rectangular"
                    height={48}
                    sx={{ mb: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.05)' }}
                  />
                ))
              : filteredEvidence.map((item) => (
                  <DraggableEvidenceItem
                    key={item.id}
                    item={item}
                    onDragStart={onDragStart}
                    readOnly={readOnly}
                  />
                ))}
            {!loading && filteredEvidence.length === 0 && (
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.2)', px: 1, fontSize: '0.65rem' }}
              >
                No evidence found
              </Typography>
            )}
          </List>
        </Collapse>

        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

        {/* Suspects Section */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', px: 0.5, py: 0.75 }}
          onClick={() => setSuspectsOpen((o) => !o)}
        >
          <PersonSearch sx={{ fontSize: 14, color: '#ef9a9a', mr: 0.5 }} />
          <Typography
            variant="caption"
            sx={{ color: '#ef9a9a', fontWeight: 700, flex: 1, fontSize: '0.68rem', letterSpacing: 1 }}
          >
            SUSPECTS ({filteredSuspects.length})
          </Typography>
          {suspectsOpen ? (
            <ExpandLess sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
          ) : (
            <ExpandMore sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
          )}
        </Box>

        <Collapse in={suspectsOpen}>
          <List disablePadding>
            {loading
              ? [1, 2].map((k) => (
                  <Skeleton
                    key={k}
                    variant="rectangular"
                    height={48}
                    sx={{ mb: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.05)' }}
                  />
                ))
              : filteredSuspects.map((item) => (
                  <DraggableSuspectItem
                    key={item.id}
                    item={item}
                    onDragStart={onDragStart}
                    readOnly={readOnly}
                  />
                ))}
            {!loading && filteredSuspects.length === 0 && (
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.2)', px: 1, fontSize: '0.65rem' }}
              >
                No suspects found
              </Typography>
            )}
          </List>
        </Collapse>
      </Box>
    </Box>
  );
};

export default BoardSidebar;
