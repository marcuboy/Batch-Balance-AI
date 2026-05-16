import type { Part } from '../types';

// Generate realistic dummy data for demo
export const generateDummyData = (): Part[] => {
  const parts: Part[] = [];
  const partNumbers = [
    'BFS-001', 'BFS-002', 'BFS-003', 'BFS-004', 'BFS-005', // Fasteners (overstocked)
    'GSK-001', 'GSK-002', 'GSK-003', 'GSK-004', // Gaskets (overstocked)
    'ADH-001', 'ADH-002', 'ADH-003', // Adhesives (overstocked)
    'WIR-001', 'WIR-002', 'WIR-003', 'WIR-004', // Wire harness (understocked)
    'GLS-001', 'GLS-002', 'GLS-003', // Glass (understocked)
    'CST-001', 'CST-002', 'CST-003', 'CST-004', // Castings (understocked)
    'BRK-001', 'BRK-002', 'BRK-003', // Brackets (balanced)
    'FOM-001', 'FOM-002', 'FOM-003', // Foam (overstocked)
    'SLV-001', 'SLV-002', // Sleeves (balanced)
    'CLM-001', 'CLM-002', 'CLM-003', // Clamps (overstocked)
    'HRN-001', 'HRN-002', // Harness (understocked)
    'PLG-001', 'PLG-002', 'PLG-003', // Plugs (balanced)
  ];
  
  const sites = ['WBN', 'STA'];
  const vendors = ['V001', 'V002', 'V003', 'V004', 'V005'];
  const vendorNames = ['Acme Corp', 'Global Parts Ltd', 'Premier Supply', 'Elite Components', 'Standard Industries'];
  const analysts = ['John Smith', 'Jane Doe', 'Bob Wilson', 'Alice Chen', 'Mike Johnson'];
  const packGroups = ['Box-1', 'Box-2', 'Box-3', 'Pallet-A', 'Pallet-B'];
  
  partNumbers.forEach((partNum, idx) => {
    sites.forEach(site => {
      const isOverstocked = partNum.startsWith('BFS') || partNum.startsWith('GSK') || 
                           partNum.startsWith('ADH') || partNum.startsWith('FOM') ||
                           partNum.startsWith('CLM');
      const isUnderstocked = partNum.startsWith('WIR') || partNum.startsWith('GLS') || 
                            partNum.startsWith('CST') || partNum.startsWith('HRN');
      
      // Generate demand with some randomness
      const baseDemand = Math.floor(Math.random() * 400) + 150;
      const d30 = baseDemand;
      const d60 = baseDemand * 2;
      const d90 = baseDemand * 3;
      const d120 = baseDemand * 4;
      
      // Generate stock based on scenario
      let soh: number;
      if (isOverstocked) {
        // Overstocked: 3-5x the 120-day demand
        soh = d120 + Math.floor(Math.random() * d120 * 2) + d120;
      } else if (isUnderstocked) {
        // Understocked: only 20-40% of 30-day demand
        soh = Math.floor(d30 * (0.2 + Math.random() * 0.2));
      } else {
        // Balanced: roughly 60-90 days of stock
        soh = d60 + Math.floor(Math.random() * d30);
      }
      
      // Calculate overstock/understock
      const over30 = soh - d30;
      const over60 = soh - d60;
      const over90 = soh - d90;
      const over120 = soh - d120;
      
      const under30 = Math.max(0, d30 - soh);
      const under60 = Math.max(0, d60 - soh);
      const under90 = Math.max(0, d90 - soh);
      const under120 = Math.max(0, d120 - soh);
      
      // Calculate risks
      let risk: Part['risk'] = 'None';
      if (over30 > 0) {
        if (over120 > 0) risk = 'Critical';
        else if (over90 > 0) risk = 'High';
        else if (over60 > 0) risk = 'Medium';
        else risk = 'Low';
      }
      
      let shortageRisk: Part['shortageRisk'] = 'None';
      if (under30 > 0) {
        if (under30 > d30 * 0.5) shortageRisk = 'Critical';
        else if (under30 > d30 * 0.25) shortageRisk = 'High';
        else if (under30 > d30 * 0.10) shortageRisk = 'Medium';
        else shortageRisk = 'Low';
      }
      
      // Generate other data
      const price = Math.random() * 45 + 10; // £10-£55
      const qtyPerBox = Math.floor(Math.random() * 40) + 20;
      
      // Volume calculation (simplified: boxes * 0.001 m³ per box)
      const ov30 = over30 > 0 ? (over30 / qtyPerBox) * 0.001 : 0;
      const ov60 = over60 > 0 ? (over60 / qtyPerBox) * 0.001 : 0;
      const ov90 = over90 > 0 ? (over90 / qtyPerBox) * 0.001 : 0;
      const ov120 = over120 > 0 ? (over120 / qtyPerBox) * 0.001 : 0;
      const uv30 = under30 > 0 ? (under30 / qtyPerBox) * 0.001 : 0;
      const uv60 = under60 > 0 ? (under60 / qtyPerBox) * 0.001 : 0;
      const uv90 = under90 > 0 ? (under90 / qtyPerBox) * 0.001 : 0;
      const uv120 = under120 > 0 ? (under120 / qtyPerBox) * 0.001 : 0;
      
      // Value calculations
      const osVal30 = over30 > 0 ? over30 * price : 0;
      const osVal60 = over60 > 0 ? over60 * price : 0;
      const osVal90 = over90 > 0 ? over90 * price : 0;
      const osVal120 = over120 > 0 ? over120 * price : 0;
      
      const shortageVal30 = under30 > 0 ? under30 * price : 0;
      const shortageVal60 = under60 > 0 ? under60 * price : 0;
      const shortageVal90 = under90 > 0 ? under90 * price : 0;
      const shortageVal120 = under120 > 0 ? under120 * price : 0;
      
      const vendorIdx = idx % vendors.length;
      
      parts.push({
        part: partNum,
        site,
        vendor: vendors[vendorIdx],
        vname: vendorNames[vendorIdx],
        analyst: analysts[idx % analysts.length],
        soh,
        packGroup: packGroups[idx % packGroups.length],
        isTLS: Math.random() > 0.85,
        d30, d60, d90, d120,
        over30, over60, over90, over120,
        under30, under60, under90, under120,
        risk,
        shortageRisk,
        pkgItem: `PKG-${Math.floor(Math.random() * 8) + 1}`,
        qtyPerBox,
        ov30, ov60, ov90, ov120,
        uv30, uv60, uv90, uv120,
        price,
        atb: Math.random() > 0.85,
        obs: Math.random() > 0.92,
        osVal30, osVal60, osVal90, osVal120,
        shortageVal30, shortageVal60, shortageVal90, shortageVal120
      });
    });
  });
  
  return parts;
};

