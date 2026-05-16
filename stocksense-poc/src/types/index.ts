// Core data types for StockSense

export interface Part {
  part: string;
  site: string;
  vendor: string;
  vname: string;
  analyst: string;
  imageUrl?: string;
  soh: number;
  packGroup: string;
  isTLS: boolean;
  d30: number;
  d60: number;
  d90: number;
  d120: number;
  over30: number;
  over60: number;
  over90: number;
  over120: number;
  under30: number;
  under60: number;
  under90: number;
  under120: number;
  risk: 'Critical' | 'High' | 'Medium' | 'Low' | 'None';
  shortageRisk: 'Critical' | 'High' | 'Medium' | 'Low' | 'None';
  pkgItem: string;
  qtyPerBox: number;
  ov30: number;
  ov60: number;
  ov90: number;
  ov120: number;
  uv30: number;
  uv60: number;
  uv90: number;
  uv120: number;
  price: number;
  atb: boolean;
  obs: boolean;
  osVal30: number;
  osVal60: number;
  osVal90: number;
  osVal120: number;
  shortageVal30: number;
  shortageVal60: number;
  shortageVal90: number;
  shortageVal120: number;
}

export interface ERPMap {
  mrpPlantCol: number | string;
  mrpVendorCol: number | string;
  mrpVnameCol: number | string;
  mrpPartCol: number | string;
  mrpAnalystHeader: string;
  mrpDateStartCol: number;
  stkWarehouse: string;
  stkItem: string;
  stkSoh: string;
  siteMap: Record<string, string>;
  warehouseMap: Record<string, string>;
}

export type ERPSystem = 'standard' | 'sap' | 'oracle' | 'dynamics' | 'infor' | 'manhattan' | 'other';

export type Horizon = 30 | 60 | 90 | 120;

export type ViewMode = 'overstock' | 'understock' | 'both';

export interface FilterState {
  site: string;
  horizon: Horizon;
  vendor: string;
  risk: string;
  shortageRisk: string;
  partSearch: string;
  analyst: string;
  atb: boolean | null;
  obs: boolean | null;
  tls: boolean | null;
  packGroup: string;
  viewMode: ViewMode;
  sortBy: 'qty' | 'volume' | 'value';
}

export interface KPIData {
  overstockedParts: number;
  totalOverstockQty: number;
  criticalRiskParts: number;
  overstockValue: number;
  overstockVolume: number;
  understockedParts: number;
  totalShortageQty: number;
  criticalShortageParts: number;
  shortageValue: number;
  shortageVolume: number;
}

// Made with Bob
