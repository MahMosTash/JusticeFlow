import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Fingerprint,
  DirectionsCar,
  Person,
  Description,
  MoreHoriz,
  RecordVoiceOver,
} from '@mui/icons-material';
import { EvidenceNodeData } from '@/types/detectiveBoard';

const EVIDENCE_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactElement }
> = {
  witness_statement: {
    label: 'Witness',
    color: '#4fc3f7',
    icon: <RecordVoiceOver sx={{ fontSize: 14 }} />,
  },
  biological: {
    label: 'Biological',
    color: '#ef9a9a',
    icon: <Fingerprint sx={{ fontSize: 14 }} />,
  },
  vehicle: {
    label: 'Vehicle',
    color: '#a5d6a7',
    icon: <DirectionsCar sx={{ fontSize: 14 }} />,
  },
  identification: {
    label: 'ID Doc',
    color: '#ffe082',
    icon: <Person sx={{ fontSize: 14 }} />,
  },
  other: {
    label: 'Other',
    color: '#ce93d8',
    icon: <MoreHoriz sx={{ fontSize: 14 }} />,
  },
};

const EvidenceNode = memo(({ data, selected }: NodeProps<EvidenceNodeData>) => {
  const config = EVIDENCE_TYPE_CONFIG[data.evidenceType] ?? EVIDENCE_TYPE_CONFIG.other;

  return (
    <Box
      sx={{
        background: selected
          ? 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%)'
          : 'linear-gradient(135deg, #0d2137 0%, #0a1929 100%)',
        border: `2px solid ${selected ? config.color : 'rgba(255,255,255,0.15)'}`,
        borderRadius: 2,
        p: 1.5,
        minWidth: 180,
        maxWidth: 220,
        boxShadow: selected
          ? `0 0 20px ${config.color}66`
          : '0 4px 20px rgba(0,0,0,0.5)',
        transition: 'all 0.2s ease',
        cursor: 'grab',
      }}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: config.color,
          width: 10,
          height: 10,
          border: '2px solid #0a1929',
        }}
      />

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <Box sx={{ color: config.color }}>{config.icon}</Box>
        <Chip
          label={config.label}
          size="small"
          sx={{
            bgcolor: `${config.color}22`,
            color: config.color,
            borderColor: `${config.color}44`,
            border: '1px solid',
            fontSize: '0.6rem',
            height: 18,
          }}
        />
      </Box>

      {/* Title */}
      <Tooltip title={data.title} placement="top">
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            color: '#e8f4fd',
            fontSize: '0.78rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5,
          }}
        >
          {data.title}
        </Typography>
      </Tooltip>

      {/* Description */}
      {data.description && (
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.65rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {data.description}
        </Typography>
      )}

      {/* Footer */}
      <Typography
        variant="caption"
        sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', mt: 0.5, display: 'block' }}
      >
        #{data.evidenceId} · {data.recordedBy}
      </Typography>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: config.color,
          width: 10,
          height: 10,
          border: '2px solid #0a1929',
        }}
      />
    </Box>
  );
});

EvidenceNode.displayName = 'EvidenceNode';
export default EvidenceNode;
