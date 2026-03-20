import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { ZohoOAuthService } from '../zoho-oauth/zoho-oauth.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoCliqClient } from './ZohoCliqClient';

@Injectable()
export class ZohoCliqService {
  private readonly logger = new Logger(ZohoCliqService.name);
  private readonly defaultClient: ZohoCliqClient;
  private readonly clients = new Map<string, { client: ZohoCliqClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
    private readonly zohoOAuth: ZohoOAuthService,
  ) {
    this.defaultClient = new ZohoCliqClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  private async getClient(): Promise<ZohoCliqClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoCliqClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Cliq client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listChannels(params?: Record<string, unknown>) { return (await this.getClient()).listChannels(params as any); }
  async getChannel(uniqueName: string) { return (await this.getClient()).getChannel(uniqueName); }
  async createChannel(data: unknown) { return (await this.getClient()).createChannel(data as any); }
  async deleteChannel(uniqueName: string) { return (await this.getClient()).deleteChannel(uniqueName); }
  async addChannelMember(uniqueName: string, emails: string[]) { return (await this.getClient()).addChannelMember(uniqueName, emails); }
  async removeChannelMember(uniqueName: string, email: string) { return (await this.getClient()).removeChannelMember(uniqueName, email); }

  async listChannelMessages(uniqueName: string) { return (await this.getClient()).listChannelMessages(uniqueName); }
  async sendChannelMessage(uniqueName: string, data: unknown) { return (await this.getClient()).sendChannelMessage(uniqueName, data as any); }
  async sendDirectMessage(email: string, data: unknown) { return (await this.getClient()).sendDirectMessage(email, data as any); }
  async deleteMessage(channelUniqueName: string, messageId: string) { return (await this.getClient()).deleteMessage(channelUniqueName, messageId); }

  async listUserGroups() { return (await this.getClient()).listUserGroups(); }
  async getUserGroup(uniqueName: string) { return (await this.getClient()).getUserGroup(uniqueName); }
  async createUserGroup(data: unknown) { return (await this.getClient()).createUserGroup(data as any); }

  async listBots() { return (await this.getClient()).listBots(); }
  async sendBotMessage(botUniqueName: string, data: unknown) { return (await this.getClient()).sendBotMessage(botUniqueName, data as any); }

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
