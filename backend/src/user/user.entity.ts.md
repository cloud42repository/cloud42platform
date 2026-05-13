# user.entity.ts

TypeORM entity representing a platform user. Maps to the `users` PostgreSQL table with email as the primary key, role/status management, password storage, module visibility, and refresh-token tracking.

## Key Exports

- **UserEntity** — TypeORM entity class for the `users` table
- **UserRole** — Type alias: `'admin' | 'manager' | 'user'`
- **UserStatus** — Type alias: `'pending' | 'active' | 'revoked'`

## Dependencies

- `typeorm` — Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn decorators

## How It Works

The entity uses `email` (varchar 320) as its primary key, matching the Google login identity. Columns include:

- `name`, `photoUrl` — Profile display info
- `role` — Access level (admin/manager/user)
- `status` — Account lifecycle (pending → active, or revoked)
- `passwordHash` — Nullable bcrypt hash for password-based login
- `passwordSetToken` / `passwordSetTokenExpiry` — One-time activation token (SHA-256)
- `moduleVisibility` — JSONB map of `{ moduleId: boolean }` for per-user feature toggles
- `hashedRefreshToken` — SHA-256 hash of the current JWT refresh token
- `createdAt` / `lastLoginAt` — Timestamps (auto-managed by TypeORM)
