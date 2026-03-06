import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  WorkDriveTeam,
  WorkDriveFolder, CreateFolderDTO,
  WorkDriveFile,
  WorkDriveShareLink, CreateShareLinkDTO,
  WorkDriveMember,
  WorkDriveListParams,
} from "./zoho-workdrive.dto";

export interface ZohoWorkDriveConfig extends ZohoCredentials {
  /** Override the full API base URL. Defaults to https://workdrive.zoho.com/api/v1 */
  apiBaseUrl?: string;
}

/**
 * Zoho WorkDrive v1 API client.
 * Docs: https://workdrive.zoho.com/apidocs/v1/
 */
export class ZohoWorkDriveClient extends ZohoBaseClient {
  constructor(config: ZohoWorkDriveConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://workdrive.zoho.com/api/v1",
    });
  }

  // â”€â”€â”€ Teams â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listTeams(): Promise<{ data: WorkDriveTeam[] }> {
    return this.get("/teams");
  }
  getTeam(id: string): Promise<{ data: WorkDriveTeam }> {
    return this.get(`/teams/${id}`);
  }

  // â”€â”€â”€ Folders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  getFolder(id: string): Promise<{ data: WorkDriveFolder }> {
    return this.get(`/files/${id}`);
  }
  createFolder(data: CreateFolderDTO): Promise<{ data: WorkDriveFolder }> {
    return this.post("/files", {
      data: {
        attributes: { name: data.name, parent_id: data.parent_id },
        type: "files",
      },
    });
  }
  renameFolder(id: string, name: string): Promise<{ data: WorkDriveFolder }> {
    return this.patch(`/files/${id}`, { data: { attributes: { name }, type: "files", id } });
  }
  deleteFolder(id: string): Promise<unknown> {
    return this.delete(`/files/${id}`);
  }
  listFolderContents(folderId: string, params?: WorkDriveListParams): Promise<{ data: WorkDriveFile[] }> {
    return this.get(`/files/${folderId}/files`, { params });
  }

  // â”€â”€â”€ Files â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  getFile(id: string): Promise<{ data: WorkDriveFile }> {
    return this.get(`/files/${id}`);
  }
  copyFile(fileId: string, targetFolderId: string): Promise<{ data: WorkDriveFile }> {
    return this.post(`/files/${fileId}/copy`, { data: { attributes: { parent_id: targetFolderId }, type: "files" } });
  }
  moveFile(fileId: string, targetFolderId: string): Promise<{ data: WorkDriveFile }> {
    return this.patch(`/files/${fileId}`, { data: { attributes: { parent_id: targetFolderId }, type: "files", id: fileId } });
  }
  deleteFile(id: string): Promise<unknown> {
    return this.delete(`/files/${id}`);
  }
  searchFiles(teamId: string, query: string): Promise<{ data: WorkDriveFile[] }> {
    return this.get(`/teams/${teamId}/files/search`, { params: { search_query: query } });
  }

  // â”€â”€â”€ Share Links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  createShareLink(data: CreateShareLinkDTO): Promise<{ data: WorkDriveShareLink }> {
    return this.post(`/files/${data.entity_id}/sharelinks`, { data: { attributes: data, type: "sharelinks" } });
  }
  getShareLink(fileId: string): Promise<{ data: WorkDriveShareLink }> {
    return this.get(`/files/${fileId}/sharelinks`);
  }

  // â”€â”€â”€ Members â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listWorkspaceMembers(workspaceId: string): Promise<{ data: WorkDriveMember[] }> {
    return this.get(`/workspaces/${workspaceId}/members`);
  }
  addWorkspaceMember(workspaceId: string, email: string, role: WorkDriveMember["role"]): Promise<unknown> {
    return this.post(`/workspaces/${workspaceId}/members`, { data: { attributes: { email_id: email, role }, type: "members" } });
  }
  removeWorkspaceMember(workspaceId: string, memberId: string): Promise<unknown> {
    return this.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  }
}