// Pre-generated data for instant demo
export const DEMO_DATA = generateDummyData();

// Calculate KPIs from parts data
export const calculateKPIs = (parts: Part[], horizon: 30 | 60 | 90 | 120 = 30) => {
  const overstockedParts = parts.filter(p => {
    const overKey = `over${horizon}` as keyof Part;
    return (p[overKey] as number) > 0;
  }).length;
  
  const understockedParts = parts.filter(p => {
    const underKey = `under${horizon}` as keyof Part;
    return (p[underKey] as number) > 0;
  }).length;
  
  const totalOverstockQty = parts.reduce((sum, p) => {
    const overKey = `over${horizon}` as keyof Part;
    return sum + Math.max(0, p[overKey] as number);
  }, 0);
  
  const totalShortageQty = parts.reduce((sum, p) => {
    const underKey = `under${horizon}` as keyof Part;
    return sum + (p[underKey] as number);
  }, 0);
  
  const criticalRiskParts = parts.filter(p => p.risk === 'Critical').length;
  const criticalShortageParts = parts.filter(p => p.shortageRisk === 'Critical').length;
  
  const overstockValue = parts.reduce((sum, p) => {
    const valKey = `osVal${horizon}` as keyof Part;
    return sum + (p[valKey] as number);
  }, 0);
  
  const shortageValue = parts.reduce((sum, p) => {
    const valKey = `shortageVal${horizon}` as keyof Part;
    return sum + (p[valKey] as number);
  }, 0);
  
  const overstockVolume = parts.reduce((sum, p) => {
    const volKey = `ov${horizon}` as keyof Part;
    return sum + (p[volKey] as number);
  }, 0);

  const shortageVolume = parts.reduce((sum, p) => {
    const volKey = `uv${horizon}` as keyof Part;
    return sum + (p[volKey] as number);
  }, 0);
  
  return {
    overstockedParts,
    totalOverstockQty,
    criticalRiskParts,
    overstockValue,
    overstockVolume,
    understockedParts,
    totalShortageQty,
    criticalShortageParts,
    shortageValue,
    shortageVolume
  };
};

// Made with Bob
