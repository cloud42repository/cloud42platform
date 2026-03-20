import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { ZohoOAuthService } from '../zoho-oauth/zoho-oauth.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoDeskClient } from './ZohoDeskClient';

@Injectable()
export class ZohoDeskService {
  private readonly logger = new Logger(ZohoDeskService.name);
  private readonly defaultClient: ZohoDeskClient;
  private readonly clients = new Map<string, { client: ZohoDeskClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
    private readonly zohoOAuth: ZohoOAuthService,
  ) {
    this.defaultClient = new ZohoDeskClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  private async getClient(): Promise<ZohoDeskClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoDeskClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Desk client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listTickets(params?: Record<string, unknown>) { return (await this.getClient()).listTickets(params as any); }
  async getTicket(id: string) { return (await this.getClient()).getTicket(id); }
  async createTicket(data: unknown) { return (await this.getClient()).createTicket(data as any); }
  async updateTicket(id: string, data: unknown) { return (await this.getClient()).updateTicket(id, data as any); }
  async deleteTicket(id: string) { return (await this.getClient()).deleteTicket(id); }
  async searchTickets(params: Record<string, unknown>) { return (await this.getClient()).searchTickets(params as any); }

  async listComments(ticketId: string) { return (await this.getClient()).listComments(ticketId); }
  async addComment(ticketId: string, data: unknown) { return (await this.getClient()).addComment(ticketId, data as any); }
  async deleteComment(ticketId: string, commentId: string) { return (await this.getClient()).deleteComment(ticketId, commentId); }

  async listContacts(params?: Record<string, unknown>) { return (await this.getClient()).listContacts(params as any); }
  async getContact(id: string) { return (await this.getClient()).getContact(id); }
  async createContact(data: unknown) { return (await this.getClient()).createContact(data as any); }
  async updateContact(id: string, data: unknown) { return (await this.getClient()).updateContact(id, data as any); }
  async deleteContact(id: string) { return (await this.getClient()).deleteContact(id); }

  async listAgents(params?: Record<string, unknown>) { return (await this.getClient()).listAgents(params as any); }
  async getAgent(id: string) { return (await this.getClient()).getAgent(id); }

  async listDepartments() { return (await this.getClient()).listDepartments(); }
  async getDepartment(id: string) { return (await this.getClient()).getDepartment(id); }

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
