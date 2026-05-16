import * as XLSX from 'xlsx';

export type TemplateKey = 'mrp' | 'stock' | 'packaging' | 'dimensions' | 'prices';

type TemplateCell = string | number;

export interface UploadTemplate {
  key: TemplateKey;
  title: string;
  fileLabel: string;
  downloadLabel: string;
  sheetName: string;
  filename: string;
  description: string;
  formatNote: string;
  headers: string[];
  rows: TemplateCell[][];
}

export interface HeaderValidationResult {
  valid: boolean;
  message?: string;
  missing: string[];
  mismatched: string[];
  extra: string[];
}

const MRP_BASE_HEADERS = [
  'Plant',
  'Vendor',
  'Vendor Name',
  'MRP Controller',
  'MRP Type',
  'Lot Size',
  'Reorder Point',
  'Safety Stock',
  'Part Number',
  'Part Description',
  'Unit',
  'Procurement Type',
  'Special Proc',
  'Lead Time',
  'Planned Delivery',
  'GR Processing Time',
  'In-House Production',
  'Batch Size',
  'Min Lot Size',
  'Max Lot Size',
  'Fixed Lot',
  'Rounding Val',
  'Scrap %',
  'BOM',
  'Routing',
  'Work Centre',
  'Planning Horizon',
  'Consumption Mode',
  'Fwd Consumption',
  'Bwd Consumption',
  'Alt BOM',
  'BOM Usage',
  'Planning Calendar',
  'Period Indicator',
  'Stock Type',
  'Storage Location',
  'Batch Mgmt',
  'Analyst',
];

const addDays = (isoDate: string, offset: number) => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

const makeDateHeaders = () => Array.from({ length: 125 }, (_, index) => addDays('2025-05-16', index));

const makeDemandSeries = (base: number, variance: number) =>
  Array.from({ length: 125 }, (_, index) => {
    const weekdayDemand = base + ((index % 5) - 2) * variance;
    return index % 7 >= 5 ? 0 : Math.max(0, Math.round(weekdayDemand));
  });

const makeMrpRow = (base: TemplateCell[], demandBase: number, variance: number) => [
  ...base,
  ...makeDemandSeries(demandBase, variance),
];

const MRP_HEADERS = [...MRP_BASE_HEADERS, ...makeDateHeaders()];

