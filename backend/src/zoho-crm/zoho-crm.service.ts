import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoCRMClient } from './ZohoCRMClient';
import type { ZohoRegion } from '../base/types';

@Injectable()
export class ZohoCrmService {
  private readonly logger = new Logger(ZohoCrmService.name);
  private readonly defaultClient: ZohoCRMClient;
  private readonly clients = new Map<string, { client: ZohoCRMClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ZohoCRMClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      region: (config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
    });
  }

  /** Resolve a per-user ZohoCRM client (DB config → env fallback, cached 10 min). */
  private async getClient(): Promise<ZohoCRMClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;

    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;

    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoCRMClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
            region: (this.config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho CRM client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through to default */ }

    return this.defaultClient;
  }

  // â”€â”€â”€ Leads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async listLeads(params?: Record<string, unknown>) { return (await this.getClient()).listLeads(params as any); }
  async getLead(id: string) { return (await this.getClient()).getLead(id); }
  async createLeads(leads: unknown[]) { return (await this.getClient()).createLeads(leads as any); }
  async updateLeads(leads: unknown[]) { return (await this.getClient()).updateLeads(leads as any); }
  async deleteLead(id: string) { return (await this.getClient()).deleteLead(id); }
  async searchLeads(params: Record<string, unknown>) { return (await this.getClient()).searchLeads(params as any); }

  // â”€â”€â”€ Contacts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async listContacts(params?: Record<string, unknown>) { return (await this.getClient()).listContacts(params as any); }
  async getContact(id: string) { return (await this.getClient()).getContact(id); }
  async createContacts(contacts: unknown[]) { return (await this.getClient()).createContacts(contacts as any); }
  async updateContacts(contacts: unknown[]) { return (await this.getClient()).updateContacts(contacts as any); }
  async deleteContact(id: string) { return (await this.getClient()).deleteContact(id); }
  async searchContacts(params: Record<string, unknown>) { return (await this.getClient()).searchContacts(params as any); }

  // â”€â”€â”€ Accounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async listAccounts(params?: Record<string, unknown>) { return (await this.getClient()).listAccounts(params as any); }
  async getAccount(id: string) { return (await this.getClient()).getAccount(id); }
  async createAccounts(accounts: unknown[]) { return (await this.getClient()).createAccounts(accounts as any); }
  async updateAccounts(accounts: unknown[]) { return (await this.getClient()).updateAccounts(accounts as any); }
  async deleteAccount(id: string) { return (await this.getClient()).deleteAccount(id); }

  // â”€â”€â”€ Deals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async listDeals(params?: Record<string, unknown>) { return (await this.getClient()).listDeals(params as any); }
  async getDeal(id: string) { return (await this.getClient()).getDeal(id); }
  async createDeals(deals: unknown[]) { return (await this.getClient()).createDeals(deals as any); }
  async updateDeals(deals: unknown[]) { return (await this.getClient()).updateDeals(deals as any); }
  async deleteDeal(id: string) { return (await this.getClient()).deleteDeal(id); }

  // â”€â”€â”€ Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async listTasks(params?: Record<string, unknown>) { return (await this.getClient()).listTasks(params as any); }
  async getTask(id: string) { return (await this.getClient()).getTask(id); }
  async createTasks(tasks: unknown[]) { return (await this.getClient()).createTasks(tasks as any); }
  async updateTasks(tasks: unknown[]) { return (await this.getClient()).updateTasks(tasks as any); }
  async deleteTask(id: string) { return (await this.getClient()).deleteTask(id); }

  // â”€â”€â”€ Notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async listNotes(params?: Record<string, unknown>) { return (await this.getClient()).listNotes(params as any); }
  async getNote(id: string) { return (await this.getClient()).getNote(id); }
  async createNotes(notes: unknown[]) { return (await this.getClient()).createNotes(notes as any); }
  async deleteNote(id: string) { return (await this.getClient()).deleteNote(id); }

  // â”€â”€â”€ Generic module â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async listRecords(module: string, params?: Record<string, unknown>) { return (await this.getClient()).listRecords(module, params as any); }
  async getRecord(module: string, id: string) { return (await this.getClient()).getRecord(module, id); }
  async createRecords(module: string, data: unknown[]) { return (await this.getClient()).createRecords(module, data as any); }
  async updateRecords(module: string, data: unknown[]) { return (await this.getClient()).updateRecords(module, data as any); }
  async deleteRecord(module: string, id: string) { return (await this.getClient()).deleteRecord(module, id); }
  async searchRecords(module: string, params: Record<string, unknown>) { return (await this.getClient()).searchRecords(module, params as any); }
}
