# ZohoWorkDriveClient.spec.ts

Tests the `ZohoWorkDriveClient` class, verifying correct base URL, auth header injection, and operations for teams, folders, files (including search and copy), share links, and workspace members against the Zoho WorkDrive API v1.

## Test Suites

- **ZohoWorkDriveClient** — Main suite covering authentication, URL configuration, and all cloud storage resource endpoints.

## Key Test Cases

- `uses the correct base URL` — Verifies base URL contains `workdrive.zoho.com/api/v1`
- `injects auth header` — Confirms `Zoho-oauthtoken` header is set
- `listTeams()` / `getTeam()` — Team retrieval
- `getFolder()` / `createFolder()` / `deleteFolder()` / `listFolderContents()` — Folder CRUD and browsing
- `getFile()` / `deleteFile()` / `searchFiles()` / `copyFile()` — File operations including search by team and copy to target folder
- `getShareLink()` / `createShareLink()` — Share link management
- `listWorkspaceMembers()` / `addWorkspaceMember()` / `removeWorkspaceMember()` — Workspace member management

## Test Setup

- **beforeEach**: Creates a new `ZohoWorkDriveClient` instance with `PassthroughAuth` and initializes `axios-mock-adapter`.
- **afterEach**: Restores the mock adapter.
