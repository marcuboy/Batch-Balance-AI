import { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { CheckCircle, SearchOff, WarningAmber } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import DataTable from './DataTable';
import type { Column } from './DataTable';
import { columnRenderers } from '../utils/columnRenderers';
import { fmt, fmtGBP } from '../utils/formatters';
import type { Part } from '../types';

export default function NotOnMRPTab() {
  const { filteredParts } = useData();

  const notOnMRPParts = useMemo(() => {
    return filteredParts.filter((p) => p.d30 === 0 && p.d60 === 0 && p.d90 === 0 && p.d120 === 0);
  }, [filteredParts]);

  const columns = useMemo<Column[]>(
    () => [
      { key: 'part', label: 'Part number' },
      { key: 'site', label: 'Site' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'vname', label: 'Vendor name' },
      { key: 'analyst', label: 'Analyst' },
      {
        key: 'soh',
        label: 'Stock on hand',
        align: 'right',
        render: (p: Part) => (
          <Box component="span" sx={{ color: 'warning.main', fontWeight: 800 }}>
            {fmt(p.soh)}
          </Box>
        ),
      },
      {
        key: 'price',
        label: 'Unit price',
        align: 'right',
        render: (p: Part) => (p.price > 0 ? fmtGBP(p.price) : '—'),
      },
      {
        key: 'value',
        label: 'Total value',
        align: 'right',
        render: (p: Part) => (p.price > 0 ? fmtGBP(p.soh * p.price) : '—'),
      },
      { key: 'flags', label: 'Flags', render: columnRenderers.flags, sortable: false },
    ],
    []
  );

  return (
    <Box sx={{ py: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <SearchOff sx={{ color: 'warning.main' }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Not on MRP
          </Typography>
          <Typography color="text.secondary">
            {notOnMRPParts.length.toLocaleString('en-GB')} stocked parts with no demand forecast
          </Typography>
        </Box>
      </Box>

      {notOnMRPParts.length > 0 ? (
        <>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 2.5 },
              mb: 2,
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
              borderColor: 'warning.light',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.10)',
            }}
          >
            <WarningAmber sx={{ color: 'warning.main', mt: 0.25 }} />
            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Action Required</Typography>
              <Typography color="text.secondary">
                These rows have stock on hand but no demand in the MRP system. Review with planning before disposition.
              </Typography>
            </Box>
          </Paper>

          <DataTable parts={notOnMRPParts} columns={columns} defaultSort="soh" defaultSortDir="desc" />
        </>
      ) : (
        <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <CheckCircle sx={{ color: 'success.main', fontSize: 44, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            All Parts on MRP
          </Typography>
          <Typography color="text.secondary">
            Every visible stocked part has a corresponding demand forecast.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

// Made with Bob
