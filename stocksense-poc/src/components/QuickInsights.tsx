import React, { useMemo } from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  LocalShipping,
  Inventory2,
} from '@mui/icons-material';
import { useData } from '../context/DataContext';

interface InsightItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  count?: number;
}

const QuickInsights: React.FC = () => {
  const { parts, filters } = useData();

  const insights = useMemo(() => {
    const horizonKey = `over${filters.horizon}` as keyof typeof parts[0];
    const underKey = `under${filters.horizon}` as keyof typeof parts[0];
    
    const criticalOverstock = parts.filter(p => p.risk === 'Critical').length;
    const criticalUnderstock = parts.filter(p => p.shortageRisk === 'Critical').length;
    const highValueOverstock = parts.filter(p => {
      const over = (p as unknown as Record<string, number>)[horizonKey];
      return over > 0 && p.price * over > 10000;
    }).length;
    const urgentActions = parts.filter(p => 
      p.risk === 'Critical' || p.shortageRisk === 'Critical'
    ).length;
    const balancedParts = parts.filter(p => {
      const over = (p as unknown as Record<string, number>)[horizonKey];
      const under = (p as unknown as Record<string, number>)[underKey];
      return over <= 0 && under <= 0;
    }).length;
    const balancedPercentage = ((balancedParts / parts.length) * 100).toFixed(1);

    const insightsList: InsightItem[] = [];

    if (criticalOverstock > 0) {
      insightsList.push({
        icon: <Warning />,
        title: 'Critical Overstock Alert',
        description: `${criticalOverstock} parts have critical overstock levels requiring immediate action`,
        severity: 'error',
        count: criticalOverstock,
      });
    }

    if (criticalUnderstock > 0) {
      insightsList.push({
        icon: <LocalShipping />,
        title: 'Urgent Reorder Required',
        description: `${criticalUnderstock} parts are critically understocked and may halt production`,
        severity: 'error',
        count: criticalUnderstock,
      });
    }

    if (highValueOverstock > 0) {
      insightsList.push({
        icon: <TrendingDown />,
        title: 'High-Value Overstock',
        description: `${highValueOverstock} parts have overstock value exceeding £10,000 each`,
        severity: 'warning',
        count: highValueOverstock,
      });
    }

    if (urgentActions > 0) {
      insightsList.push({
        icon: <Inventory2 />,
        title: 'Action Items',
        description: `${urgentActions} parts require immediate inventory adjustments`,
        severity: 'info',
        count: urgentActions,
      });
    }

    if (parseFloat(balancedPercentage) > 70) {
      insightsList.push({
        icon: <CheckCircle />,
        title: 'Healthy Inventory',
        description: `${balancedPercentage}% of your inventory is well-balanced`,
        severity: 'success',
      });
    }

    return insightsList;
  }, [parts, filters.horizon]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'error.main';
      case 'warning': return 'warning.main';
      case 'info': return 'info.main';
      case 'success': return 'success.main';
      default: return 'text.primary';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Quick Insights
        </Typography>
      </Box>
      
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 2,
      }}>
        {insights.map((insight, index) => (
          <Box key={index}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: '100%',
                borderLeft: 4,
                borderLeftColor: getSeverityColor(insight.severity),
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 2,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ color: getSeverityColor(insight.severity), mr: 1.5 }}>
                  {insight.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                      {insight.title}
                    </Typography>
                    {insight.count && (
                      <Chip
                        label={insight.count}
                        size="small"
                        color={insight.severity}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {insight.description}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default QuickInsights;

// Made with Bob