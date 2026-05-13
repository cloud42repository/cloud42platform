# zoho-workdrive.controller.e2e-spec.ts

This end-to-end test validates the `ZohoWorkdriveController` by loading the full `AppModule` and invoking controller methods directly to verify integration with the real service layer for teams, folders, files, share links, and workspace members.

## Test Suites

- **ZohoWorkdriveController (e2e)** — Full integration test of all Zoho WorkDrive endpoints

## Key Test Cases

- `should be defined` — Controller instantiation check
- **Teams**: `listTeams`, `getTeam`, `searchFiles`
- **Folders**: `getFolder`, `createFolder`, `renameFolder`, `deleteFolder`, `listFolderContents`
- **Files**: `getFile`, `copyFile`, `moveFile`, `deleteFile`
- **Share Links**: `createShareLink`, `getShareLink`
- **Workspace Members**: `listWorkspaceMembers`, `addWorkspaceMember`, `removeWorkspaceMember`

## Test Setup

- Imports the full `AppModule` to create a complete application context
- Uses `beforeAll`/`afterAll` for module lifecycle (compile and close)
- Controller methods are called directly with dummy IDs and minimal payloads (folder names, parent IDs, target folders, emails, roles)
- All assertions verify that results are defined
