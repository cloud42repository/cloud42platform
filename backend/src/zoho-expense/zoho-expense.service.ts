import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoExpenseClient } from './ZohoExpenseClient';

@Injectable()
export class ZohoExpenseService {
  private readonly logger = new Logger(ZohoExpenseService.name);
  private readonly defaultClient: ZohoExpenseClient;
  private readonly clients = new Map<string, { client: ZohoExpenseClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ZohoExpenseClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      organizationId: config.get('ZOHO_ORGANIZATION_ID'),
    });
  }

  private async getClient(): Promise<ZohoExpenseClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoExpenseClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
            organizationId: this.config.get('ZOHO_ORGANIZATION_ID'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Expense client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listCategories() { return (await this.getClient()).listCategories(); }
  async getCategory(id: string) { return (await this.getClient()).getCategory(id); }

  async listExpenses(params?: Record<string, unknown>) { return (await this.getClient()).listExpenses(params as any); }
  async getExpense(id: string) { return (await this.getClient()).getExpense(id); }
  async createExpense(data: unknown) { return (await this.getClient()).createExpense(data as any); }
  async updateExpense(id: string, data: unknown) { return (await this.getClient()).updateExpense(id, data as any); }
  async deleteExpense(id: string) { return (await this.getClient()).deleteExpense(id); }

  async listReports(params?: Record<string, unknown>) { return (await this.getClient()).listReports(params as any); }
  async getReport(id: string) { return (await this.getClient()).getReport(id); }
  async createReport(data: unknown) { return (await this.getClient()).createReport(data as any); }
  async updateReport(id: string, data: unknown) { return (await this.getClient()).updateReport(id, data as any); }
  async deleteReport(id: string) { return (await this.getClient()).deleteReport(id); }
  async submitReport(id: string) { return (await this.getClient()).submitReport(id); }
  async approveReport(id: string) { return (await this.getClient()).approveReport(id); }

  async listAdvances() { return (await this.getClient()).listAdvances(); }
  async getAdvance(id: string) { return (await this.getClient()).getAdvance(id); }
}
