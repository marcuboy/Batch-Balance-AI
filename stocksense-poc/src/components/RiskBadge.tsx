import React from 'react';
import { Chip, useTheme } from '@mui/material';
import type { Part } from '../types';

interface RiskBadgeProps {
  risk: Part['risk'];
  type?: 'overstock' | 'shortage';
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, type = 'overstock' }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  if (!risk || risk === 'None') {
    return <span style={{ color: theme.palette.text.secondary, fontSize: '10px' }}>—</span>;
  }

  const isShortage = type === 'shortage';

  const config = {
    Critical: {
      bg: isShortage
        ? (isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.1)')
        : (isDark ? 'rgba(232,69,60,0.12)' : 'rgba(220,38,38,0.1)'),
      color: isShortage
        ? (isDark ? '#06B6D4' : '#0891b2')
        : (isDark ? '#E8453C' : '#dc2626'),
      border: isShortage
        ? (isDark ? 'rgba(6,182,212,0.4)' : 'rgba(6,182,212,0.3)')
        : (isDark ? 'rgba(232,69,60,0.4)' : 'rgba(220,38,38,0.3)'),
      dot: isShortage ? '#06B6D4' : '#DC2626',
    },
    High: {
      bg: isShortage
        ? (isDark ? 'rgba(6,182,212,0.10)' : 'rgba(6,182,212,0.08)')
        : (isDark ? 'rgba(245,158,11,0.12)' : 'rgba(234,88,12,0.1)'),
      color: isShortage
        ? (isDark ? '#67e8f9' : '#0891b2')
        : (isDark ? '#F59E0B' : '#ea580c'),
      border: isShortage
        ? (isDark ? 'rgba(6,182,212,0.3)' : 'rgba(6,182,212,0.25)')
        : (isDark ? 'rgba(245,158,11,0.4)' : 'rgba(234,88,12,0.3)'),
      dot: isShortage ? '#22D3EE' : '#EA580C',
    },
    Medium: {
      bg: isShortage
        ? (isDark ? 'rgba(6,182,212,0.06)' : 'rgba(6,182,212,0.05)')
        : (isDark ? 'rgba(245,158,11,0.08)' : 'rgba(234,88,12,0.08)'),
      color: isShortage
        ? (isDark ? '#a5f3fc' : '#0891b2')
        : (isDark ? '#FCD34D' : '#f59e0b'),
      border: isShortage
        ? (isDark ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.2)')
        : (isDark ? 'rgba(245,158,11,0.3)' : 'rgba(234,88,12,0.25)'),
      dot: '#F59E0B',
    },
    Low: {
      bg: isShortage
        ? (isDark ? 'rgba(6,182,212,0.04)' : 'rgba(6,182,212,0.04)')
        : (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(5,150,105,0.1)'),
      color: isShortage
        ? (isDark ? 'rgba(6,182,212,0.7)' : '#0891b2')
        : (isDark ? '#10B981' : '#059669'),
      border: isShortage
        ? (isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.15)')
        : (isDark ? 'rgba(16,185,129,0.4)' : 'rgba(5,150,105,0.3)'),
      dot: isShortage ? '#67E8F9' : '#059669',
    },
  };

  const style = config[risk];

  return (
    <Chip
      label={risk}
      size="small"
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontSize: '9px',
        fontWeight: 600,
        letterSpacing: 0,
        height: '20px',
        '& .MuiChip-label': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '0 9px',
          '&::before': {
            content: '""',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: style.dot,
            display: 'inline-block',
          },
        },
      }}
    />
  );
};

export default RiskBadge;

// Made with Bob
