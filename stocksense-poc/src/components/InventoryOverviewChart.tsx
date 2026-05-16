import React, { useMemo } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { useData } from '../context/DataContext';

const InventoryOverviewChart: React.FC = () => {
  const { parts, filters } = useData();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const chartData = useMemo(() => {
    const horizonKey = `over${filters.horizon}` as keyof typeof parts[0];
    const underKey = `under${filters.horizon}` as keyof typeof parts[0];

    // Group by risk level
    const riskGroups = {
      'Critical': { overstock: 0, understock: 0, balanced: 0 },
      'High': { overstock: 0, understock: 0, balanced: 0 },
      'Medium': { overstock: 0, understock: 0, balanced: 0 },
      'Low': { overstock: 0, understock: 0, balanced: 0 },
      'None': { overstock: 0, understock: 0, balanced: 0 },
    };

    parts.forEach(p => {
      const over = (p as unknown as Record<string, number>)[horizonKey];
      const under = (p as unknown as Record<string, number>)[underKey];
      const risk = p.risk in riskGroups ? p.risk : 'None';

      if (over > 0) {
        riskGroups[risk as keyof typeof riskGroups].overstock++;
      } else if (under > 0) {
        riskGroups[risk as keyof typeof riskGroups].understock++;
      } else {
        riskGroups[risk as keyof typeof riskGroups].balanced++;
      }
    });

    return {
      labels: ['Critical', 'High', 'Medium', 'Low', 'None'],
      datasets: [
        {
          label: 'Overstock',
          data: Object.values(riskGroups).map(g => g.overstock),
          backgroundColor: 'rgba(255, 107, 107, 0.8)',
          borderColor: 'rgba(255, 107, 107, 1)',
          borderWidth: 1,
        },
        {
          label: 'Understock',
          data: Object.values(riskGroups).map(g => g.understock),
          backgroundColor: 'rgba(78, 205, 196, 0.8)',
          borderColor: 'rgba(78, 205, 196, 1)',
          borderWidth: 1,
        },
        {
          label: 'Balanced',
          data: Object.values(riskGroups).map(g => g.balanced),
          backgroundColor: 'rgba(149, 225, 211, 0.8)',
          borderColor: 'rgba(149, 225, 211, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [parts, filters.horizon]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary,
          font: {
            size: 11,
          },
          padding: 10,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { 
          color: theme.palette.text.primary,
          font: { size: 10 },
        },
        grid: { 
          color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        },
      },
      y: {
        stacked: true,
        ticks: { 
          color: theme.palette.text.primary,
          font: { size: 10 },
        },
        grid: { 
          color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
        Inventory Status by Risk Level
      </Typography>
      <Box sx={{ height: 280 }}>
        <Bar data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

export default InventoryOverviewChart;

// Made with Bob