import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoAnalyticsClient } from './ZohoAnalyticsClient';

@Injectable()
export class ZohoAnalyticsService {
  private readonly logger = new Logger(ZohoAnalyticsService.name);
  private readonly defaultClient: ZohoAnalyticsClient;
  private readonly clients = new Map<string, { client: ZohoAnalyticsClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ZohoAnalyticsClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      accountOwnerEmail: config.get('ZOHO_ANALYTICS_OWNER_EMAIL'),
    });
  }

  private async getClient(): Promise<ZohoAnalyticsClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoAnalyticsClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
            accountOwnerEmail: this.config.get('ZOHO_ANALYTICS_OWNER_EMAIL'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Analytics client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listWorkspaces() { return (await this.getClient()).listWorkspaces(); }
  async getWorkspace(id: string) { return (await this.getClient()).getWorkspace(id); }
  async createWorkspace(data: unknown) { return (await this.getClient()).createWorkspace(data as any); }
  async deleteWorkspace(id: string) { return (await this.getClient()).deleteWorkspace(id); }

  async listViews(workspaceId: string, params?: Record<string, unknown>) { return (await this.getClient()).listViews(workspaceId, params as any); }
  async getView(workspaceId: string, viewId: string) { return (await this.getClient()).getView(workspaceId, viewId); }
  async createView(workspaceId: string, data: unknown) { return (await this.getClient()).createView(workspaceId, data as any); }
  async deleteView(workspaceId: string, viewId: string) { return (await this.getClient()).deleteView(workspaceId, viewId); }

  async listReports(workspaceId: string) { return (await this.getClient()).listReports(workspaceId); }
  async listDashboards(workspaceId: string) { return (await this.getClient()).listDashboards(workspaceId); }

  async importData(config: unknown, data: unknown) { return (await this.getClient()).importData(config as any, data); }
  async exportData(workspaceId: string, viewId: string, format: 'csv' | 'json' | 'xlsx' = 'json') { return (await this.getClient()).exportData(workspaceId, viewId, format); }
}
