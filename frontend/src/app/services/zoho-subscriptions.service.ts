import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-subscriptions';

@Injectable({ providedIn: 'root' })
export class ZohoSubscriptionsService {
  private readonly api = inject(ApiService);

  // Plans
  listPlans(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/plans', {}, query);
  }
  getPlan(code: string) {
    return this.api.get(PREFIX, '/plans/:code', { code });
  }
  createPlan(body: unknown) {
    return this.api.post(PREFIX, '/plans', {}, body);
  }
  updatePlan(code: string, body: unknown) {
    return this.api.put(PREFIX, '/plans/:code', { code }, body);
  }
  deletePlan(code: string) {
    return this.api.delete(PREFIX, '/plans/:code', { code });
  }

  // Addons
  listAddons() {
    return this.api.get(PREFIX, '/addons');
  }
  getAddon(code: string) {
    return this.api.get(PREFIX, '/addons/:code', { code });
  }

  // Coupons
  listCoupons() {
    return this.api.get(PREFIX, '/coupons');
  }
  getCoupon(code: string) {
    return this.api.get(PREFIX, '/coupons/:code', { code });
  }

  // Customers
  listCustomers(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/customers', {}, query);
  }
  getCustomer(id: string) {
    return this.api.get(PREFIX, '/customers/:id', { id });
  }
  createCustomer(body: unknown) {
    return this.api.post(PREFIX, '/customers', {}, body);
  }
  updateCustomer(id: string, body: unknown) {
    return this.api.put(PREFIX, '/customers/:id', { id }, body);
  }
  deleteCustomer(id: string) {
    return this.api.delete(PREFIX, '/customers/:id', { id });
  }

  // Subscriptions
  listSubscriptions(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/subscriptions', {}, query);
  }
  getSubscription(id: string) {
    return this.api.get(PREFIX, '/subscriptions/:id', { id });
  }
  createSubscription(body: unknown) {
    return this.api.post(PREFIX, '/subscriptions', {}, body);
  }
  updateSubscription(id: string, body: unknown) {
    return this.api.put(PREFIX, '/subscriptions/:id', { id }, body);
  }
  cancelSubscription(id: string) {
    return this.api.post(PREFIX, '/subscriptions/:id/cancel', { id });
  }
  reactivateSubscription(id: string) {
    return this.api.post(PREFIX, '/subscriptions/:id/reactivate', { id });
  }
}
