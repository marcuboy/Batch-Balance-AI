import * as XLSX from 'xlsx';
import type { ERPMap, ERPSystem, Part } from '../types';

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

const ERP_MAPS: Record<Exclude<ERPSystem, 'other'>, ERPMap> = {
  standard: {
    mrpPlantCol: 0,
    mrpVendorCol: 1,
    mrpVnameCol: 2,
    mrpPartCol: 8,
    mrpAnalystHeader: 'analyst',
    mrpDateStartCol: 38,
    stkWarehouse: 'Warehouse',
    stkItem: 'Item',
    stkSoh: 'Inventory_on_Hand',
    siteMap: { G: 'WBN', A: 'STA', WBN: 'WBN', STA: 'STA' },
    warehouseMap: { 'WH-ALPHA': 'WBN', 'WH-BETA': 'STA', WBN: 'WBN', STA: 'STA' },
  },
  sap: {
    mrpPlantCol: 'WERKS',
    mrpVendorCol: 'LIFNR',
    mrpVnameCol: 'NAME1',
    mrpPartCol: 'MATNR',
    mrpAnalystHeader: 'analyst',
    mrpDateStartCol: 38,
    stkWarehouse: 'LGORT',
    stkItem: 'MATNR',
    stkSoh: 'LABST',
    siteMap: { '1000': 'WBN', '2000': 'STA', G: 'WBN', A: 'STA', WBN: 'WBN', STA: 'STA' },
    warehouseMap: { '0001': 'WBN', '0002': 'STA', 'WH-ALPHA': 'WBN', 'WH-BETA': 'STA', WBN: 'WBN', STA: 'STA' },
  },
  oracle: {
    mrpPlantCol: 'ORGANIZATION_CODE',
    mrpVendorCol: 'SUPPLIER_NUMBER',
    mrpVnameCol: 'SUPPLIER_NAME',
    mrpPartCol: 'ITEM_NUMBER',
    mrpAnalystHeader: 'planner',
    mrpDateStartCol: 38,
    stkWarehouse: 'SUBINVENTORY',
    stkItem: 'ITEM_NUMBER',
    stkSoh: 'ON_HAND_QUANTITY',
    siteMap: { M1: 'WBN', M2: 'STA', G: 'WBN', A: 'STA', WBN: 'WBN', STA: 'STA' },
    warehouseMap: { STORE1: 'WBN', STORE2: 'STA', 'WH-ALPHA': 'WBN', 'WH-BETA': 'STA', WBN: 'WBN', STA: 'STA' },
  },
  dynamics: {
    mrpPlantCol: 'SITE',
    mrpVendorCol: 'VENDOR_ACCOUNT',
    mrpVnameCol: 'VENDOR_NAME',
    mrpPartCol: 'ITEM_NUMBER',
    mrpAnalystHeader: 'buyer',
    mrpDateStartCol: 38,
    stkWarehouse: 'WAREHOUSE',
    stkItem: 'ITEM_NUMBER',
    stkSoh: 'ON_HAND_QTY',
    siteMap: { SITE1: 'WBN', SITE2: 'STA', G: 'WBN', A: 'STA', WBN: 'WBN', STA: 'STA' },
    warehouseMap: { WH1: 'WBN', WH2: 'STA', 'WH-ALPHA': 'WBN', 'WH-BETA': 'STA', WBN: 'WBN', STA: 'STA' },
  },
  infor: {
    mrpPlantCol: 'FACILITY',
    mrpVendorCol: 'VENDOR_ID',
    mrpVnameCol: 'VENDOR_NAME',
    mrpPartCol: 'ITEM_NBR',
    mrpAnalystHeader: 'planner_id',
    mrpDateStartCol: 38,
    stkWarehouse: 'WAREHOUSE',
    stkItem: 'ITEM_NBR',
    stkSoh: 'QTY_ON_HAND',
    siteMap: { FAC1: 'WBN', FAC2: 'STA', G: 'WBN', A: 'STA', WBN: 'WBN', STA: 'STA' },
    warehouseMap: { WH01: 'WBN', WH02: 'STA', 'WH-ALPHA': 'WBN', 'WH-BETA': 'STA', WBN: 'WBN', STA: 'STA' },
  },
  manhattan: {
    mrpPlantCol: 'FACILITY_ID',
    mrpVendorCol: 'VENDOR_NBR',
    mrpVnameCol: 'VENDOR_NAME',
    mrpPartCol: 'SKU_NBR',
    mrpAnalystHeader: 'analyst',
    mrpDateStartCol: 38,
    stkWarehouse: 'WAREHOUSE_ID',
    stkItem: 'SKU_NBR',
    stkSoh: 'ON_HAND_QTY',
    siteMap: { F1: 'WBN', F2: 'STA', G: 'WBN', A: 'STA', WBN: 'WBN', STA: 'STA' },
    warehouseMap: { DC1: 'WBN', DC2: 'STA', 'WH-ALPHA': 'WBN', 'WH-BETA': 'STA', WBN: 'WBN', STA: 'STA' },
  },
};

