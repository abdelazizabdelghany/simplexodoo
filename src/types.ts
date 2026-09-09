export interface OdooCredentials {
  url: string;
  db: string;
  username: string;
  apiKey: string;
}

export interface OdooConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  lastChecked?: string;
  serverVersion?: string;
  database?: string;
  userName?: string;
  errorMessage?: string;
  isDemoMode: boolean;
}

export interface WarehouseLocation {
  id: number;
  name: string;
  complete_name: string;
  barcode?: string;
  usage: 'internal' | 'view' | 'transit' | 'customer' | 'inventory';
  parent_id?: [number, string] | null;
  posx?: number;
  posy?: number;
  posz?: number;
  item_count?: number;
  zone?: string;
  rack?: string;
}

export interface StockItem {
  id: number;
  product_id: number;
  product_name: string;
  default_code: string; // SKU / Internal Reference
  barcode: string;
  category: string;
  quantity: number; // On Hand Quantity
  reserved_quantity: number; // Reserved Quantity
  available_quantity: number; // Free Available Quantity (quantity - reserved_quantity)
  uom: string; // Unit of Measure (Units, kg, m, etc.)
  standard_price: number; // Cost Price
  lst_price: number; // Sales Price
  total_value: number; // available_quantity * standard_price
  location_id: number;
  location_name: string;
  lot_number?: string;
  expiry_date?: string;
  package_name?: string;
  in_date?: string;
  min_stock_limit?: number;
  image_url?: string;
  status: 'optimal' | 'low' | 'out_of_stock' | 'critical';
}

export interface LocationSummary {
  totalSkus: number;
  totalOnHand: number;
  totalAvailable: number;
  totalReserved: number;
  totalValuation: number;
  lowStockItems: number;
  outOfStockItems: number;
  currency: string;
}

export type ViewMode = 'cards' | 'table' | 'visual_bins';
export type FilterStatus = 'all' | 'available' | 'low' | 'out' | 'reserved';
