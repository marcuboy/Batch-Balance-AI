import { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Inventory, Inventory2 } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import DataTable from './DataTable';
import type { Column } from './DataTable';
import PartThumbnail from './PartThumbnail';
import { columnRenderers } from '../utils/columnRenderers';
import { fmt, fmtGBP, fmtVol } from '../utils/formatters';
import type { Part } from '../types';

export default function AllPartsTab() {
  const { filteredParts, filters } = useData();

  const columns = useMemo<Column[]>(() => {
    const horizonKey = `over${filters.horizon}` as keyof Part;
    const underKey = `under${filters.horizon}` as keyof Part;
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
      { key: 'analyst', label: 'Analyst' },
      { key: 'soh', label: 'Stock on hand', align: 'right', render: (p) => fmt(p.soh) },
      {
        key: String(demandKey),
        label: `${filters.horizon}d demand`,
        align: 'right',
        render: (p) => fmt(p[demandKey] as number),
      },
      {
        key: String(horizonKey),
        label: 'Over / under',
        align: 'right',
        render: (p) => {
          const over = p[horizonKey] as number;
          const under = p[underKey] as number;
          if (over > 0) {
            return (
              <Box component="span" sx={{ color: 'error.main', fontWeight: 800 }}>
                +{fmt(over)}
              </Box>
            );
          }
          if (under > 0) {
            return (
              <Box component="span" sx={{ color: 'info.main', fontWeight: 800 }}>
                -{fmt(under)}
              </Box>
            );
          }
          return (
            <Box component="span" sx={{ color: 'success.main', fontWeight: 800 }}>
              Balanced
            </Box>
          );
        },
      },
      { key: 'risk', label: 'Overstock risk', render: columnRenderers.risk, sortable: false },
      { key: 'shortageRisk', label: 'Shortage risk', render: columnRenderers.shortageRisk, sortable: false },
      {
        key: String(volKey),
        label: 'Volume',
        align: 'right',
        render: (p) => {
          const volume = p[volKey] as number;
          return volume > 0 ? fmtVol(volume) : '—';
        },
      },
      {
        key: String(valKey),
        label: 'Value',
        align: 'right',
        render: (p) => {
          const value = p[valKey] as number;
          return value > 0 ? fmtGBP(value) : '—';
        },
      },
      { key: 'flags', label: 'Flags', render: columnRenderers.flags, sortable: false },
    ];
  }, [filters.horizon]);

  return (
    <Box sx={{ py: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Inventory2 sx={{ color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            All Parts
          </Typography>
          <Typography color="text.secondary">
            Complete inventory view for {filteredParts.length.toLocaleString('en-GB')} visible parts
          </Typography>
        </Box>
      </Box>

      {filteredParts.length > 0 ? (
        <DataTable
          key={`all-parts-${filters.horizon}`}
          parts={filteredParts}
          columns={columns}
          defaultSort="part"
          defaultSortDir="asc"
        />
      ) : (
        <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Inventory sx={{ color: 'text.secondary', fontSize: 44, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            No Parts Match
          </Typography>
          <Typography color="text.secondary">
            Clear filters or load another data set to see inventory rows.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

// Made with Bob
