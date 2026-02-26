import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import { Person, Warning, Lock } from '@mui/icons-material';
import { SuspectNodeData } from '@/types/detectiveBoard';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  'Under Investigation': { color: '#ffa726', label: 'Investigating' },
  'Under Severe Surveillance': { color: '#ef5350', label: 'Severe' },
  Arrested: { color: '#ab47bc', label: 'Arrested' },
  Cleared: { color: '#66bb6a', label: 'Cleared' },
};

const SuspectNode = memo(({ data, selected }: NodeProps<SuspectNodeData>) => {
  const statusConf = STATUS_CONFIG[data.status] ?? { color: '#90a4ae', label: data.status };

  return (
    <Box
      sx={{
        background: selected
          ? 'linear-gradient(135deg, #3e1a1a 0%, #2d0f0f 100%)'
          : 'linear-gradient(135deg, #1a0a0a 0%, #120505 100%)',
        border: `2px solid ${selected ? statusConf.color : 'rgba(255,100,100,0.25)'}`,
        borderRadius: 2,
        p: 1.5,
        minWidth: 160,
        maxWidth: 200,
        boxShadow: selected
          ? `0 0 20px ${statusConf.color}66`
          : '0 4px 20px rgba(0,0,0,0.5)',
        transition: 'all 0.2s ease',
        cursor: 'grab',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: statusConf.color,
          width: 10,
          height: 10,
          border: '2px solid #120505',
        }}
      />

      {/* Icon + Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <Avatar
          sx={{
            width: 28,
            height: 28,
            bgcolor: `${statusConf.color}33`,
            border: `1px solid ${statusConf.color}66`,
          }}
        >
          <Person sx={{ fontSize: 16, color: statusConf.color }} />
        </Avatar>
        <Chip
          label={statusConf.label}
          size="small"
          sx={{
            bgcolor: `${statusConf.color}22`,
            color: statusConf.color,
            border: `1px solid ${statusConf.color}44`,
            fontSize: '0.6rem',
            height: 18,
          }}
        />
      </Box>

      {/* Name */}
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ color: '#ffe0e0', fontSize: '0.8rem', mb: 0.25 }}
      >
        {data.name}
      </Typography>

      {/* National ID */}
      <Typography
        variant="caption"
        sx={{ color: 'rgba(255,200,200,0.45)', fontSize: '0.65rem' }}
      >
        ID: {data.nationalId}
      </Typography>

      {/* Days under investigation */}
      {data.daysUnderInvestigation !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <Warning sx={{ fontSize: 12, color: '#ffa726' }} />
          <Typography variant="caption" sx={{ color: '#ffa726', fontSize: '0.62rem' }}>
            {data.daysUnderInvestigation} days
          </Typography>
        </Box>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: statusConf.color,
          width: 10,
          height: 10,
          border: '2px solid #120505',
        }}
      />
    </Box>
  );
});

SuspectNode.displayName = 'SuspectNode';
export default SuspectNode;
