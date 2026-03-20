import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { ZohoOAuthService } from '../zoho-oauth/zoho-oauth.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoSalesIQClient } from './ZohoSalesIQClient';

@Injectable()
export class ZohoSalesIQService {
  private readonly logger = new Logger(ZohoSalesIQService.name);
  private readonly defaultClient: ZohoSalesIQClient;
  private readonly clients = new Map<string, { client: ZohoSalesIQClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
    private readonly zohoOAuth: ZohoOAuthService,
  ) {
    this.defaultClient = new ZohoSalesIQClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  private async getClient(): Promise<ZohoSalesIQClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoSalesIQClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho SalesIQ client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listVisitors(screenName: string, params?: Record<string, unknown>) { return (await this.getClient()).listVisitors(screenName, params as any); }
  async getVisitor(screenName: string, visitorId: string) { return (await this.getClient()).getVisitor(screenName, visitorId); }
  async searchVisitors(screenName: string, params: Record<string, unknown>) { return (await this.getClient()).searchVisitors(screenName, params as any); }

  async listChats(screenName: string, params?: Record<string, unknown>) { return (await this.getClient()).listChats(screenName, params as any); }
  async getChat(screenName: string, chatId: string) { return (await this.getClient()).getChat(screenName, chatId); }
  async listChatMessages(screenName: string, chatId: string) { return (await this.getClient()).listChatMessages(screenName, chatId); }
  async sendChatMessage(screenName: string, chatId: string, text: string) { return (await this.getClient()).sendChatMessage(screenName, chatId, text); }
  async setRating(screenName: string, chatId: string, rating: number) { return (await this.getClient()).setRating(screenName, chatId, rating); }

  async listOperators(screenName: string) { return (await this.getClient()).listOperators(screenName); }
  async getOperator(screenName: string, operatorId: string) { return (await this.getClient()).getOperator(screenName, operatorId); }
  async setOperatorAvailability(screenName: string, operatorId: string, status: string) { return (await this.getClient()).setOperatorAvailability(screenName, operatorId, status as any); }

  async listDepartments(screenName: string) { return (await this.getClient()).listDepartments(screenName); }
  async getDepartment(screenName: string, id: string) { return (await this.getClient()).getDepartment(screenName, id); }

  async listBots(screenName: string) { return (await this.getClient()).listBots(screenName); }
  async sendBotMessage(screenName: string, botId: string, payload: unknown) { return (await this.getClient()).sendBotMessage(screenName, botId, payload as any); }

  async listFeedbackForms(screenName: string) { return (await this.getClient()).listFeedbackForms(screenName); }

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
