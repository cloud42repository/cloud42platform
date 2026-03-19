import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoInvoiceClient } from './ZohoInvoiceClient';
import type { ZohoRegion } from '../base/types';

@Injectable()
export class ZohoInvoiceService {
  private readonly logger = new Logger(ZohoInvoiceService.name);
  private readonly defaultClient: ZohoInvoiceClient;
  private readonly clients = new Map<string, { client: ZohoInvoiceClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ZohoInvoiceClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      region: (config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
      organizationId: config.get('ZOHO_ORGANIZATION_ID') ?? '',
    });
  }

  private async getClient(): Promise<ZohoInvoiceClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoInvoiceClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
            region: (this.config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
            organizationId: this.config.get('ZOHO_ORGANIZATION_ID') ?? '',
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Invoice client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  // Customers
  async listCustomers(params?: Record<string, unknown>) { return (await this.getClient()).listCustomers(params as any); }
  async getCustomer(id: string) { return (await this.getClient()).getCustomer(id); }
  async createCustomer(data: unknown) { return (await this.getClient()).createCustomer(data as any); }
  async updateCustomer(id: string, data: unknown) { return (await this.getClient()).updateCustomer(id, data as any); }
  async deleteCustomer(id: string) { return (await this.getClient()).deleteCustomer(id); }

  // Invoices
  async listInvoices(params?: Record<string, unknown>) { return (await this.getClient()).listInvoices(params as any); }
  async getInvoice(id: string) { return (await this.getClient()).getInvoice(id); }
  async createInvoice(data: unknown) { return (await this.getClient()).createInvoice(data as any); }
  async updateInvoice(id: string, data: unknown) { return (await this.getClient()).updateInvoice(id, data as any); }
  async deleteInvoice(id: string) { return (await this.getClient()).deleteInvoice(id); }
  async sendInvoice(id: string) { return (await this.getClient()).sendInvoice(id); }

  // Estimates
  async listEstimates(params?: Record<string, unknown>) { return (await this.getClient()).listEstimates(params as any); }
  async getEstimate(id: string) { return (await this.getClient()).getEstimate(id); }
  async createEstimate(data: unknown) { return (await this.getClient()).createEstimate(data as any); }
  async updateEstimate(id: string, data: unknown) { return (await this.getClient()).updateEstimate(id, data as any); }
  async deleteEstimate(id: string) { return (await this.getClient()).deleteEstimate(id); }

  // Recurring invoices
  async listRecurringInvoices(params?: Record<string, unknown>) { return (await this.getClient()).listRecurringInvoices(params as any); }
  async getRecurringInvoice(id: string) { return (await this.getClient()).getRecurringInvoice(id); }
  async createRecurringInvoice(data: unknown) { return (await this.getClient()).createRecurringInvoice(data as any); }
  async deleteRecurringInvoice(id: string) { return (await this.getClient()).deleteRecurringInvoice(id); }

  // Payments
  async listPayments(params?: Record<string, unknown>) { return (await this.getClient()).listPayments(params as any); }
  async createPayment(data: unknown) { return (await this.getClient()).createPayment(data as any); }
  async deletePayment(id: string) { return (await this.getClient()).deletePayment(id); }
}
