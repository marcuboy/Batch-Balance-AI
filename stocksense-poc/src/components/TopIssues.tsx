import React, { useMemo } from 'react';
import { Box, Paper, Typography, Chip, Avatar } from '@mui/material';
import { Warning, TrendingDown, LocalShipping } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { fmtGBP, fmtNumber } from '../utils/formatters';

interface IssueItem {
  part: string;
  type: 'overstock' | 'understock';
  severity: 'Critical' | 'High';
  value: number;
  quantity: number;
}

const TopIssues: React.FC = () => {
  const { parts, filters } = useData();

  const topIssues = useMemo(() => {
    const horizonKey = `over${filters.horizon}` as keyof typeof parts[0];
    const underKey = `under${filters.horizon}` as keyof typeof parts[0];
    
    const issues: IssueItem[] = [];

    // Get critical overstock issues
    parts.forEach(p => {
      const over = (p as unknown as Record<string, number>)[horizonKey];
      if (over > 0 && (p.risk === 'Critical' || p.risk === 'High')) {
        issues.push({
          part: p.part,
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
  }, [parts, filters.horizon]);

  const getTypeIcon = (type: string) => {
    return type === 'overstock' ? <TrendingDown /> : <LocalShipping />;
  };

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
            No critical issues found! Your inventory is well-balanced.
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
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 2,
                transform: 'translateX(4px)',
              },
            }}
          >
            <Avatar
              sx={{
                bgcolor: `${getTypeColor(issue.type)}.main`,
                width: 40,
                height: 40,
              }}
            >
              {getTypeIcon(issue.type)}
            </Avatar>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontFamily: 'monospace',
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
            
            <Box sx={{ textAlign: 'right', minWidth: 100 }}>
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