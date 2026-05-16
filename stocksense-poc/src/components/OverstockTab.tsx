import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import DataTable from './DataTable';
import { columnRenderers } from '../utils/columnRenderers';
import { fmt, fmtGBP, fmtVol } from '../utils/formatters';

export default function OverstockTab() {
  const { filteredParts, filters } = useData();

  const overstockedParts = useMemo(() => {
    const horizonKey = `over${filters.horizon}` as keyof typeof filteredParts[0];
    return filteredParts.filter(p => (p[horizonKey] as number) > 0);
  }, [filteredParts, filters.horizon]);

  const columns = useMemo(() => {
    const horizonKey = `over${filters.horizon}` as keyof typeof filteredParts[0];
    const volKey = `ov${filters.horizon}` as keyof typeof filteredParts[0];
    const valKey = `osVal${filters.horizon}` as keyof typeof filteredParts[0];

    return [
      { key: 'part', label: 'Part Number' },
      { key: 'site', label: 'Site' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'vname', label: 'Vendor Name' },
      { key: 'soh', label: 'Stock on Hand', render: (p) => fmt(p.soh) },
      { 
        key: `d${filters.horizon}`, 
        label: `${filters.horizon}d Demand`, 
        render: (p) => fmt((p as unknown as Record<string, number>)[`d${filters.horizon}`])
      },
      { 
        key: horizonKey, 
        label: 'Overstock Qty', 
        render: (p) => <span style={{ color: '#FF6B6B', fontWeight: 600 }}>{fmt((p as unknown as Record<string, number>)[horizonKey])}</span>
      },
      { key: 'risk', label: 'Risk', render: columnRenderers.risk, sortable: false },
      { 
        key: volKey, 
        label: 'Volume (m³)', 
        render: (p) => fmtVol((p as unknown as Record<string, number>)[volKey])
      },
      { 
        key: valKey, 
        label: 'Value (GBP)', 
        render: (p) => fmtGBP((p as unknown as Record<string, number>)[valKey])
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
          📋 OVERSTOCK ANALYSIS
        </h2>
        <p style={{ color: 'rgba(240,244,242,0.7)', fontSize: '14px' }}>
          {overstockedParts.length} parts with excess stock at {filters.horizon}-day horizon
        </p>
      </div>

      {overstockedParts.length > 0 ? (
        <DataTable 
          parts={overstockedParts} 
          columns={columns}
          defaultSort={`over${filters.horizon}`}
          defaultSortDir="desc"
        />
      ) : (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ 
            color: '#F0F4F2', 
            fontSize: '20px', 
            fontWeight: 600,
            marginBottom: '8px'
          }}>
            No Overstock Found
          </h3>
          <p style={{ color: 'rgba(240,244,242,0.7)', fontSize: '14px' }}>
            All parts are within demand requirements at the {filters.horizon}-day horizon
          </p>
        </div>
      )}
    </div>
  );
}

// Made with Bob
