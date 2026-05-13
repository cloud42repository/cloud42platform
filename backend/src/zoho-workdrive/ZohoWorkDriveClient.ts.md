# ZohoWorkDriveClient.ts

Low-level HTTP client for the Zoho WorkDrive v1 REST API, extending `ZohoBaseClient` with typed methods for teams, folders, files, share links, and workspace members.

## Key Exports

- **ZohoWorkDriveConfig** — Configuration interface extending `ZohoCredentials` with optional `organizationId` and `apiBaseUrl`
- **ZohoWorkDriveClient** — Client class with methods for the full WorkDrive API surface

## Dependencies

- `ZohoBaseClient` from `../base/ZohoBaseClient` — Base HTTP client with token management
- `ZohoCredentials` from `../base/types` — Credential interface
- DTO types from `./zoho-workdrive.dto` — Type definitions for WorkDrive entities

## How It Works

1. Constructor sets API base URL to `https://workdrive.zoho.com/api/v1` by default.
2. **Teams**: `listTeams`, `getTeam` — Team discovery.
3. **Folders**: `getFolder`, `createFolder`, `renameFolder`, `deleteFolder`, `listFolderContents` — Full folder management using JSON:API-style payloads.
4. **Files**: `getFile`, `copyFile`, `moveFile`, `deleteFile`, `searchFiles` — File operations including team-scoped search.
5. **Share Links**: `createShareLink`, `getShareLink` — Create and retrieve sharing URLs.
6. **Members**: `listWorkspaceMembers`, `addWorkspaceMember`, `removeWorkspaceMember` — Workspace access control.
