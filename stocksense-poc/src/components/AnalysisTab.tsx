import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalysisTab() {
  const { parts, filters } = useData();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Vendor Overstock Analysis
  const vendorData = useMemo(() => {
    const horizonKey = `over${filters.horizon}` as keyof typeof parts[0];
    const vendorMap = new Map<string, number>();
    
    parts.forEach(p => {
      const overstock = (p as unknown as Record<string, number>)[horizonKey];
      if (overstock > 0) {
        const current = vendorMap.get(p.vname) || 0;
        vendorMap.set(p.vname, current + overstock);
      }
    });

    const sorted = Array.from(vendorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      labels: sorted.map(([vendor]) => vendor.length > 20 ? vendor.substring(0, 20) + '...' : vendor),
      datasets: [{
        label: 'Overstock Qty',
        data: sorted.map(([, qty]) => qty),
        backgroundColor: 'rgba(255, 107, 107, 0.8)',
        borderColor: 'rgba(255, 107, 107, 1)',
        borderWidth: 1,
      }],
    };
  }, [parts, filters.horizon]);

  // Risk Distribution
  const riskData = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0, None: 0 };
    parts.forEach(p => {
      if (p.risk in counts) {
        counts[p.risk as keyof typeof counts]++;
      }
    });

    return {
      labels: ['Critical', 'High', 'Medium', 'Low', 'None'],
      datasets: [{
        label: 'Parts by Risk Level',
        data: [counts.Critical, counts.High, counts.Medium, counts.Low, counts.None],
        backgroundColor: [
          'rgba(255, 107, 107, 0.8)',
          'rgba(255, 165, 0, 0.8)',
          'rgba(255, 217, 61, 0.8)',
          'rgba(149, 225, 211, 0.8)',
          'rgba(78, 205, 196, 0.8)',
        ],
        borderColor: [
          'rgba(255, 107, 107, 1)',
          'rgba(255, 165, 0, 1)',
          'rgba(255, 217, 61, 1)',
          'rgba(149, 225, 211, 1)',
          'rgba(78, 205, 196, 1)',
        ],
        borderWidth: 1,
      }],
    };
  }, [parts]);

  // Shortage Risk Distribution
  const shortageRiskData = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0, None: 0 };
    parts.forEach(p => {
      if (p.shortageRisk in counts) {
        counts[p.shortageRisk as keyof typeof counts]++;
      }
    });

    return {
      labels: ['Critical', 'High', 'Medium', 'Low', 'None'],
      datasets: [{
        label: 'Parts by Shortage Risk',
        data: [counts.Critical, counts.High, counts.Medium, counts.Low, counts.None],
        backgroundColor: [
          'rgba(78, 205, 196, 0.8)',
          'rgba(149, 225, 211, 0.8)',
          'rgba(255, 217, 61, 0.8)',
          'rgba(255, 165, 0, 0.8)',
          'rgba(200, 200, 200, 0.8)',
        ],
        borderColor: [
          'rgba(78, 205, 196, 1)',
          'rgba(149, 225, 211, 1)',
          'rgba(255, 217, 61, 1)',
          'rgba(255, 165, 0, 1)',
          'rgba(200, 200, 200, 1)',
        ],
        borderWidth: 1,
      }],
    };
  }, [parts]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme.palette.text.primary,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: theme.palette.text.primary },
        grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
      },
      y: {
        ticks: { color: theme.palette.text.primary },
        grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: theme.palette.text.primary,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 600,
          letterSpacing: '0.5px'
        }}
      >
        📈 Analysis
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3,
        mb: 3
      }}>
        {/* Vendor Overstock Chart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Top 10 Vendors by Overstock ({filters.horizon}d)
          </Typography>
          <Box sx={{ height: 300 }}>
            <Bar data={vendorData} options={chartOptions} />
          </Box>
        </Paper>

        {/* Risk Distribution Chart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Overstock Risk Distribution
          </Typography>
          <Box sx={{ height: 300 }}>
            <Doughnut data={riskData} options={doughnutOptions} />
          </Box>
        </Paper>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3
      }}>
        {/* Shortage Risk Distribution Chart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Shortage Risk Distribution
          </Typography>
          <Box sx={{ height: 300 }}>
            <Doughnut data={shortageRiskData} options={doughnutOptions} />
          </Box>
        </Paper>

        {/* Summary Stats */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Inventory Summary
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <Typography color="text.secondary">Total Parts</Typography>
              <Typography sx={{ fontWeight: 600 }}>{parts.length}</Typography>
            </Box>
            <Box sx={{
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <Typography color="text.secondary">Overstocked</Typography>
              <Typography sx={{ fontWeight: 600 }} color="error.main">
                {parts.filter(p => (p as unknown as Record<string, number>)[`over${filters.horizon}`] > 0).length}
              </Typography>
            </Box>
            <Box sx={{
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <Typography color="text.secondary">Understocked</Typography>
              <Typography sx={{ fontWeight: 600 }} color="info.main">
                {parts.filter(p => (p as unknown as Record<string, number>)[`under${filters.horizon}`] > 0).length}
              </Typography>
            </Box>
            <Box sx={{
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <Typography color="text.secondary">Balanced</Typography>
              <Typography sx={{ fontWeight: 600 }} color="success.main">
                {parts.filter(p => {
                  const over = (p as unknown as Record<string, number>)[`over${filters.horizon}`];
                  const under = (p as unknown as Record<string, number>)[`under${filters.horizon}`];
                  return over <= 0 && under <= 0;
                }).length}
              </Typography>
            </Box>
            <Box sx={{
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <Typography color="text.secondary">Unique Vendors</Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {new Set(parts.map(p => p.vendor)).size}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

// Made with Bob
