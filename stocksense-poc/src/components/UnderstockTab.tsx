import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import DataTable from './DataTable';
import { columnRenderers } from '../utils/columnRenderers';
import { fmt, fmtGBP } from '../utils/formatters';

export default function UnderstockTab() {
  const { filteredParts, filters } = useData();

  const understockedParts = useMemo(() => {
    const horizonKey = `under${filters.horizon}` as keyof typeof filteredParts[0];
    return filteredParts.filter(p => (p[horizonKey] as number) > 0);
  }, [filteredParts, filters.horizon]);

  const columns = useMemo(() => {
    const horizonKey = `under${filters.horizon}` as keyof typeof filteredParts[0];
    const valKey = `shortageVal${filters.horizon}` as keyof typeof filteredParts[0];

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
        label: 'Shortage Qty', 
        render: (p) => <span style={{ color: '#4ECDC4', fontWeight: 600 }}>{fmt((p as unknown as Record<string, number>)[horizonKey])}</span>
      },
      { key: 'shortageRisk', label: 'Shortage Risk', render: columnRenderers.shortageRisk, sortable: false },
      { 
        key: valKey, 
        label: 'Value at Risk (GBP)', 
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
          ⚠️ UNDERSTOCK ANALYSIS
        </h2>
        <p style={{ color: 'rgba(240,244,242,0.7)', fontSize: '14px' }}>
          {understockedParts.length} parts with insufficient stock at {filters.horizon}-day horizon
        </p>
      </div>

      {understockedParts.length > 0 ? (
        <DataTable 
          parts={understockedParts} 
          columns={columns}
          defaultSort={`under${filters.horizon}`}
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
            No Shortages Found
          </h3>
          <p style={{ color: 'rgba(240,244,242,0.7)', fontSize: '14px' }}>
            All parts have sufficient stock to meet demand at the {filters.horizon}-day horizon
          </p>
        </div>
      )}
    </div>
  );
}

// Made with Bob
