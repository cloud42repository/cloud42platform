# shared-list.component.ts

This component displays a user's shared items (share links) organized in two tabs: "My Shares" (items the user has shared) and "Shared With Me" (items others have shared with the user). It provides actions to copy share links, open shared views, and revoke shares.

## Key Exports

- **`SharedListComponent`** — Standalone Angular component for listing share links (selector: `app-shared-list`)

## Template

The template contains:
- Page header with share icon and title
- Tab group with two tabs:
  - **My Shares** — Grid of share cards showing item type, item ID, recipient (or "public"), creation date, with actions: copy link, open in new tab, revoke/delete
  - **Shared With Me** — Grid of share cards showing item type, item ID, owner email, creation date, with actions: copy link, open
- Loading spinner state and empty states for each tab
- Copied-to-clipboard toast notification

## Dependencies

- `@angular/material` — Button, Icon, Tooltip, Tabs, ProgressSpinner
- `@angular/router` — RouterLink (for navigation to shared viewer)
- `ShareService` / `ShareLink` — Service and type for fetching/managing share links
- `TranslatePipe` — i18n translation
- `CommonModule` — Date pipe, ngFor directives

## How It Works

On init, the component loads the user's shares via `ShareService`, splitting them into "my shares" and "shared with me" signals. Each share card displays metadata (type icon, item type chip, recipient/owner, date). The copy button copies the full share URL to clipboard and shows a toast. The revoke button calls `ShareService` to delete the share link. The open button navigates to `/shared/:token` which renders the `SharedViewerComponent`.
