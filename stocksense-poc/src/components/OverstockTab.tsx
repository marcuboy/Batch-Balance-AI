import { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { CheckCircle, Inventory2 } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import DataTable from './DataTable';
import type { Column } from './DataTable';
import PartThumbnail from './PartThumbnail';
import { columnRenderers } from '../utils/columnRenderers';
import { fmt, fmtGBP, fmtVol } from '../utils/formatters';
import type { Part } from '../types';

export default function OverstockTab() {
  const { filteredParts, filters } = useData();

  const overstockedParts = useMemo(() => {
    const horizonKey = `over${filters.horizon}` as keyof Part;
    return filteredParts.filter((p) => (p[horizonKey] as number) > 0);
  }, [filteredParts, filters.horizon]);

  const columns = useMemo<Column[]>(() => {
    const horizonKey = `over${filters.horizon}` as keyof Part;
    const volKey = `ov${filters.horizon}` as keyof Part;
    const valKey = `osVal${filters.horizon}` as keyof Part;
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
        label: 'Overstock qty',
        align: 'right',
        render: (p) => (
          <Box component="span" sx={{ color: 'error.main', fontWeight: 800 }}>
            {fmt(p[horizonKey] as number)}
          </Box>
        ),
      },
      { key: 'risk', label: 'Risk', render: columnRenderers.risk, sortable: false },
      {
        key: String(volKey),
        label: 'Volume',
        align: 'right',
        render: (p) => fmtVol(p[volKey] as number),
      },
      {
        key: String(valKey),
        label: 'Value',
        align: 'right',
        render: (p) => fmtGBP(p[valKey] as number),
      },
      { key: 'flags', label: 'Flags', render: columnRenderers.flags, sortable: false },
    ];
  }, [filters.horizon]);

  return (
    <Box sx={{ py: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Inventory2 sx={{ color: 'error.main' }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Overstock Analysis
          </Typography>
          <Typography color="text.secondary">
            {overstockedParts.length.toLocaleString('en-GB')} parts with excess stock at a {filters.horizon}-day horizon
          </Typography>
        </Box>
      </Box>

      {overstockedParts.length > 0 ? (
        <DataTable
          key={`overstock-${filters.horizon}`}
          parts={overstockedParts}
          columns={columns}
          defaultSort={`over${filters.horizon}`}
          defaultSortDir="desc"
          emptyTitle="No overstock matches the current filters"
          emptyMessage="Try clearing filters or changing the demand horizon."
        />
      ) : (
        <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <CheckCircle sx={{ color: 'success.main', fontSize: 44, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            No Overstock Found
          </Typography>
          <Typography color="text.secondary">
            All visible parts are within demand requirements for the selected horizon.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

// Made with Bob
