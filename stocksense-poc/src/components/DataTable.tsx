import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowDownward,
  ArrowUpward,
  ChevronLeft,
  ChevronRight,
  UnfoldMore,
} from '@mui/icons-material';
import type { Part } from '../types';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (part: Part) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps {
  parts: Part[];
  columns: Column[];
  defaultSort?: string;
  defaultSortDir?: 'asc' | 'desc';
  emptyTitle?: string;
  emptyMessage?: string;
}

const rowsPerPage = 50;

export default function DataTable({
  parts,
  columns,
  defaultSort = 'part',
  defaultSortDir = 'asc',
  emptyTitle = 'No rows found',
  emptyMessage = 'Adjust filters or load another data set to see matching parts.',
}: DataTableProps) {
  const theme = useTheme();
  const [sortKey, setSortKey] = useState(defaultSort);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir);
  const [page, setPage] = useState(0);

  const sortedParts = useMemo(() => {
    return [...parts].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortKey];
      const bVal = (b as unknown as Record<string, unknown>)[sortKey];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [parts, sortDir, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedParts.length / rowsPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedParts = sortedParts.slice(safePage * rowsPerPage, (safePage + 1) * rowsPerPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const SortIcon = ({ columnKey, sortable }: { columnKey: string; sortable: boolean }) => {
    if (!sortable) return null;
    if (sortKey !== columnKey) {
      return <UnfoldMore sx={{ fontSize: 16, color: 'text.disabled' }} />;
    }
    return sortDir === 'asc' ? (
      <ArrowUpward sx={{ fontSize: 14, color: 'primary.main' }} />
    ) : (
      <ArrowDownward sx={{ fontSize: 14, color: 'primary.main' }} />
    );
  };

  if (sortedParts.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {emptyTitle}
        </Typography>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          overflowX: 'auto',
          borderRadius: 2,
          '& table': {
            minWidth: 980,
          },
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => {
                const sortable = col.sortable !== false;
                return (
                  <TableCell
                    key={col.key}
                    align={col.align || 'left'}
                    onClick={() => sortable && handleSort(col.key)}
                    sx={{
                      py: 1.75,
                      px: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#F1F6F4',
                      color: 'text.secondary',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: 0,
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      cursor: sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start',
                        width: '100%',
                      }}
                    >
                      {col.label}
                      <SortIcon columnKey={col.key} sortable={sortable} />
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedParts.map((part, idx) => (
              <TableRow
                key={`${part.site}-${part.part}-${safePage}-${idx}`}
                hover
                sx={{
                  '&:last-child td': { borderBottom: 0 },
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    align={col.align || 'left'}
                    sx={{
                      py: 1.6,
                      px: 2,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {col.render
                      ? col.render(part)
                      : String((part as unknown as Record<string, unknown>)[col.key] || '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          bgcolor: 'background.paper',
        }}
      >
        <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          Showing {safePage * rowsPerPage + 1}-{Math.min((safePage + 1) * rowsPerPage, sortedParts.length)} of{' '}
          {sortedParts.length}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
          <Button
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            variant="outlined"
            size="small"
            startIcon={<ChevronLeft />}
          >
            Previous
          </Button>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', minWidth: 82, textAlign: 'center' }}>
            {safePage + 1} / {totalPages}
          </Typography>
          <Button
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(safePage + 1)}
            variant="contained"
            size="small"
            endIcon={<ChevronRight />}
          >
            Next
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

// Made with Bob
