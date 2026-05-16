import { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { CheckCircle, WarningAmber } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import DataTable from './DataTable';
import type { Column } from './DataTable';
import PartThumbnail from './PartThumbnail';
import { columnRenderers } from '../utils/columnRenderers';
import { fmt, fmtGBP, fmtVol } from '../utils/formatters';
import type { Part } from '../types';

export default function UnderstockTab() {
  const { filteredParts, filters } = useData();

  const understockedParts = useMemo(() => {
    const horizonKey = `under${filters.horizon}` as keyof Part;
    return filteredParts.filter((p) => (p[horizonKey] as number) > 0);
  }, [filteredParts, filters.horizon]);

  const columns = useMemo<Column[]>(() => {
    const horizonKey = `under${filters.horizon}` as keyof Part;
    const valKey = `shortageVal${filters.horizon}` as keyof Part;
    const volumeKey = `uv${filters.horizon}` as keyof Part;
    const demandKey = `d${filters.horizon}` as keyof Part;

    return [
      {
        key: 'part',
        label: 'Item',
        render: (p) => <PartThumbnail part={p} showLabel />,
      },
      { key: 'site', label: 'Site' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'vname', label: 'Vendor name' },
      { key: 'soh', label: 'Stock on hand', align: 'right', render: (p) => fmt(p.soh) },
      {
        key: String(demandKey),
        label: `${filters.horizon}d demand`,
        align: 'right',
        render: (p) => fmt(p[demandKey] as number),
      },
      {
        key: String(horizonKey),
        label: 'Shortage qty',
        align: 'right',
        render: (p) => (
          <Box component="span" sx={{ color: 'info.main', fontWeight: 800 }}>
            {fmt(p[horizonKey] as number)}
          </Box>
        ),
      },
      { key: 'shortageRisk', label: 'Shortage risk', render: columnRenderers.shortageRisk, sortable: false },
      {
        key: String(valKey),
        label: 'Value at risk',
        align: 'right',
        render: (p) => fmtGBP(p[valKey] as number),
      },
      {
        key: String(volumeKey),
        label: 'Required volume',
        align: 'right',
        render: (p) => fmtVol(p[volumeKey] as number),
      },
      { key: 'flags', label: 'Flags', render: columnRenderers.flags, sortable: false },
    ];
  }, [filters.horizon]);

  return (
    <Box sx={{ py: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <WarningAmber sx={{ color: 'info.main' }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Understock Analysis
          </Typography>
          <Typography color="text.secondary">
            {understockedParts.length.toLocaleString('en-GB')} parts with insufficient stock at a {filters.horizon}-day horizon
          </Typography>
        </Box>
      </Box>

      {understockedParts.length > 0 ? (
        <DataTable
          key={`understock-${filters.horizon}`}
          parts={understockedParts}
          columns={columns}
          defaultSort={`under${filters.horizon}`}
          defaultSortDir="desc"
          emptyTitle="No shortages match the current filters"
          emptyMessage="Try clearing filters or changing the demand horizon."
        />
      ) : (
        <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <CheckCircle sx={{ color: 'success.main', fontSize: 44, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            No Shortages Found
          </Typography>
          <Typography color="text.secondary">
            All visible parts have enough stock for the selected demand horizon.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

// Made with Bob
