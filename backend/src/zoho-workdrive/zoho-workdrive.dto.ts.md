# zoho-workdrive.dto.ts

TypeScript type definitions and interfaces for Zoho WorkDrive API entities including teams, folders, files, share links, and workspace members.

## Key Exports

- **WorkDriveTeam** — Interface for team/workspace metadata
- **WorkDriveFolderType** — Union type: teamfolder, privfolder, myspacefolder
- **WorkDriveFolder** — Interface for folders with parent reference and child counts
- **CreateFolderDTO** — DTO for folder creation (name + parent_id)
- **WorkDriveFileType** — Union type: spreadsheet, presentation, writer, pdf, image, video, other
- **WorkDriveFile** — Interface for file metadata including size and download URL
- **SharePermission** — Union type: view, comment, edit
- **WorkDriveShareLink** — Interface for share link details with validity and permission
- **CreateShareLinkDTO** — DTO for creating share links
- **MemberRole** — Union type: admin, organizer, editor, commenter, viewer
- **WorkDriveMember** — Interface for workspace members with role and status
- **WorkDriveListParams** — Extended list parameters with parent, type, and sort options

## Dependencies

- `ZohoListParams` from `../shared/shared.dto` — Base pagination parameters

## How It Works

Provides type definitions for the entire WorkDrive resource hierarchy — from teams and folders down to individual files, share links, and member permissions. Used across the controller, service, and client to ensure type-safe API interactions.
