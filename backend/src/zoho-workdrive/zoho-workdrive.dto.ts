import { ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Team / Workspace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface WorkDriveTeam {
  id?: string;
  name?: string;
  created_time?: string;
  members_count?: number;
}

// â”€â”€â”€ Folder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type WorkDriveFolderType = "teamfolder" | "privfolder" | "myspacefolder";

export interface WorkDriveFolder {
  id?: string;
  name?: string;
  type?: WorkDriveFolderType;
  parent_id?: string;
  creator_id?: string;
  created_time?: string;
  modified_time?: string;
  // sub-resources
  folder_count?: number;
  file_count?: number;
}

export interface CreateFolderDTO {
  name: string;
  parent_id: string;
}

// â”€â”€â”€ File â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type WorkDriveFileType = "spreadsheet" | "presentation" | "writer" | "pdf" | "image" | "video" | "other";

export interface WorkDriveFile {
  id?: string;
  name?: string;
  type?: WorkDriveFileType;
  parent_id?: string;
  creator_id?: string;
  size?: number;
  created_time?: string;
  modified_time?: string;
  download_url?: string;
}

// â”€â”€â”€ Share Link â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type SharePermission = "view" | "comment" | "edit";

export interface WorkDriveShareLink {
  link_validity?: "one_day" | "one_week" | "one_month" | "never";
  shared_type?: "org" | "anyone" | "custom";
  permission?: SharePermission;
  link?: string;
}

export interface CreateShareLinkDTO {
  entity_id: string;
  shared_type: "org" | "anyone";
  link_validity?: "one_day" | "one_week" | "one_month" | "never";
  permission?: SharePermission;
}

// â”€â”€â”€ Workspace Member â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type MemberRole = "admin" | "organizer" | "editor" | "commenter" | "viewer";

export interface WorkDriveMember {
  id?: string;
  email?: string;
  name?: string;
  role?: MemberRole;
  status?: "active" | "inactive";
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface WorkDriveListParams extends ZohoListParams {
  parent_id?: string;
  type?: WorkDriveFileType;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
