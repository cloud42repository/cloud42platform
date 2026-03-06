import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoSubscriptionsClient } from './ZohoSubscriptionsClient';
import type { ZohoRegion } from '../base/types';

@Injectable()
export class ZohoSubscriptionsService {
  readonly client: ZohoSubscriptionsClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoSubscriptionsClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      region: (config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
      organizationId: config.get('ZOHO_ORGANIZATION_ID') ?? '',
    });
  }

  listPlans(params?: Record<string, unknown>) { return this.client.listPlans(params as any); }
  getPlan(code: string) { return this.client.getPlan(code); }
  createPlan(data: unknown) { return this.client.createPlan(data as any); }
  updatePlan(code: string, data: unknown) { return this.client.updatePlan(code, data as any); }
  deletePlan(code: string) { return this.client.deletePlan(code); }

  listAddons() { return this.client.listAddons(); }
  getAddon(code: string) { return this.client.getAddon(code); }

  listCoupons() { return this.client.listCoupons(); }
  getCoupon(code: string) { return this.client.getCoupon(code); }

  listCustomers(params?: Record<string, unknown>) { return this.client.listCustomers(params as any); }
  getCustomer(id: string) { return this.client.getCustomer(id); }
  createCustomer(data: unknown) { return this.client.createCustomer(data as any); }
  updateCustomer(id: string, data: unknown) { return this.client.updateCustomer(id, data as any); }
  deleteCustomer(id: string) { return this.client.deleteCustomer(id); }

  listSubscriptions(params?: Record<string, unknown>) { return this.client.listSubscriptions(params as any); }
  getSubscription(id: string) { return this.client.getSubscription(id); }
  createSubscription(data: unknown) { return this.client.createSubscription(data as any); }
  updateSubscription(id: string, data: unknown) { return this.client.updateSubscription(id, data as any); }
  cancelSubscription(id: string) { return this.client.cancelSubscription(id); }
  reactivateSubscription(id: string) { return this.client.reactivateSubscription(id); }
}
