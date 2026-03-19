import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoWorkDriveClient } from './ZohoWorkDriveClient';

@Injectable()
export class ZohoWorkdriveService {
  private readonly logger = new Logger(ZohoWorkdriveService.name);
  private readonly defaultClient: ZohoWorkDriveClient;
  private readonly clients = new Map<string, { client: ZohoWorkDriveClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ZohoWorkDriveClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  private async getClient(): Promise<ZohoWorkDriveClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoWorkDriveClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho WorkDrive client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listTeams() { return (await this.getClient()).listTeams(); }
  async getTeam(id: string) { return (await this.getClient()).getTeam(id); }

  async getFolder(id: string) { return (await this.getClient()).getFolder(id); }
  async createFolder(data: unknown) { return (await this.getClient()).createFolder(data as any); }
  async renameFolder(id: string, name: string) { return (await this.getClient()).renameFolder(id, name); }
  async deleteFolder(id: string) { return (await this.getClient()).deleteFolder(id); }
  async listFolderContents(folderId: string, params?: Record<string, unknown>) { return (await this.getClient()).listFolderContents(folderId, params as any); }

  async getFile(id: string) { return (await this.getClient()).getFile(id); }
  async copyFile(fileId: string, targetFolderId: string) { return (await this.getClient()).copyFile(fileId, targetFolderId); }
  async moveFile(fileId: string, targetFolderId: string) { return (await this.getClient()).moveFile(fileId, targetFolderId); }
  async deleteFile(id: string) { return (await this.getClient()).deleteFile(id); }
  async searchFiles(teamId: string, query: string) { return (await this.getClient()).searchFiles(teamId, query); }

  async createShareLink(data: unknown) { return (await this.getClient()).createShareLink(data as any); }
  async getShareLink(fileId: string) { return (await this.getClient()).getShareLink(fileId); }

  async listWorkspaceMembers(workspaceId: string) { return (await this.getClient()).listWorkspaceMembers(workspaceId); }
  async addWorkspaceMember(workspaceId: string, email: string, role: any) { return (await this.getClient()).addWorkspaceMember(workspaceId, email, role); }
  async removeWorkspaceMember(workspaceId: string, memberId: string) { return (await this.getClient()).removeWorkspaceMember(workspaceId, memberId); }
}
