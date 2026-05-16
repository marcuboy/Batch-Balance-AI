import * as XLSX from 'xlsx';
import type { Part } from '../types';

export const exportToExcel = (
  parts: Part[],
  horizon: number,
  mrpDate: string,
  activeTab: string
) => {
  const wb = XLSX.utils.book_new();

  // Helper to format numbers
  const fmtGBP = (n: number) => `£${Math.round(n).toLocaleString('en-GB')}`;

  // Overstock Sheet
  const overstockParts = parts.filter(p => (p as unknown as Record<string, number>)[`over${horizon}`] > 0);
  if (overstockParts.length > 0) {
    const overstockData = overstockParts.map(p => ({
      'Part Number': p.part,
      'Site': p.site,
      'Vendor': p.vendor,
      'Vendor Name': p.vname,
      'Analyst': p.analyst,
      'Stock on Hand': p.soh,
      [`Demand ${horizon}d`]: (p as unknown as Record<string, number>)[`d${horizon}`],
      'Overstock Qty': (p as unknown as Record<string, number>)[`over${horizon}`],
      'Risk': p.risk,
      'Volume (m³)': (p as unknown as Record<string, number>)[`ov${horizon}`] || 0,
      'Value (GBP)': (p as unknown as Record<string, number>)[`osVal${horizon}`] || 0,
      'ATB': p.atb ? 'Yes' : 'No',
      'Obsolete': p.obs ? 'Yes' : 'No',
      'TLS': p.isTLS ? 'Yes' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(overstockData);
    XLSX.utils.book_append_sheet(wb, ws, 'Overstock');
  }

  // Understock Sheet
  const understockParts = parts.filter(p => (p as unknown as Record<string, number>)[`under${horizon}`] > 0);
  if (understockParts.length > 0) {
    const understockData = understockParts.map(p => ({
      'Part Number': p.part,
      'Site': p.site,
      'Vendor': p.vendor,
      'Vendor Name': p.vname,
      'Analyst': p.analyst,
      'Stock on Hand': p.soh,
      [`Demand ${horizon}d`]: (p as unknown as Record<string, number>)[`d${horizon}`],
      'Shortage Qty': (p as unknown as Record<string, number>)[`under${horizon}`],
      'Shortage Risk': p.shortageRisk,
      'Value at Risk (GBP)': (p as unknown as Record<string, number>)[`shortageVal${horizon}`] || 0,
      'ATB': p.atb ? 'Yes' : 'No',
      'Obsolete': p.obs ? 'Yes' : 'No',
      'TLS': p.isTLS ? 'Yes' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(understockData);
    XLSX.utils.book_append_sheet(wb, ws, 'Understock');
  }

  // All Parts Sheet
  if (parts.length > 0) {
    const allPartsData = parts.map(p => ({
      'Part Number': p.part,
      'Site': p.site,
      'Vendor': p.vendor,
      'Vendor Name': p.vname,
      'Analyst': p.analyst,
      'Stock on Hand': p.soh,
      [`Demand ${horizon}d`]: (p as unknown as Record<string, number>)[`d${horizon}`],
      'Over/Under': (p as unknown as Record<string, number>)[`over${horizon}`],
      'Overstock Risk': p.risk,
      'Shortage Risk': p.shortageRisk,
      'Volume (m³)': (p as unknown as Record<string, number>)[`ov${horizon}`] || 0,
      'Value (GBP)': (p as unknown as Record<string, number>)[`osVal${horizon}`] || 0,
      'Pack Group': p.packGroup,
      'ATB': p.atb ? 'Yes' : 'No',
      'Obsolete': p.obs ? 'Yes' : 'No',
      'TLS': p.isTLS ? 'Yes' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(allPartsData);
    XLSX.utils.book_append_sheet(wb, ws, 'All Parts');
  }

  // Not on MRP Sheet
  const notOnMRPParts = parts.filter(p => p.d30 === 0 && p.d60 === 0 && p.d90 === 0 && p.d120 === 0);
  if (notOnMRPParts.length > 0) {
    const notOnMRPData = notOnMRPParts.map(p => ({
      'Part Number': p.part,
      'Site': p.site,
      'Vendor': p.vendor,
      'Vendor Name': p.vname,
      'Analyst': p.analyst,
      'Stock on Hand': p.soh,
      'Unit Price': p.price || 0,
      'Total Value': p.soh * (p.price || 0),
      'ATB': p.atb ? 'Yes' : 'No',
      'Obsolete': p.obs ? 'Yes' : 'No',
      'TLS': p.isTLS ? 'Yes' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(notOnMRPData);
    XLSX.utils.book_append_sheet(wb, ws, 'Not on MRP');
  }

  // Summary Sheet
  const summary = [
    ['StockSense Export'],
    ['MRP Date', mrpDate],
    ['Export Date', new Date().toLocaleDateString('en-GB')],
    ['Horizon', `${horizon} days`],
    ['Active Tab', activeTab],
    [],
    ['Summary Statistics'],
    ['Total Parts', parts.length],
    ['Overstocked Parts', overstockParts.length],
    ['Understocked Parts', understockParts.length],
    ['Not on MRP', notOnMRPParts.length],
    [],
    ['Total Overstock Qty', overstockParts.reduce((sum, p) => sum + (p as unknown as Record<string, number>)[`over${horizon}`], 0)],
    ['Total Shortage Qty', understockParts.reduce((sum, p) => sum + (p as unknown as Record<string, number>)[`under${horizon}`], 0)],
    ['Total Overstock Value', fmtGBP(overstockParts.reduce((sum, p) => sum + ((p as unknown as Record<string, number>)[`osVal${horizon}`] || 0), 0))],
    ['Total Shortage Value', fmtGBP(understockParts.reduce((sum, p) => sum + ((p as unknown as Record<string, number>)[`shortageVal${horizon}`] || 0), 0))],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Generate filename
  const filename = `StockSense_${mrpDate}_${horizon}d_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Write file
  XLSX.writeFile(wb, filename);
};

// Made with Bob
