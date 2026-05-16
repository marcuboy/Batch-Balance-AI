import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import DataTable from './DataTable';
import { columnRenderers } from '../utils/columnRenderers';
import { fmt, fmtGBP } from '../utils/formatters';

export default function NotOnMRPTab() {
  const { filteredParts } = useData();

  // Parts not on MRP have zero demand across all horizons
  const notOnMRPParts = useMemo(() => {
    return filteredParts.filter(p => p.d30 === 0 && p.d60 === 0 && p.d90 === 0 && p.d120 === 0);
  }, [filteredParts]);

  const columns = [
    { key: 'part', label: 'Part Number' },
    { key: 'site', label: 'Site' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'vname', label: 'Vendor Name' },
    { key: 'analyst', label: 'Analyst' },
    { key: 'soh', label: 'Stock on Hand', render: (p) => <span style={{ color: '#FFD93D', fontWeight: 600 }}>{fmt(p.soh)}</span> },
    { 
      key: 'price', 
      label: 'Unit Price', 
      render: (p) => p.price > 0 ? fmtGBP(p.price) : '-'
    },
    { 
      key: 'value', 
      label: 'Total Value', 
      render: (p) => p.price > 0 ? fmtGBP(p.soh * p.price) : '-'
    },
    { key: 'flags', label: 'Flags', render: columnRenderers.flags, sortable: false },
  ];

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
          🔍 NOT ON MRP
        </h2>
        <p style={{ color: 'rgba(240,244,242,0.7)', fontSize: '14px' }}>
          {notOnMRPParts.length} parts in stock with no demand forecast
        </p>
      </div>

      {notOnMRPParts.length > 0 ? (
        <>
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(255,217,61,0.1)',
            border: '1px solid rgba(255,217,61,0.3)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <h3 style={{ color: '#FFD93D', fontSize: '16px', fontWeight: 600, margin: 0 }}>
                Action Required
              </h3>
            </div>
            <p style={{ color: 'rgba(240,244,242,0.8)', fontSize: '14px', margin: 0 }}>
              These parts have stock on hand but no demand in the MRP system. They may be obsolete, 
              discontinued, or incorrectly coded. Review with planning team to determine disposition.
            </p>
          </div>
          
          <DataTable 
            parts={notOnMRPParts} 
            columns={columns}
            defaultSort="soh"
            defaultSortDir="desc"
          />
        </>
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
            All Parts on MRP
          </h3>
          <p style={{ color: 'rgba(240,244,242,0.7)', fontSize: '14px' }}>
            Every part in stock has a corresponding demand forecast
          </p>
        </div>
      )}
    </div>
  );
}

// Made with Bob