const createHeaderMap = (headers: unknown[]) => {
  const map = new Map<string, number>();
  headers.forEach((header, index) => {
    if (header != null && String(header).trim()) {
      map.set(String(header).trim().toLowerCase(), index);
    }
  });
  return map;
};

const resolveColumn = (row: unknown[], colDef: number | string, headerMap: Map<string, number>) => {
  if (typeof colDef === 'number') return row[colDef];
  const idx = headerMap.get(colDef.toLowerCase());
  return idx == null ? undefined : row[idx];
};

const requireColumnIndex = (headerMap: Map<string, number>, column: string, label: string) => {
  const idx = headerMap.get(column.toLowerCase());
  if (idx == null) {
    throw new Error(`${label} file is missing required column "${column}"`);
  }
  return idx;
};

const findColumnIndex = (headerMap: Map<string, number>, candidates: string[]) => {
  for (const candidate of candidates) {
    const idx = headerMap.get(candidate.toLowerCase());
    if (idx != null) return idx;
  }
  return -1;
};

const normaliseSite = (raw: unknown, mapping: Record<string, string>) => {
  const value = raw == null ? '' : String(raw).trim();
  return mapping[value] || mapping[value.toUpperCase()] || (value === 'WBN' || value === 'STA' ? value : '');
};

const parseMrpDate = (headers: unknown[], startCol: number) => {
  for (let i = startCol; i < headers.length; i++) {
    const value = headers[i];
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().split('T')[0];
    }
    if (value && !Number.isNaN(Date.parse(String(value)))) {
      return new Date(String(value)).toISOString().split('T')[0];
    }
  }
  return new Date().toISOString().split('T')[0];
};

