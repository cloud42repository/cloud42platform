# share.service.ts

Business logic service for the sharing system. Manages creation, resolution, and revocation of share links for dashboards, forms, workflows, and applications.

## Key Exports

- **ShareService** — Injectable service with methods: `create`, `findByOwner`, `findSharedWithMe`, `revoke`, `resolvePublic`

## Dependencies

- `@nestjs/common` — NotFoundException
- `typeorm` / `@nestjs/typeorm` — Repositories for ShareEntity, DashboardEntity, FormEntity, WorkflowEntity, ApplicationEntity
- `node:crypto` — `randomBytes` for generating URL-safe share tokens
- `share.dto` — DTO interfaces

## How It Works

1. **create** — For each target email (or a single public link if none specified), checks for an existing active share; if found returns it, otherwise generates a unique base64url token and persists a new `ShareEntity`.
2. **findByOwner / findSharedWithMe** — Simple filtered queries on the shares table.
3. **revoke** — Sets `active = false` on the share record (soft-delete pattern).
4. **resolvePublic** — Looks up the share by token, then switches on `itemType` to fetch the actual item data from the corresponding repository. For `application` items, it additionally resolves each referenced page's data (forms, dashboards, workflows) so the shared viewer has all content inline.
