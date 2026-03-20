import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { ZohoOAuthService } from '../zoho-oauth/zoho-oauth.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoSignClient } from './ZohoSignClient';

@Injectable()
export class ZohoSignService {
  private readonly logger = new Logger(ZohoSignService.name);
  private readonly defaultClient: ZohoSignClient;
  private readonly clients = new Map<string, { client: ZohoSignClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
    private readonly zohoOAuth: ZohoOAuthService,
  ) {
    this.defaultClient = new ZohoSignClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  private async getClient(): Promise<ZohoSignClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoSignClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Sign client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listRequests(params?: Record<string, unknown>) { return (await this.getClient()).listRequests(params as any); }
  async getRequest(id: string) { return (await this.getClient()).getRequest(id); }
  async createRequest(data: unknown) { return (await this.getClient()).createRequest(data as any); }
  async sendRequest(id: string) { return (await this.getClient()).sendRequest(id); }
  async deleteRequest(id: string) { return (await this.getClient()).deleteRequest(id); }
  async recallRequest(id: string) { return (await this.getClient()).recallRequest(id); }
  async remindRequest(id: string) { return (await this.getClient()).remindRequest(id); }

  async listTemplates(params?: Record<string, unknown>) { return (await this.getClient()).listTemplates(params as any); }
  async getTemplate(id: string) { return (await this.getClient()).getTemplate(id); }
  async createRequestFromTemplate(templateId: string, recipientData: unknown) { return (await this.getClient()).createRequestFromTemplate(templateId, recipientData); }

  async getDocument(requestId: string, documentId: string) { return (await this.getClient()).getDocument(requestId, documentId); }
  async downloadDocument(requestId: string, documentId: string) { return (await this.getClient()).downloadDocument(requestId, documentId); }

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
