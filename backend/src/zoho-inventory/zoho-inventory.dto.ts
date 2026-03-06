import { ZohoAddress, ZohoTax, ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type InventoryItemType = "sales" | "purchases" | "sales_and_purchases" | "inventory";

export interface InventoryItem {
  item_id: string;
  name: string;
  status?: "active" | "inactive";
  unit?: string;
  description?: string;
  rate?: number;
  purchase_rate?: number;
  tax_id?: string;
  product_type?: "goods" | "service";
  item_type?: InventoryItemType;
  sku?: string;
  stock_on_hand?: number;
  reorder_level?: number;
  initial_stock?: number;
  initial_stock_rate?: number;
  created_time?: string;
  last_modified_time?: string;
}

export interface CreateInventoryItemDTO {
  name: string;
  unit?: string;
  rate?: number;
  purchase_rate?: number;
  description?: string;
  product_type?: "goods" | "service";
  item_type?: InventoryItemType;
  sku?: string;
  initial_stock?: number;
  initial_stock_rate?: number;
  reorder_level?: number;
  tax_id?: string;
}

export type UpdateInventoryItemDTO = Partial<CreateInventoryItemDTO>;

// â”€â”€â”€ Warehouse â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface Warehouse {
  warehouse_id: string;
  warehouse_name: string;
  address?: ZohoAddress;
  is_primary?: boolean;
  status?: "active" | "inactive";
}

// â”€â”€â”€ SalesOrder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type SalesOrderStatus = "draft" | "open" | "void" | "invoiced" | "partially_invoiced";

export interface SalesOrderLineItem {
  line_item_id?: string;
  item_id?: string;
  name?: string;
  quantity: number;
  unit?: string;
  rate: number;
  amount?: number;
  tax_id?: string;
  warehouse_id?: string;
}

export interface SalesOrder {
  salesorder_id: string;
  salesorder_number?: string;
  customer_id: string;
  customer_name?: string;
  status?: SalesOrderStatus;
  date?: string;
  shipment_date?: string;
  line_items: SalesOrderLineItem[];
  total?: number;
  taxes?: ZohoTax[];
  shipping_address?: ZohoAddress;
  billing_address?: ZohoAddress;
  created_time?: string;
  last_modified_time?: string;
}

export interface CreateSalesOrderDTO {
  customer_id: string;
  salesorder_number?: string;
  date?: string;
  shipment_date?: string;
  line_items: SalesOrderLineItem[];
  notes?: string;
  shipping_address?: ZohoAddress;
}

export type UpdateSalesOrderDTO = Partial<CreateSalesOrderDTO>;

// â”€â”€â”€ PurchaseOrder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type PurchaseOrderStatus = "draft" | "open" | "billed" | "cancelled";

export interface PurchaseOrder {
  purchaseorder_id: string;
  purchaseorder_number?: string;
  vendor_id: string;
  vendor_name?: string;
  status?: PurchaseOrderStatus;
  date?: string;
  delivery_date?: string;
  line_items: SalesOrderLineItem[];
  total?: number;
  created_time?: string;
}

export interface CreatePurchaseOrderDTO {
  vendor_id: string;
  purchaseorder_number?: string;
  date?: string;
  delivery_date?: string;
  line_items: SalesOrderLineItem[];
}

export type UpdatePurchaseOrderDTO = Partial<CreatePurchaseOrderDTO>;

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface InventoryListParams extends ZohoListParams {
  status?: string;
  search_text?: string;
  filter_by?: string;
}
