import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { ZohoOAuthService } from '../zoho-oauth/zoho-oauth.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoCampaignsClient } from './ZohoCampaignsClient';

@Injectable()
export class ZohoCampaignsService {
  private readonly logger = new Logger(ZohoCampaignsService.name);
  private readonly defaultClient: ZohoCampaignsClient;
  private readonly clients = new Map<string, { client: ZohoCampaignsClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
    private readonly zohoOAuth: ZohoOAuthService,
  ) {
    this.defaultClient = new ZohoCampaignsClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  private async getClient(): Promise<ZohoCampaignsClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoCampaignsClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Campaigns client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listMailingLists(params?: Record<string, unknown>) { return (await this.getClient()).listMailingLists(params); }
  async getMailingList(listKey: string) { return (await this.getClient()).getMailingList(listKey); }
  async createMailingList(data: unknown) { return (await this.getClient()).createMailingList(data as any); }
  async deleteMailingList(listKey: string) { return (await this.getClient()).deleteMailingList(listKey); }

  async listSubscribers(listKey: string, params?: Record<string, unknown>) { return (await this.getClient()).listSubscribers(listKey, params); }
  async addSubscriber(listKey: string, data: unknown) { return (await this.getClient()).addSubscriber(listKey, data as any); }
  async removeSubscriber(listKey: string, email: string) { return (await this.getClient()).removeSubscriber(listKey, email); }

  async listTopics() { return (await this.getClient()).listTopics(); }

  async listCampaigns(params?: Record<string, unknown>) { return (await this.getClient()).listCampaigns(params); }
  async getCampaign(campaignKey: string) { return (await this.getClient()).getCampaign(campaignKey); }
  async sendCampaign(campaignKey: string) { return (await this.getClient()).sendCampaign(campaignKey); }
  async scheduleCampaign(campaignKey: string, scheduleTime: string) { return (await this.getClient()).scheduleCampaign(campaignKey, scheduleTime); }

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
