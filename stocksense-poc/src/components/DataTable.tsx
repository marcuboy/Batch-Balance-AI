import { useState } from 'react';
import { useTheme } from '@mui/material';
import type { Part } from '../types';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (part: Part) => React.ReactNode;
}

interface DataTableProps {
  parts: Part[];
  columns: Column[];
  defaultSort?: string;
  defaultSortDir?: 'asc' | 'desc';
}

export default function DataTable({ 
  parts, 
  columns, 
  defaultSort = 'part', 
  defaultSortDir = 'asc' 
}: DataTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [sortKey, setSortKey] = useState(defaultSort);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir);
  const [page, setPage] = useState(0);
  const rowsPerPage = 50;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const sortedParts = [...parts].sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sortKey];
    const bVal = (b as unknown as Record<string, unknown>)[sortKey];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal || '');
    const bStr = String(bVal || '');
    return sortDir === 'asc' 
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const paginatedParts = sortedParts.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(sortedParts.length / rowsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        overflowX: 'auto',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '8px',
        backgroundColor: theme.palette.background.paper
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${theme.palette.divider}` }}>
              {columns.map(col => (
                <th 
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                  }}
                >
                  {col.label}
                  {col.sortable !== false && sortKey === col.key && (
                    <span style={{ marginLeft: '4px' }}>
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedParts.map((part, idx) => (
              <tr 
                key={`${part.site}-${part.part}-${idx}`}
                style={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {columns.map(col => (
                  <td 
                    key={col.key}
                    style={{
                      padding: '12px 16px',
                      color: theme.palette.text.primary,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {col.render ? col.render(part) : String((part as unknown as Record<string, unknown>)[col.key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`
      }}>
        <div style={{ color: theme.palette.text.primary, fontSize: '14px' }}>
          Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, sortedParts.length)} of {sortedParts.length}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            style={{
              padding: '8px 16px',
              backgroundColor: page === 0 ? theme.palette.action.disabledBackground : theme.palette.primary.main,
              color: page === 0 ? theme.palette.action.disabled : theme.palette.primary.contrastText,
              border: 'none',
              borderRadius: '4px',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Previous
          </button>
          <div style={{
            color: theme.palette.text.primary,
            fontSize: '14px',
            padding: '0 8px'
          }}>
            Page {page + 1} of {totalPages}
          </div>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            style={{
              padding: '8px 16px',
              backgroundColor: page >= totalPages - 1 ? theme.palette.action.disabledBackground : theme.palette.primary.main,
              color: page >= totalPages - 1 ? theme.palette.action.disabled : theme.palette.primary.contrastText,
              border: 'none',
              borderRadius: '4px',
              cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
