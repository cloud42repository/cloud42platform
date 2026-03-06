import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoWorkDriveClient } from './ZohoWorkDriveClient';

@Injectable()
export class ZohoWorkdriveService {
  readonly client: ZohoWorkDriveClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoWorkDriveClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  listTeams() { return this.client.listTeams(); }
  getTeam(id: string) { return this.client.getTeam(id); }

  getFolder(id: string) { return this.client.getFolder(id); }
  createFolder(data: unknown) { return this.client.createFolder(data as any); }
  renameFolder(id: string, name: string) { return this.client.renameFolder(id, name); }
  deleteFolder(id: string) { return this.client.deleteFolder(id); }
  listFolderContents(folderId: string, params?: Record<string, unknown>) { return this.client.listFolderContents(folderId, params as any); }

  getFile(id: string) { return this.client.getFile(id); }
  copyFile(fileId: string, targetFolderId: string) { return this.client.copyFile(fileId, targetFolderId); }
  moveFile(fileId: string, targetFolderId: string) { return this.client.moveFile(fileId, targetFolderId); }
  deleteFile(id: string) { return this.client.deleteFile(id); }
  searchFiles(teamId: string, query: string) { return this.client.searchFiles(teamId, query); }

  createShareLink(data: unknown) { return this.client.createShareLink(data as any); }
  getShareLink(fileId: string) { return this.client.getShareLink(fileId); }

  listWorkspaceMembers(workspaceId: string) { return this.client.listWorkspaceMembers(workspaceId); }
  addWorkspaceMember(workspaceId: string, email: string, role: any) { return this.client.addWorkspaceMember(workspaceId, email, role); }
  removeWorkspaceMember(workspaceId: string, memberId: string) { return this.client.removeWorkspaceMember(workspaceId, memberId); }
}