export const uploadTemplates: Record<TemplateKey, UploadTemplate> = {
  mrp: {
    key: 'mrp',
    title: 'MRP Demand',
    fileLabel: 'MRP Demand File',
    downloadLabel: 'Download Forecast Template',
    sheetName: 'MRP_Demand',
    filename: 'stocksense_forecast_mrp_demand_template.xlsx',
    description: 'Daily demand forecast by site, supplier, analyst, and part number.',
    formatNote: 'Use the MRP_Demand header structure. Fill the date columns with daily demand units.',
    headers: MRP_HEADERS,
    rows: [
      makeMrpRow(
        [
          'G',
          'V001',
          'Apex Seating Systems',
          'MRP01',
          'PD',
          'EX',
          0,
          0,
          'IHC-00124',
          'IHC Component 00124',
          'EA',
          'F',
          '',
          16,
          5,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0.5,
          'Y',
          'Y',
          'WC-IHC',
          120,
          'B',
          30,
          30,
          '',
          1,
          '',
          'W',
          'Unrestricted',
          'WH-ALPHA',
          'N',
          'R.Okafor',
        ],
        52,
        5
      ),
      makeMrpRow(
        [
          'A',
          'V002',
          'Brightline Components',
          'MRP02',
          'PD',
          'EX',
          0,
          0,
          'IHC-00125',
          'IHC Component 00125',
          'EA',
          'F',
          '',
          18,
          7,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0.4,
          'Y',
          'Y',
          'WC-IHC',
          120,
          'B',
          30,
          30,
          '',
          1,
          '',
          'W',
          'Unrestricted',
          'WH-BETA',
          'N',
          'M.Chen',
        ],
        24,
        3
      ),
      makeMrpRow(
        [
          'G',
          'V003',
          'Northstar Fabrication',
          'MRP03',
          'PD',
          'EX',
          0,
          0,
          'IHC-00126',
          'IHC Component 00126',
          'EA',
          'F',
          '',
          22,
          9,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0.6,
          'Y',
          'Y',
          'WC-IHC',
          120,
          'B',
          30,
          30,
          '',
          1,
          '',
          'W',
          'Unrestricted',
          'WH-ALPHA',
          'N',
          'J.Smith',
        ],
        14,
        2
      ),
    ],
  },
  stock: {
    key: 'stock',
    title: 'Stock on Hand',
    fileLabel: 'Stock on Hand File',
    downloadLabel: 'Download Inventory Template',
    sheetName: 'Stock_on_Hand',
    filename: 'stocksense_inventory_stock_on_hand_template.xlsx',
    description: 'Current available inventory by warehouse, storage location, and item.',
    formatNote: 'Use this file for current stock quantity. Inventory_on_Hand must be numeric.',
    headers: [
      'Warehouse',
      'Item',
      'Description',
      'Stock Type',
      'Storage Location',
      'Batch',
      'Inventory_on_Hand',
      'Unit',
      'Last Movement',
      'Planner',
    ],
    rows: [
      ['WH-ALPHA', 'IHC-00124', 'IHC Component 00124', 'Unrestricted', 'WH-ALPHA', '', 1841, 'EA', '2025-04-26', 'J.Smith'],
      ['WH-BETA', 'IHC-00125', 'IHC Component 00125', 'Unrestricted', 'WH-BETA', '', 320, 'EA', '2025-05-06', 'A.Patel'],
      ['WH-ALPHA', 'IHC-00126', 'IHC Component 00126', 'Unrestricted', 'WH-ALPHA', '', 920, 'EA', '2025-04-30', 'R.Okafor'],
    ],
  },
  packaging: {
    key: 'packaging',
    title: 'Packaging',
    fileLabel: 'Packaging File',
    downloadLabel: 'Download Packaging Template',
    sheetName: 'Packaging',
    filename: 'stocksense_packaging_template.xlsx',
    description: 'Maps each part to its default packaging item and quantity per pack.',
    formatNote: 'Mark one Default Package Definition as Yes for each item.',
    headers: [
      'Item (child)',
      'Part Description',
      'Packaging Item',
      'Packaging Description',
      'Quantity',
      'Unit',
      'Default Package Definition',
      'Pack Type',
      'Notes',
    ],
    rows: [
      ['IHC-00124', 'IHC Component 00124', 'PKG-BOX-L', 'Large Box 80x60x40cm', 2, 'EA', 'Yes', 'CALL', 'Primary pack'],
      ['IHC-00125', 'IHC Component 00125', 'PKG-TRAY-1', 'Returnable Tray 100x60x15cm', 1, 'EA', 'Yes', 'TRAY', 'Returnable'],
      ['IHC-00126', 'IHC Component 00126', 'PKG-BOX-M', 'Medium Box 60x40x30cm', 5, 'EA', 'Yes', 'BOX', 'Primary pack'],
    ],
  },
  dimensions: {
    key: 'dimensions',
    title: 'Packaging Dimensions',
    fileLabel: 'Dimensions File',
    downloadLabel: 'Download Warehouse Template',
    sheetName: 'PackagingDimensions',
    filename: 'stocksense_warehouse_dimensions_template.xlsx',
    description: 'Physical dimensions and cubic volume for each packaging item.',
    formatNote: 'Volume_m3 can be supplied directly or calculated from Length, Width, Height, and Unit.',
    headers: [
      'Packaging Item (child)',
      'Description',
      'Length',
      'Width',
      'Height',
      'Unit',
      'Volume_cm3',
      'Volume_m3',
      'Weight_kg',
      'Material',
      'Returnable',
    ],
    rows: [
      ['PKG-BOX-L', 'Large Box 80x60x40', 80, 60, 40, 'cm', 192000, 0.192, 8.2, 'Corrugated', 'No'],
      ['PKG-TRAY-1', 'Returnable Tray 100x60x15', 100, 60, 15, 'cm', 90000, 0.09, 11.4, 'Plastic', 'Yes'],
      ['PKG-BOX-M', 'Medium Box 60x40x30', 60, 40, 30, 'cm', 72000, 0.072, 4.6, 'Corrugated', 'No'],
    ],
  },
  prices: {
    key: 'prices',
    title: 'Part Prices',
    fileLabel: 'Prices File',
    downloadLabel: 'Download Purchase Template',
    sheetName: 'Part_Prices',
    filename: 'stocksense_purchase_prices_template.xlsx',
    description: 'Unit price, vendor, lead time, MOQ, ATB, and obsolete status by part.',
    formatNote: 'Unit Price (GBP) must be numeric so value exposure cards can calculate correctly.',
    headers: [
      'Part Number',
      'Description',
      'Unit Price (GBP)',
      'ATB Flag',
      'Obsolete Code',
      'Currency',
      'Price Date',
      'Vendor',
      'Lead Time (Days)',
      'MOQ',
    ],
    rows: [
      ['IHC-00124', 'IHC Component 00124', 854.89, '', '', 'GBP', '2025-04-19', 'Apex Seating Systems', 26, 25],
      ['IHC-00125', 'IHC Component 00125', 454.39, 'Yes', '', 'GBP', '2025-04-30', 'Brightline Components', 35, 100],
      ['IHC-00126', 'IHC Component 00126', 128.75, '', 'No', 'GBP', '2025-05-02', 'Northstar Fabrication', 18, 50],
    ],
  },
};

