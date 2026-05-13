# application.entity.ts

TypeORM entity representing an application stored in the `applications` table. Applications are multi-page UI compositions built by users in the app builder.

## Key Exports

- **ApplicationStatus** — type alias: `'draft' | 'published'`
- **ApplicationEntity** — TypeORM entity class with columns for id, userEmail, name, description, pages (JSONB), navigation (JSONB), status, createdAt, updatedAt.

## Dependencies

- `typeorm` — `Entity`, `Column`, `PrimaryColumn`, `CreateDateColumn`, `UpdateDateColumn`, `ManyToOne`, `JoinColumn`
- `UserEntity` — referenced via a many-to-one relation on `userEmail`

## How It Works

Uses a client-generated `varchar(64)` primary key. The `userEmail` column serves as both a regular column and a foreign key to `users.email` with `CASCADE` delete. The `pages` array and `navigation` object are stored as `jsonb` columns, allowing flexible schema-free page/widget definitions. TypeORM auto-manages `createdAt` and `updatedAt` timestamps.
