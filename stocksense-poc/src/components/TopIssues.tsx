import React, { useMemo } from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { fmtGBP, fmtNumber } from '../utils/formatters';
import PartThumbnail from './PartThumbnail';
import type { Part } from '../types';

interface IssueItem {
  part: string;
  partData: Part;
  type: 'overstock' | 'understock';
  severity: 'Critical' | 'High';
  value: number;
  quantity: number;
}

const TopIssues: React.FC = () => {
  const { filteredParts, filters } = useData();

  const topIssues = useMemo(() => {
    const parts = filteredParts;
    const horizonKey = `over${filters.horizon}` as keyof typeof parts[0];
    const underKey = `under${filters.horizon}` as keyof typeof parts[0];
    
    const issues: IssueItem[] = [];

    // Get critical overstock issues
    parts.forEach(p => {
      const over = (p as unknown as Record<string, number>)[horizonKey];
      if (over > 0 && (p.risk === 'Critical' || p.risk === 'High')) {
        issues.push({
          part: p.part,
          partData: p,
          type: 'overstock',
          severity: p.risk as 'Critical' | 'High',
          value: p.price * over,
          quantity: over,
        });
      }
    });

    // Get critical understock issues
    parts.forEach(p => {
      const under = (p as unknown as Record<string, number>)[underKey];
      if (under > 0 && (p.shortageRisk === 'Critical' || p.shortageRisk === 'High')) {
        issues.push({
          part: p.part,
          partData: p,
          type: 'understock',
          severity: p.shortageRisk as 'Critical' | 'High',
          value: p.price * under,
          quantity: under,
        });
      }
    });

    // Sort by severity (Critical first) then by value
    return issues
      .sort((a, b) => {
        if (a.severity === 'Critical' && b.severity !== 'Critical') return -1;
        if (a.severity !== 'Critical' && b.severity === 'Critical') return 1;
        return b.value - a.value;
      })
      .slice(0, 8);
  }, [filteredParts, filters.horizon]);

  const getTypeColor = (type: string) => {
    return type === 'overstock' ? 'error' : 'info';
  };

  if (topIssues.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Warning sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Top Issues
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            {filteredParts.length === 0
              ? 'No parts match the current filters.'
              : 'No critical issues found in the current view.'}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Warning sx={{ mr: 1, color: 'warning.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Top Issues Requiring Attention
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {topIssues.map((issue, index) => (
          <Paper
            key={index}
            variant="outlined"
            sx={{
              p: 2,
              display: { xs: 'grid', sm: 'flex' },
              gridTemplateColumns: { xs: '44px 1fr', sm: 'none' },
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 2,
                transform: 'translateX(4px)',
              },
            }}
          >
            <Box sx={{ gridColumn: { xs: '1', sm: 'auto' } }}>
              <PartThumbnail part={issue.partData} size={40} />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0, gridColumn: { xs: '2', sm: 'auto' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {issue.part}
                </Typography>
                <Chip
                  label={issue.severity}
                  size="small"
                  color={issue.severity === 'Critical' ? 'error' : 'warning'}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
                <Chip
                  label={issue.type === 'overstock' ? 'Overstock' : 'Understock'}
                  size="small"
                  color={getTypeColor(issue.type)}
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
            
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, minWidth: 100, gridColumn: { xs: '2', sm: 'auto' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {fmtGBP(issue.value)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fmtNumber(issue.quantity)} units
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
};

export default TopIssues;

// Made with Bob
