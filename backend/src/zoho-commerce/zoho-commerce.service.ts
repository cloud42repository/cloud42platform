import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoCommerceClient } from './ZohoCommerceClient';

@Injectable()
export class ZohoCommerceService {
  private readonly logger = new Logger(ZohoCommerceService.name);
  private readonly defaultClient: ZohoCommerceClient;
  private readonly clients = new Map<string, { client: ZohoCommerceClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ZohoCommerceClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  private async getClient(): Promise<ZohoCommerceClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoCommerceClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Commerce client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listProducts(params?: Record<string, unknown>) { return (await this.getClient()).listProducts(params as any); }
  async getProduct(id: string) { return (await this.getClient()).getProduct(id); }
  async createProduct(data: unknown) { return (await this.getClient()).createProduct(data as any); }
  async updateProduct(id: string, data: unknown) { return (await this.getClient()).updateProduct(id, data as any); }
  async deleteProduct(id: string) { return (await this.getClient()).deleteProduct(id); }

  async listCategories() { return (await this.getClient()).listCategories(); }
  async getCategory(id: string) { return (await this.getClient()).getCategory(id); }
  async createCategory(data: unknown) { return (await this.getClient()).createCategory(data as any); }
  async deleteCategory(id: string) { return (await this.getClient()).deleteCategory(id); }

  async listCustomers(params?: Record<string, unknown>) { return (await this.getClient()).listCustomers(params as any); }
  async getCustomer(id: string) { return (await this.getClient()).getCustomer(id); }

  async listOrders(params?: Record<string, unknown>) { return (await this.getClient()).listOrders(params as any); }
  async getOrder(id: string) { return (await this.getClient()).getOrder(id); }
  async createOrder(data: unknown) { return (await this.getClient()).createOrder(data as any); }
  async updateOrderStatus(id: string, status: any) { return (await this.getClient()).updateOrderStatus(id, status); }
  async cancelOrder(id: string) { return (await this.getClient()).cancelOrder(id); }
}
