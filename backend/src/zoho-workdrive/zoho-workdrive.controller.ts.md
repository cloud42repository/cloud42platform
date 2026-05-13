# zoho-workdrive.controller.ts

NestJS REST controller exposing Zoho WorkDrive API endpoints for managing teams, folders, files, share links, and workspace members.

## Key Exports

- **ZohoWorkdriveController** — Controller registered at route `zoho-workdrive`, delegating to `ZohoWorkdriveService`.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Delete, Patch, Param, Body, Query decorators
- `ZohoWorkdriveService` — Business logic layer for WorkDrive operations

## How It Works

The controller defines RESTful endpoints grouped by resource:
1. **Teams** — List teams and get team details; search files within a team.
2. **Folders** — Get, create, rename, delete folders and list folder contents.
3. **Files** — Get, copy, move, and delete files.
4. **Share Links** — Create and retrieve share links for files.
5. **Workspace Members** — List, add, and remove members from workspaces.
6. **OAuth** — Authorize, exchange grant code, and revoke authentication.
