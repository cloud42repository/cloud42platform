import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoCommerceClient } from './ZohoCommerceClient';

@Injectable()
export class ZohoCommerceService {
  readonly client: ZohoCommerceClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoCommerceClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  listProducts(params?: Record<string, unknown>) { return this.client.listProducts(params as any); }
  getProduct(id: string) { return this.client.getProduct(id); }
  createProduct(data: unknown) { return this.client.createProduct(data as any); }
  updateProduct(id: string, data: unknown) { return this.client.updateProduct(id, data as any); }
  deleteProduct(id: string) { return this.client.deleteProduct(id); }

  listCategories() { return this.client.listCategories(); }
  getCategory(id: string) { return this.client.getCategory(id); }
  createCategory(data: unknown) { return this.client.createCategory(data as any); }
  deleteCategory(id: string) { return this.client.deleteCategory(id); }

  listCustomers(params?: Record<string, unknown>) { return this.client.listCustomers(params as any); }
  getCustomer(id: string) { return this.client.getCustomer(id); }

  listOrders(params?: Record<string, unknown>) { return this.client.listOrders(params as any); }
  getOrder(id: string) { return this.client.getOrder(id); }
  createOrder(data: unknown) { return this.client.createOrder(data as any); }
  updateOrderStatus(id: string, status: any) { return this.client.updateOrderStatus(id, status); }
  cancelOrder(id: string) { return this.client.cancelOrder(id); }
}
