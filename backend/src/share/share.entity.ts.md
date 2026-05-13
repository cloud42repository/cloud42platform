# share.entity.ts

TypeORM entity representing a share link. Maps to the `shares` PostgreSQL table, linking an owner to a shared item via a unique token.

## Key Exports

- **ShareEntity** — TypeORM entity class for the `shares` table
- **ShareItemType** — Type alias: `'dashboard' | 'form' | 'workflow' | 'application'`

## Dependencies

- `typeorm` — Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn
- `UserEntity` — Referenced for the owner foreign-key relationship

## How It Works

Each share record has:

- `token` (PK) — A URL-safe random string (24 bytes, base64url encoded) serving as the share link identifier.
- `itemType` — What kind of item is shared (dashboard, form, workflow, or application).
- `itemId` — The ID of the shared item in its respective table.
- `ownerEmail` — FK to `users.email` with cascade delete.
- `active` — Boolean flag for soft-revocation (false = revoked).
- `sharedWithEmail` — Optional; if set, restricts access to a specific user.
- `createdAt` — Auto-managed timestamp.
