import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-commerce';

@Injectable({ providedIn: 'root' })
export class ZohoCommerceService {
  private readonly api = inject(ApiService);

  // Products
  listProducts(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/products', {}, query);
  }
  getProduct(id: string) {
    return this.api.get(PREFIX, '/products/:id', { id });
  }
  createProduct(body: unknown) {
    return this.api.post(PREFIX, '/products', {}, body);
  }
  updateProduct(id: string, body: unknown) {
    return this.api.put(PREFIX, '/products/:id', { id }, body);
  }
  deleteProduct(id: string) {
    return this.api.delete(PREFIX, '/products/:id', { id });
  }

  // Categories
  listCategories() {
    return this.api.get(PREFIX, '/categories');
  }
  getCategory(id: string) {
    return this.api.get(PREFIX, '/categories/:id', { id });
  }
  createCategory(body: unknown) {
    return this.api.post(PREFIX, '/categories', {}, body);
  }
  deleteCategory(id: string) {
    return this.api.delete(PREFIX, '/categories/:id', { id });
  }

  // Customers
  listCustomers(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/customers', {}, query);
  }
  getCustomer(id: string) {
    return this.api.get(PREFIX, '/customers/:id', { id });
  }

  // Orders
  listOrders(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/orders', {}, query);
  }
  getOrder(id: string) {
    return this.api.get(PREFIX, '/orders/:id', { id });
  }
  createOrder(body: unknown) {
    return this.api.post(PREFIX, '/orders', {}, body);
  }
  updateOrderStatus(id: string, body: unknown) {
    return this.api.put(PREFIX, '/orders/:id/status', { id }, body);
  }
  cancelOrder(id: string) {
    return this.api.post(PREFIX, '/orders/:id/cancel', { id });
  }
}
