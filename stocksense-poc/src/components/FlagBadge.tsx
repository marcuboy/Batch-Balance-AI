import React from 'react';
import { Chip, useTheme } from '@mui/material';

interface FlagBadgeProps {
  type: 'atb' | 'obsolete' | 'tls' | 'both' | 'site-wbn' | 'site-sta';
  label?: string;
}

const FlagBadge: React.FC<FlagBadgeProps> = ({ type, label }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const config = {
    atb: {
      bg: isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.1)',
      color: isDark ? '#06B6D4' : '#0891b2',
      border: isDark ? 'rgba(6,182,212,0.4)' : 'rgba(6,182,212,0.3)',
      text: label || '📋 ATB',
    },
    obsolete: {
      bg: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(124,58,237,0.1)',
      color: isDark ? '#8B5CF6' : '#7c3aed',
      border: isDark ? 'rgba(139,92,246,0.4)' : 'rgba(124,58,237,0.3)',
      text: label || '⚠️ OBS',
    },
    tls: {
      bg: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(234,88,12,0.1)',
      color: isDark ? '#F59E0B' : '#ea580c',
      border: isDark ? 'rgba(245,158,11,0.4)' : 'rgba(234,88,12,0.3)',
      text: label || '📦 TLS',
    },
    both: {
      bg: isDark ? 'rgba(232,69,60,0.15)' : 'rgba(220,38,38,0.1)',
      color: isDark ? '#E8453C' : '#dc2626',
      border: isDark ? 'rgba(232,69,60,0.4)' : 'rgba(220,38,38,0.3)',
      text: label || 'ATB+OBS',
    },
    'site-wbn': {
      bg: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(234,88,12,0.1)',
      color: isDark ? '#F59E0B' : '#ea580c',
      border: isDark ? 'rgba(245,158,11,0.4)' : 'rgba(234,88,12,0.3)',
      text: label || '🔴 WBN',
    },
    'site-sta': {
      bg: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(5,150,105,0.1)',
      color: isDark ? '#10B981' : '#059669',
      border: isDark ? 'rgba(16,185,129,0.4)' : 'rgba(5,150,105,0.3)',
      text: label || '🟢 STA',
    },
  };

  const style = config[type];

  return (
    <Chip
      label={style.text}
      size="small"
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontSize: '9px',
        fontWeight: type === 'tls' ? 700 : 600,
        letterSpacing: '0.5px',
        height: '20px',
        '& .MuiChip-label': {
          padding: '0 9px',
        },
      }}
    />
  );
};

export default FlagBadge;

// Made with Bob
