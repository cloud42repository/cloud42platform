import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoInventoryClient } from './ZohoInventoryClient';
import type { ZohoRegion } from '../base/types';

@Injectable()
export class ZohoInventoryService {
  private readonly logger = new Logger(ZohoInventoryService.name);
  private readonly defaultClient: ZohoInventoryClient;
  private readonly clients = new Map<string, { client: ZohoInventoryClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ZohoInventoryClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      region: (config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
      organizationId: config.get('ZOHO_ORGANIZATION_ID') ?? '',
    });
  }

  private async getClient(): Promise<ZohoInventoryClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoInventoryClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
            region: (this.config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
            organizationId: this.config.get('ZOHO_ORGANIZATION_ID') ?? '',
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Inventory client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listItems(params?: Record<string, unknown>) { return (await this.getClient()).listItems(params as any); }
  async getItem(id: string) { return (await this.getClient()).getItem(id); }
  async createItem(data: unknown) { return (await this.getClient()).createItem(data as any); }
  async updateItem(id: string, data: unknown) { return (await this.getClient()).updateItem(id, data as any); }
  async deleteItem(id: string) { return (await this.getClient()).deleteItem(id); }

  async listWarehouses() { return (await this.getClient()).listWarehouses(); }
  async getWarehouse(id: string) { return (await this.getClient()).getWarehouse(id); }

  async listSalesOrders(params?: Record<string, unknown>) { return (await this.getClient()).listSalesOrders(params as any); }
  async getSalesOrder(id: string) { return (await this.getClient()).getSalesOrder(id); }
  async createSalesOrder(data: unknown) { return (await this.getClient()).createSalesOrder(data as any); }
  async updateSalesOrder(id: string, data: unknown) { return (await this.getClient()).updateSalesOrder(id, data as any); }
  async deleteSalesOrder(id: string) { return (await this.getClient()).deleteSalesOrder(id); }

  async listPurchaseOrders(params?: Record<string, unknown>) { return (await this.getClient()).listPurchaseOrders(params as any); }
  async getPurchaseOrder(id: string) { return (await this.getClient()).getPurchaseOrder(id); }
  async createPurchaseOrder(data: unknown) { return (await this.getClient()).createPurchaseOrder(data as any); }
  async updatePurchaseOrder(id: string, data: unknown) { return (await this.getClient()).updatePurchaseOrder(id, data as any); }
  async deletePurchaseOrder(id: string) { return (await this.getClient()).deletePurchaseOrder(id); }
}
