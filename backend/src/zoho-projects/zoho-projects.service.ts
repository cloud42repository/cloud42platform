import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { ZohoOAuthService } from '../zoho-oauth/zoho-oauth.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoProjectsClient } from './ZohoProjectsClient';

@Injectable()
export class ZohoProjectsService {
  private readonly logger = new Logger(ZohoProjectsService.name);
  private readonly defaultClient: ZohoProjectsClient;
  private readonly clients = new Map<string, { client: ZohoProjectsClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
    private readonly zohoOAuth: ZohoOAuthService,
  ) {
    this.defaultClient = new ZohoProjectsClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      portalId: config.get('ZOHO_PORTAL_ID'),
    });
  }

  private async getClient(): Promise<ZohoProjectsClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoProjectsClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
            portalId: this.config.get('ZOHO_PORTAL_ID'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Projects client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listProjects(params?: Record<string, unknown>) { return (await this.getClient()).listProjects(params as any); }
  async getProject(id: string) { return (await this.getClient()).getProject(id); }
  async createProject(data: unknown) { return (await this.getClient()).createProject(data as any); }
  async updateProject(id: string, data: unknown) { return (await this.getClient()).updateProject(id, data as any); }
  async deleteProject(id: string) { return (await this.getClient()).deleteProject(id); }

  async listTasks(projectId: string, params?: Record<string, unknown>) { return (await this.getClient()).listTasks(projectId, params as any); }
  async getTask(projectId: string, taskId: string) { return (await this.getClient()).getTask(projectId, taskId); }
  async createTask(projectId: string, data: unknown) { return (await this.getClient()).createTask(projectId, data as any); }
  async updateTask(projectId: string, taskId: string, data: unknown) { return (await this.getClient()).updateTask(projectId, taskId, data as any); }
  async deleteTask(projectId: string, taskId: string) { return (await this.getClient()).deleteTask(projectId, taskId); }

  async listMilestones(projectId: string) { return (await this.getClient()).listMilestones(projectId); }

  async listBugs(projectId: string) { return (await this.getClient()).listBugs(projectId); }
  async getBug(projectId: string, bugId: string) { return (await this.getClient()).getBug(projectId, bugId); }
  async createBug(projectId: string, data: unknown) { return (await this.getClient()).createBug(projectId, data as any); }
  async updateBug(projectId: string, bugId: string, data: unknown) { return (await this.getClient()).updateBug(projectId, bugId, data as any); }
  async deleteBug(projectId: string, bugId: string) { return (await this.getClient()).deleteBug(projectId, bugId); }

  async listTimeLogs(projectId: string) { return (await this.getClient()).listTimeLogs(projectId); }
  async addTimeLog(projectId: string, taskId: string, data: unknown) { return (await this.getClient()).addTimeLog(projectId, taskId, data as any); }
  async deleteTimeLog(projectId: string, taskId: string, logId: string) { return (await this.getClient()).deleteTimeLog(projectId, taskId, logId); }

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
