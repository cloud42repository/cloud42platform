import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoMailClient } from './ZohoMailClient';

@Injectable()
export class ZohoMailService {
  private readonly logger = new Logger(ZohoMailService.name);
  private readonly defaultClient: ZohoMailClient;
  private readonly clients = new Map<string, { client: ZohoMailClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ZohoMailClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  private async getClient(): Promise<ZohoMailClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoMailClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Mail client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listAccounts() { return (await this.getClient()).listAccounts(); }
  async getAccount(accountId: string) { return (await this.getClient()).getAccount(accountId); }

  async listFolders(accountId: string) { return (await this.getClient()).listFolders(accountId); }

  async listMessages(accountId: string, folderId: string, params?: Record<string, unknown>) { return (await this.getClient()).listMessages(accountId, folderId, params as any); }
  async getMessage(accountId: string, messageId: string) { return (await this.getClient()).getMessage(accountId, messageId); }
  async sendMessage(accountId: string, data: unknown) { return (await this.getClient()).sendMessage(accountId, data as any); }
  async deleteMessage(accountId: string, messageId: string) { return (await this.getClient()).deleteMessage(accountId, messageId); }
  async moveMessage(accountId: string, messageId: string, targetFolderId: string) { return (await this.getClient()).moveMessage(accountId, messageId, targetFolderId); }
  async markRead(accountId: string, messageId: string, isRead: boolean) { return (await this.getClient()).markRead(accountId, messageId, isRead); }
  async searchMessages(accountId: string, searchKey: string, params?: Record<string, unknown>) { return (await this.getClient()).searchMessages(accountId, searchKey, params as any); }

  async listContacts(accountId: string) { return (await this.getClient()).listContacts(accountId); }
  async createContact(accountId: string, data: unknown) { return (await this.getClient()).createContact(accountId, data as any); }
  async deleteContact(accountId: string, contactId: string) { return (await this.getClient()).deleteContact(accountId, contactId); }
}
