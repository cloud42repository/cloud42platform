# form.entity.ts

TypeORM entity representing a user's form definition. Maps to the `forms` PostgreSQL table with a many-to-one relationship to the user entity.

## Key Exports

- **FormEntity** — TypeORM entity class for the `forms` table
- **FormStatus** — Type alias: `'draft' | 'published'`

## Dependencies

- `typeorm` — Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn
- `UserEntity` — Referenced for the foreign-key relationship

## How It Works

Each form has a string primary key (`id`), an `ownerEmail` FK referencing `users.email` (cascade delete), a `name`, optional `description`, a `fields` JSONB column storing form field definitions, a `submitActions` JSONB column storing post-submission action configurations, a `status` (draft/published), and auto-managed `createdAt`/`updatedAt` timestamps.
