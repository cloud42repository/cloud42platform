import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-inventory';

@Injectable({ providedIn: 'root' })
export class ZohoInventoryService {
  private readonly api = inject(ApiService);

  // Items
  listItems(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/items', {}, query);
  }
  getItem(id: string) {
    return this.api.get(PREFIX, '/items/:id', { id });
  }
  createItem(body: unknown) {
    return this.api.post(PREFIX, '/items', {}, body);
  }
  updateItem(id: string, body: unknown) {
    return this.api.put(PREFIX, '/items/:id', { id }, body);
  }
  deleteItem(id: string) {
    return this.api.delete(PREFIX, '/items/:id', { id });
  }

  // Warehouses
  listWarehouses() {
    return this.api.get(PREFIX, '/warehouses');
  }
  getWarehouse(id: string) {
    return this.api.get(PREFIX, '/warehouses/:id', { id });
  }

  // Sales Orders
  listSalesOrders(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/salesorders', {}, query);
  }
  getSalesOrder(id: string) {
    return this.api.get(PREFIX, '/salesorders/:id', { id });
  }
  createSalesOrder(body: unknown) {
    return this.api.post(PREFIX, '/salesorders', {}, body);
  }
  updateSalesOrder(id: string, body: unknown) {
    return this.api.put(PREFIX, '/salesorders/:id', { id }, body);
  }
  deleteSalesOrder(id: string) {
    return this.api.delete(PREFIX, '/salesorders/:id', { id });
  }

  // Purchase Orders
  listPurchaseOrders(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/purchaseorders', {}, query);
  }
  getPurchaseOrder(id: string) {
    return this.api.get(PREFIX, '/purchaseorders/:id', { id });
  }
  createPurchaseOrder(body: unknown) {
    return this.api.post(PREFIX, '/purchaseorders', {}, body);
  }
  updatePurchaseOrder(id: string, body: unknown) {
    return this.api.put(PREFIX, '/purchaseorders/:id', { id }, body);
  }
  deletePurchaseOrder(id: string) {
    return this.api.delete(PREFIX, '/purchaseorders/:id', { id });
  }
}