const coercePositiveNumber = (value: unknown, fallback = 0) => {
  const parsed = parseFloat(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const calculateCubeVolumeM3 = (length: number, width: number, height: number, unit: string) => {
  if (!length || !width || !height) return 0;
  const normalisedUnit = unit.toLowerCase();
  if (normalisedUnit.includes('mm')) return (length * width * height) / 1_000_000_000;
  if (normalisedUnit.includes('m') && !normalisedUnit.includes('cm') && !normalisedUnit.includes('mm')) {
    return length * width * height;
  }
  return (length * width * height) / 1_000_000;
};

export const processFiles = async (
  files: FileData,
  erpSystem: ERPSystem = 'standard'
): Promise<{ parts: Part[], mrpDate: string }> => {
  const { mrp, stock, packaging, dimensions, prices } = files;
  const erpMap = ERP_MAPS[erpSystem === 'other' ? 'standard' : erpSystem];

  if (!mrp || !stock) {
    throw new Error('MRP and Stock files are required');
  }
  if (mrp.length < 2) {
    throw new Error('MRP file does not contain any data rows');
  }
  if (stock.length < 2) {
    throw new Error('Stock file does not contain any data rows');
  }

  const allParts: Part[] = [];
  const mrpHeaders = mrp[0] || [];
  const mrpHeaderMap = createHeaderMap(mrpHeaders);
  const mrpDate = parseMrpDate(mrpHeaders, erpMap.mrpDateStartCol);
  const analystCol = mrpHeaderMap.get(erpMap.mrpAnalystHeader.toLowerCase()) ?? mrpHeaderMap.get('analyst');

  // Process MRP data
  interface MRPData {
    site: string;
    vendor: string;
    vname: string;
    part: string;
    analyst: string;
    imageUrl?: string;
    d30: number;
    d60: number;
    d90: number;
    d120: number;
  }
  const mrpMap = new Map<string, MRPData>();
  const mrpImageCol = findColumnIndex(mrpHeaderMap, ['image', 'image_url', 'image url', 'photo', 'photo_url', 'product_image']);
  for (let i = 1; i < mrp.length; i++) {
    const row = mrp[i];
    const site = normaliseSite(resolveColumn(row, erpMap.mrpPlantCol, mrpHeaderMap), erpMap.siteMap);
    if (!site) continue;

    const vendor = resolveColumn(row, erpMap.mrpVendorCol, mrpHeaderMap)?.toString().trim() || '';
    const vname = resolveColumn(row, erpMap.mrpVnameCol, mrpHeaderMap)?.toString().trim() || '';
    const part = resolveColumn(row, erpMap.mrpPartCol, mrpHeaderMap)?.toString().trim() || '';
    const analyst = analystCol != null ? row[analystCol]?.toString().trim() || '' : row[3]?.toString().trim() || '';
    const imageUrl = mrpImageCol >= 0 ? row[mrpImageCol]?.toString().trim() || undefined : undefined;

    if (!part) continue;

    const key = `${site}-${part}`;
    
    // Calculate demand from columns 38 onwards (125 days)
    let d30 = 0, d60 = 0, d90 = 0, d120 = 0;
    for (let j = erpMap.mrpDateStartCol; j < Math.min(row.length, erpMap.mrpDateStartCol + 125); j++) {
      const demand = parseFloat(String(row[j] ?? '')) || 0;
      const dayIndex = j - erpMap.mrpDateStartCol;
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
      imageUrl,
      d30,
      d60,
      d90,
      d120,
    });
  }

  // Process Stock data - find columns by header name
  const stockMap = new Map<string, number>();
  if (stock && stock.length > 0) {
    const stockHeaderMap = createHeaderMap(stock[0]);
    const whCol = requireColumnIndex(stockHeaderMap, erpMap.stkWarehouse, 'Stock');
    const itemCol = requireColumnIndex(stockHeaderMap, erpMap.stkItem, 'Stock');
    const sohCol = requireColumnIndex(stockHeaderMap, erpMap.stkSoh, 'Stock');

    for (let i = 1; i < stock.length; i++) {
      const row = stock[i];
      const site = normaliseSite(row[whCol], erpMap.warehouseMap);
      if (!site) continue;

      const item = row[itemCol]?.toString().trim() || '';
      const soh = parseFloat(String(row[sohCol] ?? '')) || 0;
      if (!item) continue;

      const key = `${site}-${item}`;
      stockMap.set(key, (stockMap.get(key) || 0) + soh);
    }
  }

  // Process Packaging data
  interface PackagingData {
    pkgItem: string;
    qtyPerBox: number;
    packGroup: string;
  }
  const packagingMap = new Map<string, PackagingData>();
  if (packaging && packaging.length > 0) {
    const packagingHeaderMap = createHeaderMap(packaging[0]);
    const childCol = findColumnIndex(packagingHeaderMap, ['Item (child)', 'Item', 'Child Item', 'ChildItem', 'Part', 'Part Number']);
    const pkgCol = findColumnIndex(packagingHeaderMap, ['Packaging Item', 'Packaging Item (child)', 'Package Item', 'Pkg Item']);
    const qtyCol = findColumnIndex(packagingHeaderMap, ['Quantity', 'Qty', 'Qty Per Box', 'Quantity per box']);
    const defaultCol = findColumnIndex(packagingHeaderMap, ['Default Package Definition', 'Default', 'Is Default']);
    const packTypeCol = findColumnIndex(packagingHeaderMap, ['Pack Type', 'Packaging Description', 'Packaging Item']);

    for (let i = 1; i < packaging.length; i++) {
      const row = packaging[i];
      const childItem = row[childCol >= 0 ? childCol : 0]?.toString().trim() || '';
      const pkgItem = row[pkgCol >= 0 ? pkgCol : 1]?.toString().trim() || '';
      const qty = coercePositiveNumber(row[qtyCol >= 0 ? qtyCol : 2], 1);
      const defaultValue = row[defaultCol]?.toString().toLowerCase() || '';
      const isDefault = defaultCol < 0 || ['yes', 'true', '1', 'default'].includes(defaultValue);
      const packGroup = row[packTypeCol]?.toString().trim() || pkgItem || 'Unknown';

      if (childItem && pkgItem && isDefault) {
        packagingMap.set(childItem, { pkgItem, qtyPerBox: qty, packGroup });
      }
    }
  }

  // Process Dimensions data
  interface DimensionsData {
    length: number;
    width: number;
    height: number;
    volumeM3: number;
  }
  const dimensionsMap = new Map<string, DimensionsData>();
  if (dimensions && dimensions.length > 0) {
    const dimensionsHeaderMap = createHeaderMap(dimensions[0]);
    const pkgCol = findColumnIndex(dimensionsHeaderMap, ['Packaging Item (child)', 'Packaging Item', 'Package Item', 'Pkg Item']);
    const lengthCol = findColumnIndex(dimensionsHeaderMap, ['Length', 'L']);
    const widthCol = findColumnIndex(dimensionsHeaderMap, ['Width', 'W']);
    const heightCol = findColumnIndex(dimensionsHeaderMap, ['Height', 'H']);
    const unitCol = findColumnIndex(dimensionsHeaderMap, ['Unit', 'UOM']);
    const volumeM3Col = findColumnIndex(dimensionsHeaderMap, ['Volume_m3', 'Volume m3', 'Volume (m3)', 'Volume (m³)']);
    const volumeCm3Col = findColumnIndex(dimensionsHeaderMap, ['Volume_cm3', 'Volume cm3', 'Volume (cm3)']);

    for (let i = 1; i < dimensions.length; i++) {
      const row = dimensions[i];
      const pkgItem = row[pkgCol >= 0 ? pkgCol : 0]?.toString().trim() || '';
      const length = coercePositiveNumber(row[lengthCol >= 0 ? lengthCol : 1]);
      const width = coercePositiveNumber(row[widthCol >= 0 ? widthCol : 2]);
      const height = coercePositiveNumber(row[heightCol >= 0 ? heightCol : 3]);
      const unit = row[unitCol]?.toString().trim() || 'cm';
      const explicitM3 = coercePositiveNumber(row[volumeM3Col]);
      const explicitCm3 = coercePositiveNumber(row[volumeCm3Col]);
      const volumeM3 = explicitM3 || (explicitCm3 ? explicitCm3 / 1_000_000 : calculateCubeVolumeM3(length, width, height, unit));

      if (pkgItem) {
        dimensionsMap.set(pkgItem, { length, width, height, volumeM3 });
      }
    }
  }

  // Process Prices data
  interface PricesData {
    price: number;
    atb: boolean;
    obs: boolean;
    imageUrl?: string;
  }
  const pricesMap = new Map<string, PricesData>();
  if (prices && prices.length > 0) {
    const priceHeaderMap = createHeaderMap(prices[0]);
    const imageCol = findColumnIndex(priceHeaderMap, ['image', 'image_url', 'image url', 'photo', 'photo_url', 'product_image']);
    for (let i = 1; i < prices.length; i++) {
      const row = prices[i];
      const part = row[0]?.toString() || '';
      const price = parseFloat(String(row[2] ?? '')) || 0;
      const atb = row[3]?.toString().toLowerCase() === 'yes';
      const obs = row[4]?.toString().toLowerCase() === 'yes';
      const imageUrl = imageCol >= 0 ? row[imageCol]?.toString().trim() || undefined : undefined;

      pricesMap.set(part, { price, atb, obs, imageUrl });
    }
  }

  // Combine all data
  mrpMap.forEach((mrpData, key) => {
    const soh = stockMap.get(key) || 0;
    const packaging = packagingMap.get(mrpData.part) || { pkgItem: '', qtyPerBox: 1, packGroup: 'Unknown' };
    const dims = dimensionsMap.get(packaging.pkgItem) || { length: 0, width: 0, height: 0, volumeM3: 0 };
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

    const boxVolume = dims.volumeM3 || calculateCubeVolumeM3(dims.length, dims.width, dims.height, 'cm');
    const boxesFor = (qty: number) => (qty > 0 && packaging.qtyPerBox > 0 ? Math.ceil(qty / packaging.qtyPerBox) : 0);
    const ov30 = boxesFor(over30) * boxVolume;
    const ov60 = boxesFor(over60) * boxVolume;
    const ov90 = boxesFor(over90) * boxVolume;
    const ov120 = boxesFor(over120) * boxVolume;
    const uv30 = boxesFor(under30) * boxVolume;
    const uv60 = boxesFor(under60) * boxVolume;
    const uv90 = boxesFor(under90) * boxVolume;
    const uv120 = boxesFor(under120) * boxVolume;

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
      imageUrl: priceData.imageUrl || mrpData.imageUrl,
      soh,
      packGroup: packaging.packGroup,
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
      uv30,
      uv60,
      uv90,
      uv120,
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

  if (allParts.length === 0) {
    throw new Error('No matching parts were found. Check the selected ERP profile and required column mappings.');
  }

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
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
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
