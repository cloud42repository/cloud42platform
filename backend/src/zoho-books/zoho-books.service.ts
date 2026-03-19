import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoBooksClient } from './ZohoBooksClient';
import type { ZohoRegion } from '../base/types';

@Injectable()
export class ZohoBooksService {
  private readonly logger = new Logger(ZohoBooksService.name);
  private readonly defaultClient: ZohoBooksClient;
  private readonly clients = new Map<string, { client: ZohoBooksClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ZohoBooksClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      region: (config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
      organizationId: config.get('ZOHO_ORGANIZATION_ID') ?? '',
    });
  }

  private async getClient(): Promise<ZohoBooksClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoBooksClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
            region: (this.config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
            organizationId: this.config.get('ZOHO_ORGANIZATION_ID') ?? '',
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Books client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  // Contacts
  async listContacts(params?: Record<string, unknown>) { return (await this.getClient()).listContacts(params as any); }
  async getContact(id: string) { return (await this.getClient()).getContact(id); }
  async createContact(data: unknown) { return (await this.getClient()).createContact(data as any); }
  async updateContact(id: string, data: unknown) { return (await this.getClient()).updateContact(id, data as any); }
  async deleteContact(id: string) { return (await this.getClient()).deleteContact(id); }

  // Invoices
  async listInvoices(params?: Record<string, unknown>) { return (await this.getClient()).listInvoices(params as any); }
  async getInvoice(id: string) { return (await this.getClient()).getInvoice(id); }
  async createInvoice(data: unknown) { return (await this.getClient()).createInvoice(data as any); }
  async updateInvoice(id: string, data: unknown) { return (await this.getClient()).updateInvoice(id, data as any); }
  async deleteInvoice(id: string) { return (await this.getClient()).deleteInvoice(id); }
  async sendInvoice(id: string, emailData?: Record<string, unknown>) { return (await this.getClient()).sendInvoice(id, emailData); }
  async markInvoiceAsSent(id: string) { return (await this.getClient()).markInvoiceAsSent(id); }
  async voidInvoice(id: string) { return (await this.getClient()).voidInvoice(id); }

  // Bills
  async listBills(params?: Record<string, unknown>) { return (await this.getClient()).listBills(params as any); }
  async getBill(id: string) { return (await this.getClient()).getBill(id); }
  async createBill(data: unknown) { return (await this.getClient()).createBill(data as any); }
  async updateBill(id: string, data: unknown) { return (await this.getClient()).updateBill(id, data as any); }
  async deleteBill(id: string) { return (await this.getClient()).deleteBill(id); }

  // Expenses
  async listExpenses(params?: Record<string, unknown>) { return (await this.getClient()).listExpenses(params as any); }
  async getExpense(id: string) { return (await this.getClient()).getExpense(id); }
  async createExpense(data: unknown) { return (await this.getClient()).createExpense(data as any); }
  async updateExpense(id: string, data: unknown) { return (await this.getClient()).updateExpense(id, data as any); }
  async deleteExpense(id: string) { return (await this.getClient()).deleteExpense(id); }

  // Payments
  async listPayments(params?: Record<string, unknown>) { return (await this.getClient()).listPayments(params as any); }
  async getPayment(id: string) { return (await this.getClient()).getPayment(id); }
  async createPayment(data: unknown) { return (await this.getClient()).createPayment(data as any); }
  async deletePayment(id: string) { return (await this.getClient()).deletePayment(id); }

  // Items
  async listItems(params?: Record<string, unknown>) { return (await this.getClient()).listItems(params as any); }
  async getItem(id: string) { return (await this.getClient()).getItem(id); }
  async createItem(data: unknown) { return (await this.getClient()).createItem(data as any); }
  async updateItem(id: string, data: unknown) { return (await this.getClient()).updateItem(id, data as any); }
  async deleteItem(id: string) { return (await this.getClient()).deleteItem(id); }
}
