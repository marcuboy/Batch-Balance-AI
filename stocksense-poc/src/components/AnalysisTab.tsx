import { useMemo } from 'react';
import { Box, Chip, Paper, Typography, useTheme } from '@mui/material';
import {
  AutoGraph,
  BubbleChart,
  Insights,
  QueryStats,
  StackedBarChart,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Bar, Bubble, Doughnut, Line } from 'react-chartjs-2';
import { useData } from '../context/DataContext';
import ChartCard from './ChartCard';
import { fmt, fmtGBP, fmtVol } from '../utils/formatters';
import type { Part } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const horizons = [30, 60, 90, 120] as const;
const riskLevels = ['Critical', 'High', 'Medium', 'Low', 'None'] as const;

const riskColors: Record<string, string> = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#F59E0B',
  Low: '#10B981',
  None: '#94A3B8',
};

const shortageColors: Record<string, string> = {
  Critical: '#0284C7',
  High: '#06B6D4',
  Medium: '#14B8A6',
  Low: '#10B981',
  None: '#94A3B8',
};

const getNumeric = (part: Part, key: string) => Number((part as unknown as Record<string, number>)[key] || 0);

export default function AnalysisTab() {
  const { filteredParts, filters } = useData();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const parts = filteredParts;
  const horizon = filters.horizon;

  const axisColor = theme.palette.text.secondary;
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,37,31,0.08)';

  const summary = useMemo(() => {
    const overKey = `over${horizon}`;
    const underKey = `under${horizon}`;
    const valueKey = `osVal${horizon}`;
    const shortageValueKey = `shortageVal${horizon}`;
    const volumeKey = `ov${horizon}`;

    const overstocked = parts.filter((p) => getNumeric(p, overKey) > 0);
    const understocked = parts.filter((p) => getNumeric(p, underKey) > 0);
    const cashLocked = parts.reduce((sum, p) => sum + getNumeric(p, valueKey), 0);
    const shortageExposure = parts.reduce((sum, p) => sum + getNumeric(p, shortageValueKey), 0);
    const spaceRecovery = parts.reduce((sum, p) => sum + getNumeric(p, volumeKey), 0);

    return { overstocked, understocked, cashLocked, shortageExposure, spaceRecovery };
  }, [horizon, parts]);

  const vendorOverstockData = useMemo<ChartData<'bar'>>(() => {
    const overKey = `over${horizon}`;
    const vendorMap = new Map<string, number>();

    parts.forEach((part) => {
      const qty = getNumeric(part, overKey);
      if (qty > 0) vendorMap.set(part.vname, (vendorMap.get(part.vname) || 0) + qty);
    });

    const sorted = Array.from(vendorMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return {
      labels: sorted.map(([vendor]) => vendor),
      datasets: [
        {
          label: 'Overstock units',
          data: sorted.map(([, qty]) => qty),
          backgroundColor: 'rgba(239, 68, 68, 0.72)',
          borderColor: '#EF4444',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [horizon, parts]);

  const analystExposureData = useMemo<ChartData<'bar'>>(() => {
    const valueKey = `osVal${horizon}`;
    const analystMap = new Map<string, number>();

    parts.forEach((part) => {
      const value = getNumeric(part, valueKey);
      if (value > 0) analystMap.set(part.analyst || 'Unassigned', (analystMap.get(part.analyst || 'Unassigned') || 0) + value);
    });

    const sorted = Array.from(analystMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return {
      labels: sorted.map(([analyst]) => analyst),
      datasets: [
        {
          label: 'Overstock value',
          data: sorted.map(([, value]) => value),
          backgroundColor: sorted.map((_, index) => ['#007A72', '#0284C7', '#F59E0B', '#EF4444', '#7C3AED'][index % 5]),
          borderWidth: 0,
          borderRadius: 6,
        },
      ],
    };
  }, [horizon, parts]);

  const riskData = useMemo<ChartData<'doughnut'>>(() => {
    const counts = Object.fromEntries(riskLevels.map((risk) => [risk, 0])) as Record<string, number>;
    parts.forEach((part) => {
      counts[part.risk] += 1;
    });

    return {
      labels: [...riskLevels],
      datasets: [
        {
          label: 'Overstock risk',
          data: riskLevels.map((risk) => counts[risk]),
          backgroundColor: riskLevels.map((risk) => riskColors[risk]),
          borderColor: theme.palette.background.paper,
          borderWidth: 3,
        },
      ],
    };
  }, [parts, theme.palette.background.paper]);

  const shortageRiskData = useMemo<ChartData<'doughnut'>>(() => {
    const counts = Object.fromEntries(riskLevels.map((risk) => [risk, 0])) as Record<string, number>;
    parts.forEach((part) => {
      counts[part.shortageRisk] += 1;
    });

    return {
      labels: [...riskLevels],
      datasets: [
        {
          label: 'Shortage risk',
          data: riskLevels.map((risk) => counts[risk]),
          backgroundColor: riskLevels.map((risk) => shortageColors[risk]),
          borderColor: theme.palette.background.paper,
          borderWidth: 3,
        },
      ],
    };
  }, [parts, theme.palette.background.paper]);

  const bubbleData = useMemo<ChartData<'bubble'>>(() => {
    const overKey = `over${horizon}`;
    const valueKey = `osVal${horizon}`;
    const volumeKey = `ov${horizon}`;
    const points = parts
      .filter((part) => getNumeric(part, overKey) > 0)
      .sort((a, b) => getNumeric(b, valueKey) - getNumeric(a, valueKey))
      .slice(0, 70);

    return {
      datasets: riskLevels
        .filter((risk) => risk !== 'None')
        .map((risk) => ({
          label: risk,
          data: points
            .filter((part) => part.risk === risk)
            .map((part) => ({
              x: getNumeric(part, volumeKey),
              y: getNumeric(part, valueKey),
              r: Math.min(22, Math.max(5, Math.sqrt(getNumeric(part, overKey)) / 4)),
              part: part.part,
              qty: getNumeric(part, overKey),
              vendor: part.vname,
            })),
          backgroundColor: `${riskColors[risk]}B3`,
          borderColor: riskColors[risk],
          borderWidth: 1,
        })),
    };
  }, [horizon, parts]);

  const topVolumeData = useMemo<ChartData<'bar'>>(() => {
    const volumeKey = `ov${horizon}`;
    const sorted = parts
      .filter((part) => getNumeric(part, volumeKey) > 0)
      .sort((a, b) => getNumeric(b, volumeKey) - getNumeric(a, volumeKey))
      .slice(0, 10);

    return {
      labels: sorted.map((part) => part.part),
      datasets: [
        {
          label: 'Overstock volume',
          data: sorted.map((part) => getNumeric(part, volumeKey)),
          backgroundColor: 'rgba(6, 182, 212, 0.72)',
          borderColor: '#06B6D4',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [horizon, parts]);

  const horizonData = useMemo<ChartData<'line'>>(() => {
    return {
      labels: horizons.map((value) => `${value}d`),
      datasets: [
        {
          label: 'Overstock units',
          data: horizons.map((value) => parts.reduce((sum, part) => sum + Math.max(0, getNumeric(part, `over${value}`)), 0)),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          fill: true,
          tension: 0.35,
        },
        {
          label: 'Shortage units',
          data: horizons.map((value) => parts.reduce((sum, part) => sum + Math.max(0, getNumeric(part, `under${value}`)), 0)),
          borderColor: '#0284C7',
          backgroundColor: 'rgba(2, 132, 199, 0.10)',
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }, [parts]);

  const commonPlugins = {
    legend: {
      labels: {
        color: theme.palette.text.primary,
        usePointStyle: true,
        boxWidth: 8,
        font: { size: 11, weight: 600 },
      },
    },
    tooltip: {
      backgroundColor: isDark ? '#0B1512' : '#FFFFFF',
      titleColor: theme.palette.text.primary,
      bodyColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      padding: 12,
    },
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: commonPlugins,
    scales: {
      x: {
        ticks: { color: axisColor, callback: (value) => fmt(Number(value)) },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: axisColor },
        grid: { display: false },
      },
    },
  };

  const valueBarOptions: ChartOptions<'bar'> = {
    ...barOptions,
    scales: {
      ...barOptions.scales,
      x: {
        ticks: { color: axisColor, callback: (value) => fmtGBP(Number(value)) },
        grid: { color: gridColor },
      },
    },
  };

  const verticalVolumeOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: commonPlugins,
    scales: {
      x: { ticks: { color: axisColor }, grid: { display: false } },
      y: {
        ticks: { color: axisColor, callback: (value) => fmtVol(Number(value)).replace(' m³', '') },
        grid: { color: gridColor },
      },
    },
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      ...commonPlugins,
      legend: {
        ...commonPlugins.legend,
        position: 'bottom',
      },
    },
  };

  const bubbleOptions: ChartOptions<'bubble'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...commonPlugins,
      tooltip: {
        ...commonPlugins.tooltip,
        callbacks: {
          label: (context) => {
            const raw = context.raw as { x: number; y: number; qty: number; part: string; vendor: string };
            return [`${raw.part} · ${raw.vendor}`, `Space: ${fmtVol(raw.x)}`, `Value: ${fmtGBP(raw.y)}`, `Qty: ${fmt(raw.qty)}`];
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Overstock volume', color: axisColor },
        ticks: { color: axisColor, callback: (value) => fmtVol(Number(value)).replace(' m³', '') },
        grid: { color: gridColor },
      },
      y: {
        title: { display: true, text: 'Overstock value', color: axisColor },
        ticks: { color: axisColor, callback: (value) => fmtGBP(Number(value)) },
        grid: { color: gridColor },
      },
    },
  };

  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: commonPlugins,
    scales: {
      x: { ticks: { color: axisColor }, grid: { color: gridColor } },
      y: { ticks: { color: axisColor, callback: (value) => fmt(Number(value)) }, grid: { color: gridColor } },
    },
  };

  if (parts.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <AutoGraph sx={{ color: 'primary.main', fontSize: 48, mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          No Analysis Available
        </Typography>
        <Typography color="text.secondary">
          Clear filters or load data to generate inventory intelligence charts.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ py: { xs: 1, md: 2 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            Analysis Command Center
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Prioritize cash, space, and production risk across {parts.length.toLocaleString('en-GB')} visible parts.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip icon={<Insights />} label={`${summary.overstocked.length} overstock`} color="error" variant="outlined" />
          <Chip icon={<QueryStats />} label={`${summary.understocked.length} understock`} color="info" variant="outlined" />
          <Chip label={fmtVol(summary.spaceRecovery)} color="primary" variant="outlined" />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.25 }}>
          <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Cash locked in overstock
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'error.main', mt: 0.75 }}>
            {fmtGBP(summary.cashLocked)}
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.25 }}>
          <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Shortage value at risk
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'info.main', mt: 0.75 }}>
            {fmtGBP(summary.shortageExposure)}
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.25 }}>
          <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Space recovery opportunity
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mt: 0.75 }}>
            {fmtVol(summary.spaceRecovery)}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ mb: 3 }}>
        <ChartCard
          title="Space vs Cost Priority Matrix"
          subtitle="Each bubble is a part. X axis is overstock volume, Y axis is overstock value, bubble size is excess quantity."
          height={{ xs: 360, md: 430 }}
          action={<BubbleChart sx={{ color: 'primary.main' }} />}
        >
          <Bubble data={bubbleData} options={bubbleOptions} />
        </ChartCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <ChartCard title="Overstock Risk Mix" subtitle="Where cash is tied up fastest." height={{ xs: 300, md: 360 }}>
          <Doughnut data={riskData} options={doughnutOptions} />
        </ChartCard>
        <ChartCard title="Shortage Risk Mix" subtitle="Where production exposure is highest." height={{ xs: 300, md: 360 }}>
          <Doughnut data={shortageRiskData} options={doughnutOptions} />
        </ChartCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <ChartCard
          title="Overstock Exposure by Analyst"
          subtitle="Value of excess stock owned by each planning queue."
          action={<StackedBarChart sx={{ color: 'secondary.main' }} />}
        >
          <Bar data={analystExposureData} options={valueBarOptions} />
        </ChartCard>
        <ChartCard
          title="Top Vendors by Overstock Units"
          subtitle={`Largest suppliers by ${horizon}-day excess quantity.`}
        >
          <Bar data={vendorOverstockData} options={barOptions} />
        </ChartCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        <ChartCard
          title="Top Parts by Overstock Volume"
          subtitle="Best candidates for warehouse space recovery."
        >
          <Bar data={topVolumeData} options={verticalVolumeOptions} />
        </ChartCard>
        <ChartCard
          title="Inventory Imbalance Across Horizons"
          subtitle="Compare overstock and shortage quantity as the planning window expands."
        >
          <Line data={horizonData} options={lineOptions} />
        </ChartCard>
      </Box>
    </Box>
  );
}

// Made with Bob
