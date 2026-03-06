import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials, ZOHO_API_BASE, ZohoRegion } from "../base/types";
import {
  InventoryItem, CreateInventoryItemDTO, UpdateInventoryItemDTO,
  Warehouse,
  SalesOrder, CreateSalesOrderDTO, UpdateSalesOrderDTO,
  PurchaseOrder, CreatePurchaseOrderDTO, UpdatePurchaseOrderDTO,
  InventoryListParams,
} from "./zoho-inventory.dto";

export interface ZohoInventoryConfig extends ZohoCredentials {
  organizationId: string;
  region?: ZohoRegion;
  apiBaseUrl?: string;
}

/**
 * Zoho Inventory v1 API client.
 * Docs: https://www.zoho.com/inventory/api/v1/
 */
export class ZohoInventoryClient extends ZohoBaseClient {
  constructor(config: ZohoInventoryConfig) {
    const region = config.region ?? "com";
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? `${ZOHO_API_BASE[region]}/inventory/v1`,
      defaultParams: { organization_id: config.organizationId },
    });
  }

  // â”€â”€â”€ Items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listItems(params?: InventoryListParams): Promise<{ items: InventoryItem[] }> {
    return this.get("/items", { params });
  }
  getItem(id: string): Promise<{ item: InventoryItem }> {
    return this.get(`/items/${id}`);
  }
  createItem(data: CreateInventoryItemDTO): Promise<{ item: InventoryItem }> {
    return this.post("/items", data);
  }
  updateItem(id: string, data: UpdateInventoryItemDTO): Promise<{ item: InventoryItem }> {
    return this.put(`/items/${id}`, data);
  }
  deleteItem(id: string): Promise<{ message: string }> {
    return this.delete(`/items/${id}`);
  }

  // â”€â”€â”€ Warehouses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listWarehouses(): Promise<{ warehouses: Warehouse[] }> {
    return this.get("/warehouses");
  }
  getWarehouse(id: string): Promise<{ warehouse: Warehouse }> {
    return this.get(`/warehouses/${id}`);
  }

  // â”€â”€â”€ Sales Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listSalesOrders(params?: InventoryListParams): Promise<{ salesorders: SalesOrder[] }> {
    return this.get("/salesorders", { params });
  }
  getSalesOrder(id: string): Promise<{ salesorder: SalesOrder }> {
    return this.get(`/salesorders/${id}`);
  }
  createSalesOrder(data: CreateSalesOrderDTO): Promise<{ salesorder: SalesOrder }> {
    return this.post("/salesorders", data);
  }
  updateSalesOrder(id: string, data: UpdateSalesOrderDTO): Promise<{ salesorder: SalesOrder }> {
    return this.put(`/salesorders/${id}`, data);
  }
  deleteSalesOrder(id: string): Promise<{ message: string }> {
    return this.delete(`/salesorders/${id}`);
  }

  // â”€â”€â”€ Purchase Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listPurchaseOrders(params?: InventoryListParams): Promise<{ purchaseorders: PurchaseOrder[] }> {
    return this.get("/purchaseorders", { params });
  }
  getPurchaseOrder(id: string): Promise<{ purchaseorder: PurchaseOrder }> {
    return this.get(`/purchaseorders/${id}`);
  }
  createPurchaseOrder(data: CreatePurchaseOrderDTO): Promise<{ purchaseorder: PurchaseOrder }> {
    return this.post("/purchaseorders", data);
  }
  updatePurchaseOrder(id: string, data: UpdatePurchaseOrderDTO): Promise<{ purchaseorder: PurchaseOrder }> {
    return this.put(`/purchaseorders/${id}`, data);
  }
  deletePurchaseOrder(id: string): Promise<{ message: string }> {
    return this.delete(`/purchaseorders/${id}`);
  }
}
