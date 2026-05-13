# share.service.ts

Handles creation, resolution, and management of shareable links for dashboards, forms, workflows, and applications. Supports both public (token-based) and user-scoped sharing.

## Key Exports

- **`ShareItemType`** — Type alias: `'dashboard' | 'form' | 'workflow' | 'application'`.
- **`ShareLink`** — Interface representing a share link record (token, item info, owner, active status).
- **`SharedItemData`** — Interface for the resolved payload of a public share.
- **`ShareService`** — Injectable service with methods for creating, revoking, resolving, and listing shares.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `rxjs` — `firstValueFrom`
- `./api.service` — `ApiService`
- `./user-management.service` — `UserManagementService`

## How It Works

1. **`createShare(itemType, itemId, sharedWithEmails?)`** — POSTs to `/shares` to generate share links, optionally scoped to specific recipient emails.
2. **`getShareUrl(token)`** — Builds a client-side URL (`/shared/:token`) from the current origin.
3. **`revokeShare(token)`** — DELETEs the share link via the API.
4. **`resolvePublic(token)`** — GETs `/shares/public/:token` to fetch the shared item data without authentication.
5. **`listMyShares()` / `listSharedWithMe()`** — Retrieves shares owned by or shared with the current user.
