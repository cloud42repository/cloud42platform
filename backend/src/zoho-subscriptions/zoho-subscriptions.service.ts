import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { ZohoOAuthService } from '../zoho-oauth/zoho-oauth.service';
import { StoredTokenAuthProvider } from '../auth/StoredTokenAuthProvider';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoSubscriptionsClient } from './ZohoSubscriptionsClient';
import type { ZohoRegion } from '../base/types';

@Injectable()
export class ZohoSubscriptionsService {
  private readonly logger = new Logger(ZohoSubscriptionsService.name);
  private readonly defaultClient: ZohoSubscriptionsClient;
  private readonly clients = new Map<string, { client: ZohoSubscriptionsClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
    private readonly zohoOAuth: ZohoOAuthService,
  ) {
    this.defaultClient = new ZohoSubscriptionsClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      region: (config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
      organizationId: config.get('ZOHO_ORGANIZATION_ID') ?? '',
    });
  }

  private async getClient(): Promise<ZohoSubscriptionsClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoSubscriptionsClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            authProvider: new StoredTokenAuthProvider(this.zohoOAuth, email),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
            region: (this.config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
            organizationId: (c['organizationId'] as string) ?? this.config.get('ZOHO_ORGANIZATION_ID') ?? '',
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Subscriptions client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listPlans(params?: Record<string, unknown>) { return (await this.getClient()).listPlans(params as any); }
  async getPlan(code: string) { return (await this.getClient()).getPlan(code); }
  async createPlan(data: unknown) { return (await this.getClient()).createPlan(data as any); }
  async updatePlan(code: string, data: unknown) { return (await this.getClient()).updatePlan(code, data as any); }
  async deletePlan(code: string) { return (await this.getClient()).deletePlan(code); }

  async listAddons() { return (await this.getClient()).listAddons(); }
  async getAddon(code: string) { return (await this.getClient()).getAddon(code); }

  async listCoupons() { return (await this.getClient()).listCoupons(); }
  async getCoupon(code: string) { return (await this.getClient()).getCoupon(code); }

  async listCustomers(params?: Record<string, unknown>) { return (await this.getClient()).listCustomers(params as any); }
  async getCustomer(id: string) { return (await this.getClient()).getCustomer(id); }
  async createCustomer(data: unknown) { return (await this.getClient()).createCustomer(data as any); }
  async updateCustomer(id: string, data: unknown) { return (await this.getClient()).updateCustomer(id, data as any); }
  async deleteCustomer(id: string) { return (await this.getClient()).deleteCustomer(id); }

  async listSubscriptions(params?: Record<string, unknown>) { return (await this.getClient()).listSubscriptions(params as any); }
  async getSubscription(id: string) { return (await this.getClient()).getSubscription(id); }
  async createSubscription(data: unknown) { return (await this.getClient()).createSubscription(data as any); }
  async updateSubscription(id: string, data: unknown) { return (await this.getClient()).updateSubscription(id, data as any); }
  async cancelSubscription(id: string) { return (await this.getClient()).cancelSubscription(id); }
  async reactivateSubscription(id: string) { return (await this.getClient()).reactivateSubscription(id); }

  // ── OAuth lifecycle ──────────────────────────────────────────────────────
  getAuthUrl(scope: string) { return this.zohoOAuth.buildAuthorizationUrl({ scope }); }
  async exchangeGrantCode(code: string) {
    const result = await this.zohoOAuth.exchangeAndStore(code);
    const email = getCurrentUserEmail(); if (email) this.clients.delete(email);
    return result;
  }
  async revokeAuth() {
    const result = await this.zohoOAuth.revokeAndClear();
    const email = getCurrentUserEmail(); if (email) this.clients.delete(email);
    return result;
  }
}
