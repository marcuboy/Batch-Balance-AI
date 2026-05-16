import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import DataTable from './DataTable';
import { columnRenderers } from '../utils/columnRenderers';
import { fmt, fmtGBP, fmtVol } from '../utils/formatters';

export default function AllPartsTab() {
  const { filteredParts, filters } = useData();

  const columns = useMemo(() => {
    const horizonKey = `over${filters.horizon}` as keyof typeof filteredParts[0];
    const underKey = `under${filters.horizon}` as keyof typeof filteredParts[0];
    const volKey = `ov${filters.horizon}` as keyof typeof filteredParts[0];
    const valKey = `osVal${filters.horizon}` as keyof typeof filteredParts[0];

    return [
      { key: 'part', label: 'Part Number' },
      { key: 'site', label: 'Site' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'vname', label: 'Vendor Name' },
      { key: 'analyst', label: 'Analyst' },
      { key: 'soh', label: 'Stock on Hand', render: (p) => fmt(p.soh) },
      { 
        key: `d${filters.horizon}`, 
        label: `${filters.horizon}d Demand`, 
        render: (p) => fmt((p as unknown as Record<string, number>)[`d${filters.horizon}`])
      },
      { 
        key: horizonKey, 
        label: 'Over/Under', 
        render: (p) => {
          const over = (p as unknown as Record<string, number>)[horizonKey];
          const under = (p as unknown as Record<string, number>)[underKey];
          if (over > 0) {
            return <span style={{ color: '#FF6B6B', fontWeight: 600 }}>+{fmt(over)}</span>;
          } else if (under > 0) {
            return <span style={{ color: '#4ECDC4', fontWeight: 600 }}>-{fmt(under)}</span>;
          }
          return <span style={{ color: '#95E1D3' }}>0</span>;
        }
      },
      { key: 'risk', label: 'Overstock Risk', render: columnRenderers.risk, sortable: false },
      { key: 'shortageRisk', label: 'Shortage Risk', render: columnRenderers.shortageRisk, sortable: false },
      { 
        key: volKey, 
        label: 'Volume (m³)', 
        render: (p) => {
          const vol = (p as unknown as Record<string, number>)[volKey];
          return vol > 0 ? fmtVol(vol) : '-';
        }
      },
      { 
        key: valKey, 
        label: 'Value (GBP)', 
        render: (p) => {
          const val = (p as unknown as Record<string, number>)[valKey];
          return val > 0 ? fmtGBP(val) : '-';
        }
      },
      { key: 'flags', label: 'Flags', render: columnRenderers.flags, sortable: false },
    ];
  }, [filters.horizon]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          color: '#F0F4F2', 
          fontSize: '24px', 
          fontWeight: 600,
          marginBottom: '8px',
          fontFamily: 'Bebas Neue, sans-serif',
          letterSpacing: '1px'
        }}>
          🗂️ ALL PARTS
        </h2>
        <p style={{ color: 'rgba(240,244,242,0.7)', fontSize: '14px' }}>
          Complete inventory view - {filteredParts.length} parts across all sites
        </p>
      </div>

      {filteredParts.length > 0 ? (
        <DataTable
          parts={filteredParts}
          columns={columns}
          defaultSort="part"
          defaultSortDir="asc"
        />
      ) : (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ 
            color: '#F0F4F2', 
            fontSize: '20px', 
            fontWeight: 600,
            marginBottom: '8px'
          }}>
            No Data Loaded
          </h3>
          <p style={{ color: 'rgba(240,244,242,0.7)', fontSize: '14px' }}>
            Upload your MRP and Stock files to see all parts
          </p>
        </div>
      )}
    </div>
  );
}

// Made with Bob
