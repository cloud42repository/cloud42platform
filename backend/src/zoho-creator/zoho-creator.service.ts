import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { ZohoOAuthService } from '../zoho-oauth/zoho-oauth.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoCreatorClient } from './ZohoCreatorClient';

@Injectable()
export class ZohoCreatorService {
  private readonly logger = new Logger(ZohoCreatorService.name);
  private readonly defaultClient: ZohoCreatorClient;
  private readonly clients = new Map<string, { client: ZohoCreatorClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
    private readonly zohoOAuth: ZohoOAuthService,
  ) {
    this.defaultClient = new ZohoCreatorClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      ownerName: config.get('ZOHO_CREATOR_OWNER_NAME'),
    });
  }

  private async getClient(): Promise<ZohoCreatorClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoCreatorClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
            ownerName: this.config.get('ZOHO_CREATOR_OWNER_NAME'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Creator client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listApplications() { return (await this.getClient()).listApplications(); }
  async getApplication(appLinkName: string) { return (await this.getClient()).getApplication(appLinkName); }

  async listForms(appLinkName: string) { return (await this.getClient()).listForms(appLinkName); }
  async getForm(appLinkName: string, formLinkName: string) { return (await this.getClient()).getForm(appLinkName, formLinkName); }

  async listRecords(appLinkName: string, reportLinkName: string, params?: Record<string, unknown>) { return (await this.getClient()).listRecords(appLinkName, reportLinkName, params as any); }
  async getRecord(appLinkName: string, reportLinkName: string, id: string) { return (await this.getClient()).getRecord(appLinkName, reportLinkName, id); }
  async createRecord(appLinkName: string, formLinkName: string, data: unknown) { return (await this.getClient()).createRecord(appLinkName, formLinkName, data as any); }
  async updateRecord(appLinkName: string, reportLinkName: string, id: string, data: unknown) { return (await this.getClient()).updateRecord(appLinkName, reportLinkName, id, data as any); }
  async deleteRecord(appLinkName: string, reportLinkName: string, id: string) { return (await this.getClient()).deleteRecord(appLinkName, reportLinkName, id); }
  async searchRecords(appLinkName: string, reportLinkName: string, criteria: string, params?: Record<string, unknown>) { return (await this.getClient()).searchRecords(appLinkName, reportLinkName, criteria, params as any); }

  async listReports(appLinkName: string) { return (await this.getClient()).listReports(appLinkName); }
  async triggerWorkflow(appLinkName: string, workflowName: string, data?: Record<string, unknown>) { return (await this.getClient()).triggerWorkflow(appLinkName, workflowName, data); }

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