export const templateOrder: TemplateKey[] = ['mrp', 'stock', 'packaging', 'dimensions', 'prices'];

const trimHeader = (value: unknown) => String(value ?? '').replace(/^\uFEFF/, '').trim();

const normaliseHeaders = (headers: unknown[]) => {
  const values = headers.map(trimHeader);
  while (values.length && !values[values.length - 1]) values.pop();
  return values;
};

export const getTemplate = (key: TemplateKey) => uploadTemplates[key];

export const validateTemplateHeaders = (key: TemplateKey, uploadedHeaders: unknown[]): HeaderValidationResult => {
  const template = getTemplate(key);
  const expected = template.headers.map(trimHeader);
  const actual = normaliseHeaders(uploadedHeaders);
  const actualSet = new Set(actual.map((header) => header.toLowerCase()));

  const missing = expected.filter((header) => !actualSet.has(header.toLowerCase()));
  const mismatched = expected
    .map((header, index) => {
      const actualHeader = actual[index] || '(blank)';
      return actualHeader === header ? '' : `Column ${index + 1}: expected "${header}", found "${actualHeader}"`;
    })
    .filter(Boolean);
  const extra = actual.length > expected.length ? actual.slice(expected.length).filter(Boolean) : [];
  const valid = missing.length === 0 && mismatched.length === 0 && extra.length === 0 && actual.length === expected.length;

  if (valid) {
    return { valid: true, missing: [], mismatched: [], extra: [] };
  }

  const details = [
    missing.length ? `Missing: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? `, +${missing.length - 8} more` : ''}.` : '',
    mismatched.length ? `Mismatched order/names: ${mismatched.slice(0, 5).join('; ')}${mismatched.length > 5 ? `; +${mismatched.length - 5} more` : ''}.` : '',
    extra.length ? `Unexpected extra columns: ${extra.slice(0, 8).join(', ')}${extra.length > 8 ? `, +${extra.length - 8} more` : ''}.` : '',
  ].filter(Boolean);

  return {
    valid: false,
    missing,
    mismatched,
    extra,
    message: `${template.title} format does not match the downloadable template. ${details.join(' ')}`,
  };
};

export const createTemplateWorkbook = (key: TemplateKey) => {
  const template = getTemplate(key);
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([template.headers, ...template.rows]);
  XLSX.utils.book_append_sheet(workbook, worksheet, template.sheetName);
  return workbook;
};

export const downloadTemplate = (key: TemplateKey): void => {
  const template = getTemplate(key);
  const workbook = createTemplateWorkbook(key);
  const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([output], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = template.filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Made with Bob
