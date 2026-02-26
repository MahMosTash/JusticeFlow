import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, Chip } from '@mui/material';
import { Gavel, Shield } from '@mui/icons-material';
import { CaseNodeData } from '@/types/detectiveBoard';

const SEVERITY_COLOR: Record<string, string> = {
  'Level 3': '#66bb6a',
  'Level 2': '#ffa726',
  'Level 1': '#ef5350',
  Critical: '#ce93d8',
};

const CaseNode = memo(({ data, selected }: NodeProps<CaseNodeData>) => {
  const color = SEVERITY_COLOR[data.severity] ?? '#90a4ae';

  return (
    <Box
      sx={{
        background: selected
          ? 'linear-gradient(135deg, #1a1a3e 0%, #0d0d2b 100%)'
          : 'linear-gradient(135deg, #0d0d2b 0%, #08081f 100%)',
        border: `2px solid ${selected ? color : 'rgba(150,150,255,0.25)'}`,
        borderRadius: 2,
        p: 2,
        minWidth: 200,
        maxWidth: 240,
        boxShadow: selected
          ? `0 0 25px ${color}55`
          : '0 4px 24px rgba(0,0,0,0.6)',
        transition: 'all 0.2s ease',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color, width: 10, height: 10 }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Shield sx={{ color, fontSize: 20 }} />
        <Typography
          variant="caption"
          sx={{
            color,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: '0.65rem',
          }}
        >
          CASE FILE
        </Typography>
      </Box>

      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ color: '#e8e8ff', fontSize: '0.85rem', mb: 0.75 }}
      >
        {data.title}
      </Typography>

      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        <Chip
          label={data.severity}
          size="small"
          sx={{
            bgcolor: `${color}22`,
            color,
            border: `1px solid ${color}44`,
            fontSize: '0.6rem',
            height: 18,
          }}
        />
        <Chip
          label={data.status}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.6rem',
            height: 18,
          }}
        />
      </Box>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: color, width: 10, height: 10 }}
      />
    </Box>
  );
});

CaseNode.displayName = 'CaseNode';
export default CaseNode;
