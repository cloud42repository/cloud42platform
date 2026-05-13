# share.controller.ts

REST controller for share-link management. Exposes endpoints to create share links, list owned/received shares, resolve public share tokens, and revoke shares.

## Key Exports

- **ShareController** — NestJS controller handling all `/api/shares` routes

## Dependencies

- `@nestjs/common` — Controller decorators (Get, Post, Delete, Param, Query, Body)
- `ShareService` — Business logic for share operations
- `share.dto` — Request DTO (CreateShareDto)
- `Public` decorator — Marks the public resolution endpoint as unauthenticated

## How It Works

- **POST /api/shares** — Creates one or more share links (authenticated).
- **GET /api/shares?ownerEmail=** — Lists all active shares owned by the specified user.
- **GET /api/shares/shared-with-me?email=** — Lists shares targeting a specific user.
- **GET /api/shares/public/:token** — Public (no auth): resolves a token into the shared item's data.
- **DELETE /api/shares/:token?ownerEmail=** — Revokes (deactivates) a share link.
