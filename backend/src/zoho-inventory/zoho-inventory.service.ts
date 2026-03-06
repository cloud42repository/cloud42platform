import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoInventoryClient } from './ZohoInventoryClient';
import type { ZohoRegion } from '../base/types';

@Injectable()
export class ZohoInventoryService {
  readonly client: ZohoInventoryClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoInventoryClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      region: (config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
      organizationId: config.get('ZOHO_ORGANIZATION_ID') ?? '',
    });
  }

  listItems(params?: Record<string, unknown>) { return this.client.listItems(params as any); }
  getItem(id: string) { return this.client.getItem(id); }
  createItem(data: unknown) { return this.client.createItem(data as any); }
  updateItem(id: string, data: unknown) { return this.client.updateItem(id, data as any); }
  deleteItem(id: string) { return this.client.deleteItem(id); }

  listWarehouses() { return this.client.listWarehouses(); }
  getWarehouse(id: string) { return this.client.getWarehouse(id); }

  listSalesOrders(params?: Record<string, unknown>) { return this.client.listSalesOrders(params as any); }
  getSalesOrder(id: string) { return this.client.getSalesOrder(id); }
  createSalesOrder(data: unknown) { return this.client.createSalesOrder(data as any); }
  updateSalesOrder(id: string, data: unknown) { return this.client.updateSalesOrder(id, data as any); }
  deleteSalesOrder(id: string) { return this.client.deleteSalesOrder(id); }

  listPurchaseOrders(params?: Record<string, unknown>) { return this.client.listPurchaseOrders(params as any); }
  getPurchaseOrder(id: string) { return this.client.getPurchaseOrder(id); }
  createPurchaseOrder(data: unknown) { return this.client.createPurchaseOrder(data as any); }
  updatePurchaseOrder(id: string, data: unknown) { return this.client.updatePurchaseOrder(id, data as any); }
  deletePurchaseOrder(id: string) { return this.client.deletePurchaseOrder(id); }
}
