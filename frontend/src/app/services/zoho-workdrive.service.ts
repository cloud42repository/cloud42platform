import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-workdrive';

@Injectable({ providedIn: 'root' })
export class ZohoWorkdriveService {
  private readonly api = inject(ApiService);

  // Teams
  listTeams() {
    return this.api.get(PREFIX, '/teams');
  }
  getTeam(id: string) {
    return this.api.get(PREFIX, '/teams/:id', { id });
  }
  searchFiles(teamId: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/teams/:teamId/files/search', { teamId }, query);
  }

  // Folders
  getFolder(id: string) {
    return this.api.get(PREFIX, '/folders/:id', { id });
  }
  createFolder(body: unknown) {
    return this.api.post(PREFIX, '/folders', {}, body);
  }
  renameFolder(id: string, body: unknown) {
    return this.api.patch(PREFIX, '/folders/:id/rename', { id }, body);
  }
  deleteFolder(id: string) {
    return this.api.delete(PREFIX, '/folders/:id', { id });
  }
  listFolderContents(folderId: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/folders/:folderId/files', { folderId }, query);
  }

  // Files
  getFile(id: string) {
    return this.api.get(PREFIX, '/files/:id', { id });
  }
  copyFile(fileId: string, body: unknown) {
    return this.api.post(PREFIX, '/files/:fileId/copy', { fileId }, body);
  }
  moveFile(fileId: string, body: unknown) {
    return this.api.patch(PREFIX, '/files/:fileId/move', { fileId }, body);
  }
  deleteFile(id: string) {
    return this.api.delete(PREFIX, '/files/:id', { id });
  }

  // Share Links
  createShareLink(body: unknown) {
    return this.api.post(PREFIX, '/sharelinks', {}, body);
  }
  getShareLink(fileId: string) {
    return this.api.get(PREFIX, '/files/:fileId/sharelinks', { fileId });
  }

  // Workspace Members
  listWorkspaceMembers(workspaceId: string) {
    return this.api.get(PREFIX, '/workspaces/:workspaceId/members', { workspaceId });
  }
  addWorkspaceMember(workspaceId: string, body: unknown) {
    return this.api.post(PREFIX, '/workspaces/:workspaceId/members', { workspaceId }, body);
  }
  removeWorkspaceMember(workspaceId: string, memberId: string) {
    return this.api.delete(PREFIX, '/workspaces/:workspaceId/members/:memberId', { workspaceId, memberId });
  }
}
