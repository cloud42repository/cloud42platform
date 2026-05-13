# zoho-workdrive.service.ts

Angular service providing an HTTP client for the Zoho WorkDrive cloud file management API. Manages teams, folders, files, share links, and workspace members.

## Key Exports

- **ZohoWorkdriveService** — Injectable Angular service (root-provided) for Zoho WorkDrive operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-workdrive'` and provides methods grouped by resource:

1. **Teams** — List and get teams; search files within a team.
2. **Folders** — Get, create, rename, delete folders; list folder contents.
3. **Files** — Get, copy, move, delete files.
4. **Share Links** — Create a share link for a file; get existing share links.
5. **Workspace Members** — List, add, and remove members from a workspace.
