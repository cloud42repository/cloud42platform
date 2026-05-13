# auth-config.entity.ts

TypeORM entity representing a per-user, per-module authentication configuration stored in the `auth_configs` table.

## Key Exports

- **AuthConfigEntity** — TypeORM entity with composite primary key (`userEmail`, `moduleId`) and a `config` JSONB column.

## Dependencies

- `typeorm` — `Entity`, `Column`, `PrimaryColumn`, `CreateDateColumn`, `UpdateDateColumn`

## How It Works

Uses a composite primary key of `userEmail` (varchar 320) and `moduleId` (varchar 100) to uniquely identify each user's config per API module. The `config` column stores the full authentication configuration as JSONB (client ID, secret, tokens, etc.). TypeORM auto-manages `createdAt` and `updatedAt` timestamps. Unlike other entities, this one does not use a `@ManyToOne` relation decorator for the user FK — it relies on the composite key for lookups.
