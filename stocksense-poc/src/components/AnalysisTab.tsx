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
  const { parts, filteredParts, filters } = useData();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const horizon = filters.horizon;

  const axisColor = theme.palette.text.secondary;
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,37,31,0.08)';

  const summary = useMemo(() => {
    const overKey = `over${horizon}`;
    const underKey = `under${horizon}`;
    const valueKey = `osVal${horizon}`;
    const shortageValueKey = `shortageVal${horizon}`;
    const volumeKey = `ov${horizon}`;

    const overstocked = filteredParts.filter((p) => getNumeric(p, overKey) > 0);
    const understocked = filteredParts.filter((p) => getNumeric(p, underKey) > 0);
    const cashLocked = filteredParts.reduce((sum, p) => sum + getNumeric(p, valueKey), 0);
    const shortageExposure = filteredParts.reduce((sum, p) => sum + getNumeric(p, shortageValueKey), 0);
    const spaceRecovery = filteredParts.reduce((sum, p) => sum + getNumeric(p, volumeKey), 0);

    return { overstocked, understocked, cashLocked, shortageExposure, spaceRecovery };
  }, [filteredParts, horizon]);

  const vendorOverstockData = useMemo<ChartData<'bar'>>(() => {
    const overKey = `over${horizon}`;
    const underKey = `under${horizon}`;
    const vendorMap = new Map<string, { overstock: number; shortage: number }>();

    parts.forEach((part) => {
      const vendor = part.vname || part.vendor || 'Unassigned';
      const current = vendorMap.get(vendor) || { overstock: 0, shortage: 0 };
      const overstock = getNumeric(part, overKey);
      const shortage = getNumeric(part, underKey);
      if (overstock > 0) current.overstock += overstock;
      if (shortage > 0) current.shortage += shortage;
      if (current.overstock > 0 || current.shortage > 0) vendorMap.set(vendor, current);
    });

    const sorted = Array.from(vendorMap.entries())
      .sort((a, b) => b[1].overstock + b[1].shortage - (a[1].overstock + a[1].shortage))
      .slice(0, 8);
    return {
      labels: sorted.map(([vendor]) => vendor),
      datasets: [
        {
          label: 'Overstock Units',
          data: sorted.map(([, values]) => values.overstock),
          backgroundColor: 'rgba(239, 68, 68, 0.74)',
          borderColor: '#EF4444',
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'Shortage Units',
          data: sorted.map(([, values]) => values.shortage),
          backgroundColor: 'rgba(2, 132, 199, 0.74)',
          borderColor: '#0284C7',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [horizon, parts]);

  const analystExposureData = useMemo<ChartData<'bar'>>(() => {
    const overKey = `over${horizon}`;
    const underKey = `under${horizon}`;
    const valueKey = `osVal${horizon}`;
    const shortageValueKey = `shortageVal${horizon}`;
    const analystMap = new Map<string, { overstock: number; shortage: number }>();

    parts.forEach((part) => {
      const analyst = part.analyst || 'Unassigned';
      const current = analystMap.get(analyst) || { overstock: 0, shortage: 0 };
      if (getNumeric(part, overKey) > 0) current.overstock += getNumeric(part, valueKey);
      if (getNumeric(part, underKey) > 0) current.shortage += getNumeric(part, shortageValueKey);
      if (current.overstock > 0 || current.shortage > 0) analystMap.set(analyst, current);
    });

    const sorted = Array.from(analystMap.entries())
      .sort((a, b) => b[1].overstock + b[1].shortage - (a[1].overstock + a[1].shortage))
      .slice(0, 8);
    return {
      labels: sorted.map(([analyst]) => analyst),
      datasets: [
        {
          label: 'Overstock Value (£)',
          data: sorted.map(([, values]) => values.overstock),
          backgroundColor: 'rgba(239, 68, 68, 0.74)',
          borderColor: '#EF4444',
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'Shortage Value at Risk (£)',
          data: sorted.map(([, values]) => values.shortage),
          backgroundColor: 'rgba(2, 132, 199, 0.74)',
          borderColor: '#0284C7',
          borderWidth: 1,
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
    const underKey = `under${horizon}`;
    const overValueKey = `osVal${horizon}`;
    const shortageValueKey = `shortageVal${horizon}`;
    const overVolumeKey = `ov${horizon}`;
    const shortageVolumeKey = `uv${horizon}`;
    const bubbleRadius = (qty: number) => Math.min(22, Math.max(5, Math.sqrt(qty) / 4));

    return {
      datasets: [
        ...riskLevels
          .filter((risk) => risk !== 'None')
          .map((risk) => ({
            label: `OS: ${risk}`,
            data: parts
              .filter((part) => part.risk === risk && getNumeric(part, overKey) > 0)
              .map((part) => ({
                x: getNumeric(part, overVolumeKey),
                y: getNumeric(part, overValueKey),
                r: bubbleRadius(getNumeric(part, overKey)),
                part: part.part,
                qty: getNumeric(part, overKey),
                vendor: part.vname,
              })),
            backgroundColor: `${riskColors[risk]}B3`,
            borderColor: riskColors[risk],
            borderWidth: 1,
          })),
        ...riskLevels
          .filter((risk) => risk !== 'None')
          .map((risk) => ({
            label: `US: ${risk}`,
            data: parts
              .filter((part) => part.shortageRisk === risk && getNumeric(part, underKey) > 0)
              .map((part) => ({
                x: getNumeric(part, shortageVolumeKey),
                y: getNumeric(part, shortageValueKey),
                r: bubbleRadius(getNumeric(part, underKey)),
                part: part.part,
                qty: getNumeric(part, underKey),
                vendor: part.vname,
              })),
            backgroundColor: `${shortageColors[risk]}B3`,
            borderColor: shortageColors[risk],
            borderWidth: 1,
          })),
      ],
    };
  }, [horizon, parts]);

  const topVolumeData = useMemo<ChartData<'bar'>>(() => {
    const overKey = `over${horizon}`;
    const underKey = `under${horizon}`;
    const overVolumeKey = `ov${horizon}`;
    const shortageVolumeKey = `uv${horizon}`;
    const sorted = parts
      .map((part) => ({
        part,
        overVolume: getNumeric(part, overKey) > 0 ? getNumeric(part, overVolumeKey) : 0,
        shortageVolume: getNumeric(part, underKey) > 0 ? getNumeric(part, shortageVolumeKey) : 0,
      }))
      .filter(({ overVolume, shortageVolume }) => overVolume + shortageVolume > 0)
      .sort((a, b) => b.overVolume + b.shortageVolume - (a.overVolume + a.shortageVolume))
      .slice(0, 10);

    return {
      labels: sorted.map(({ part }) => part.part),
      datasets: [
        {
          label: 'Overstock Volume (m³)',
          data: sorted.map(({ overVolume }) => overVolume),
          backgroundColor: 'rgba(239, 68, 68, 0.74)',
          borderColor: '#EF4444',
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'Shortage Volume (m³)',
          data: sorted.map(({ shortageVolume }) => shortageVolume),
          backgroundColor: 'rgba(2, 132, 199, 0.74)',
          borderColor: '#0284C7',
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
        title: { display: true, text: 'Volume impact (m³)', color: axisColor },
        ticks: { color: axisColor, callback: (value) => fmtVol(Number(value)).replace(' m³', '') },
        grid: { color: gridColor },
      },
      y: {
        title: { display: true, text: 'Value impact (£)', color: axisColor },
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
            Prioritize cash, space, and production risk across {parts.length.toLocaleString('en-GB')} uploaded parts.
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
          subtitle="Red bubbles = overstock. Blue bubbles = understock. X axis = volume (m³), Y axis = value (£), size = quantity."
          height={{ xs: 360, md: 430 }}
          action={<BubbleChart sx={{ color: 'primary.main' }} />}
        >
          <Bubble data={bubbleData} options={bubbleOptions} />
        </ChartCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <ChartCard title="Overstock Risk Distribution" subtitle="Where cash is tied up fastest." height={{ xs: 300, md: 360 }}>
          <Doughnut data={riskData} options={doughnutOptions} />
        </ChartCard>
        <ChartCard title="Shortage Risk Distribution" subtitle="Where production exposure is highest." height={{ xs: 300, md: 360 }}>
          <Doughnut data={shortageRiskData} options={doughnutOptions} />
        </ChartCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <ChartCard
          title="Inventory Exposure by Analyst"
          subtitle="Overstock value vs shortage value at risk per planning analyst"
          action={<StackedBarChart sx={{ color: 'secondary.main' }} />}
        >
          <Bar data={analystExposureData} options={valueBarOptions} />
        </ChartCard>
        <ChartCard
          title="Top Vendors by Inventory Imbalance"
          subtitle={`Overstock and shortage units by supplier at ${horizon}-day horizon`}
        >
          <Bar data={vendorOverstockData} options={barOptions} />
        </ChartCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        <ChartCard
          title="Top Parts by Volume Impact"
          subtitle="Parts with highest warehouse space at risk from overstock or shortage"
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
