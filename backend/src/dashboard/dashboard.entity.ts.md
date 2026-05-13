# dashboard.entity.ts

TypeORM entity representing a user's dashboard. Maps to the `dashboards` PostgreSQL table with a many-to-one relationship to the user entity.

## Key Exports

- **DashboardEntity** — TypeORM entity class for the `dashboards` table
- **DashboardStatus** — Type alias: `'draft' | 'published'`

## Dependencies

- `typeorm` — Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn
- `UserEntity` — Referenced for the foreign-key relationship

## How It Works

Each dashboard has a string primary key (`id`), an `ownerEmail` FK referencing `users.email` (cascade delete), a `name`, optional `description`, a `widgets` JSONB column storing the serialised widget tree, a `status` (draft/published), and auto-managed `createdAt`/`updatedAt` timestamps.
