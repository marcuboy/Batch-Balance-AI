import * as XLSX from 'xlsx';
import type { Part } from '../types';

/**
 * Process uploaded Excel files and convert to Part data
 * Based on StockSense.html processData() function
 */

interface FileData {
  mrp?: unknown[][];
  stock?: unknown[][];
  packaging?: unknown[][];
  dimensions?: unknown[][];
  prices?: unknown[][];
}

export const processFiles = async (files: FileData): Promise<{ parts: Part[], mrpDate: string }> => {
  const { mrp, stock, packaging, dimensions, prices } = files;

  if (!mrp || !stock) {
    throw new Error('MRP and Stock files are required');
  }

  const allParts: Part[] = [];
  const mrpDate = new Date().toISOString().split('T')[0]; // Use current date for now

  // Process MRP data
  interface MRPData {
    site: string;
    vendor: string;
    vname: string;
    part: string;
    analyst: string;
    d30: number;
    d60: number;
    d90: number;
    d120: number;
  }
  const mrpMap = new Map<string, MRPData>();
  for (let i = 1; i < mrp.length; i++) {
    const row = mrp[i];
    const plantRaw = row[0]?.toString().trim() || '';
    
    // Map plant codes: G → WBN, A → STA
    let site: string;
    if (plantRaw === 'G') site = 'WBN';
    else if (plantRaw === 'A') site = 'STA';
    else continue; // Skip invalid plant codes
    
    const vendor = row[1]?.toString() || '';
    const vname = row[2]?.toString() || '';
    const part = row[8]?.toString().trim() || '';
    const analyst = row[3]?.toString() || '';

    if (!part) continue;

    const key = `${site}-${part}`;
    
    // Calculate demand from columns 38 onwards (125 days)
    let d30 = 0, d60 = 0, d90 = 0, d120 = 0;
    for (let j = 38; j < Math.min(row.length, 163); j++) {
      const demand = parseFloat(String(row[j] ?? '')) || 0;
      const dayIndex = j - 38;
      if (dayIndex < 30) d30 += demand;
      if (dayIndex < 60) d60 += demand;
      if (dayIndex < 90) d90 += demand;
      if (dayIndex < 120) d120 += demand;
    }

    mrpMap.set(key, {
      site,
      vendor,
      vname,
      part,
      analyst,
      d30,
      d60,
      d90,
      d120,
    });
  }

  // Process Stock data - find columns by header name
  const stockMap = new Map<string, number>();
  if (stock && stock.length > 0) {
    const headers = stock[0].map((h: unknown) => h ? String(h).trim() : '');
    const whCol = headers.indexOf('Warehouse');
    const itemCol = headers.indexOf('Item');
    const sohCol = headers.indexOf('Inventory_on_Hand');
    
    if (whCol === -1 || itemCol === -1 || sohCol === -1) {
      console.warn('Stock file missing required headers: Warehouse, Item, Inventory_on_Hand');
    } else {
      for (let i = 1; i < stock.length; i++) {
        const row = stock[i];
        const warehouse = row[whCol]?.toString().trim() || '';
        const item = row[itemCol]?.toString().trim() || '';
        const soh = parseFloat(String(row[sohCol] ?? '')) || 0;

        // Map warehouse codes: WH-ALPHA → WBN, WH-BETA → STA
        let site: string;
        if (warehouse === 'WH-ALPHA') site = 'WBN';
        else if (warehouse === 'WH-BETA') site = 'STA';
        else continue; // Skip invalid warehouse codes
        
        const key = `${site}-${item}`;
        stockMap.set(key, (stockMap.get(key) || 0) + soh);
      }
    }
  }

  // Process Packaging data
  interface PackagingData {
    pkgItem: string;
    qtyPerBox: number;
  }
  const packagingMap = new Map<string, PackagingData>();
  if (packaging) {
    for (let i = 1; i < packaging.length; i++) {
      const row = packaging[i];
      const childItem = row[0]?.toString() || '';
      const pkgItem = row[1]?.toString() || '';
      const qty = parseFloat(String(row[2] ?? '')) || 1;
      const isDefault = row[3]?.toString().toLowerCase() === 'yes';

      if (isDefault) {
        packagingMap.set(childItem, { pkgItem, qtyPerBox: qty });
      }
    }
  }

  // Process Dimensions data
  interface DimensionsData {
    length: number;
    width: number;
    height: number;
  }
  const dimensionsMap = new Map<string, DimensionsData>();
  if (dimensions) {
    for (let i = 1; i < dimensions.length; i++) {
      const row = dimensions[i];
      const pkgItem = row[0]?.toString() || '';
      const length = parseFloat(String(row[1] ?? '')) || 0;
      const width = parseFloat(String(row[2] ?? '')) || 0;
      const height = parseFloat(String(row[3] ?? '')) || 0;

      dimensionsMap.set(pkgItem, { length, width, height });
    }
  }

  // Process Prices data
  interface PricesData {
    price: number;
    atb: boolean;
    obs: boolean;
  }
  const pricesMap = new Map<string, PricesData>();
  if (prices) {
    for (let i = 1; i < prices.length; i++) {
      const row = prices[i];
      const part = row[0]?.toString() || '';
      const price = parseFloat(String(row[2] ?? '')) || 0;
      const atb = row[3]?.toString().toLowerCase() === 'yes';
      const obs = row[4]?.toString().toLowerCase() === 'yes';

      pricesMap.set(part, { price, atb, obs });
    }
  }

  // Combine all data
  console.log(`Processing ${mrpMap.size} MRP entries with ${stockMap.size} stock entries`);
  
  mrpMap.forEach((mrpData, key) => {
    const soh = stockMap.get(key) || 0;
    const packaging = packagingMap.get(mrpData.part) || { pkgItem: '', qtyPerBox: 1 };
    const dims = dimensionsMap.get(packaging.pkgItem) || { length: 0, width: 0, height: 0 };
    const priceData = pricesMap.get(mrpData.part) || { price: 0, atb: false, obs: false };

    // Calculate overstock/understock
    const over30 = soh - mrpData.d30;
    const over60 = soh - mrpData.d60;
    const over90 = soh - mrpData.d90;
    const over120 = soh - mrpData.d120;

    const under30 = Math.max(0, mrpData.d30 - soh);
    const under60 = Math.max(0, mrpData.d60 - soh);
    const under90 = Math.max(0, mrpData.d90 - soh);
    const under120 = Math.max(0, mrpData.d120 - soh);

    // Calculate risk
    let risk: Part['risk'] = 'None';
    if (over30 > 0) {
      if (over120 > 0) risk = 'Critical';
      else if (over90 > 0) risk = 'High';
      else if (over60 > 0) risk = 'Medium';
      else risk = 'Low';
    }

    let shortageRisk: Part['shortageRisk'] = 'None';
    if (under30 > 0) {
      if (under30 > mrpData.d30 * 0.5) shortageRisk = 'Critical';
      else if (under30 > mrpData.d30 * 0.25) shortageRisk = 'High';
      else if (under30 > mrpData.d30 * 0.10) shortageRisk = 'Medium';
      else shortageRisk = 'Low';
    }

    // Calculate volume (cm³ to m³)
    const boxVolume = (dims.length * dims.width * dims.height) / 1000000; // cm³ to m³
    const ov30 = over30 > 0 ? (over30 / packaging.qtyPerBox) * boxVolume : 0;
    const ov60 = over60 > 0 ? (over60 / packaging.qtyPerBox) * boxVolume : 0;
    const ov90 = over90 > 0 ? (over90 / packaging.qtyPerBox) * boxVolume : 0;
    const ov120 = over120 > 0 ? (over120 / packaging.qtyPerBox) * boxVolume : 0;

    // Calculate values
    const osVal30 = over30 > 0 ? over30 * priceData.price : 0;
    const osVal60 = over60 > 0 ? over60 * priceData.price : 0;
    const osVal90 = over90 > 0 ? over90 * priceData.price : 0;
    const osVal120 = over120 > 0 ? over120 * priceData.price : 0;

    const shortageVal30 = under30 > 0 ? under30 * priceData.price : 0;
    const shortageVal60 = under60 > 0 ? under60 * priceData.price : 0;
    const shortageVal90 = under90 > 0 ? under90 * priceData.price : 0;
    const shortageVal120 = under120 > 0 ? under120 * priceData.price : 0;

    const part: Part = {
      part: mrpData.part,
      site: mrpData.site,
      vendor: mrpData.vendor,
      vname: mrpData.vname,
      analyst: mrpData.analyst,
      soh,
      packGroup: packaging.pkgItem ? `Box-${Math.floor(Math.random() * 3) + 1}` : 'Unknown',
      isTLS: mrpData.vname.toLowerCase().includes('tls') || mrpData.vname.toLowerCase().includes('kit'),
      d30: mrpData.d30,
      d60: mrpData.d60,
      d90: mrpData.d90,
      d120: mrpData.d120,
      over30,
      over60,
      over90,
      over120,
      under30,
      under60,
      under90,
      under120,
      risk,
      shortageRisk,
      pkgItem: packaging.pkgItem,
      qtyPerBox: packaging.qtyPerBox,
      ov30,
      ov60,
      ov90,
      ov120,
      price: priceData.price,
      atb: priceData.atb,
      obs: priceData.obs,
      osVal30,
      osVal60,
      osVal90,
      osVal120,
      shortageVal30,
      shortageVal60,
      shortageVal90,
      shortageVal120,
    };

    allParts.push(part);
  });

  console.log(`Processed ${allParts.length} parts total`);
  console.log(`Overstock parts: ${allParts.filter(p => p.over30 > 0).length}`);
  console.log(`Understock parts: ${allParts.filter(p => p.under30 > 0).length}`);

  return { parts: allParts, mrpDate };
};

/**
 * Read Excel file and return data as 2D array
 */
export const readExcelFile = (file: File): Promise<unknown[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        resolve(jsonData as unknown[][]);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

// Made with Bob
