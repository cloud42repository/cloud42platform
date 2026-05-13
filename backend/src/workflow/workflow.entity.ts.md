# workflow.entity.ts

TypeORM entity representing a workflow stored in the `workflows` table. It stores the full step tree, inputs, outputs, scheduling info, and the last run log as JSONB columns.

## Key Exports

- **WorkflowStatus** — type alias: `'draft' | 'scheduled' | 'running' | 'completed' | 'failed'`
- **WorkflowEntity** — TypeORM entity class with columns for id, userEmail, name, description, steps, inputs, outputs, status, scheduledAt, lastRunLog, createdAt, updatedAt.

## Dependencies

- `typeorm` — `Entity`, `Column`, `PrimaryColumn`, `CreateDateColumn`, `UpdateDateColumn`, `ManyToOne`, `JoinColumn`
- `UserEntity` — referenced via a many-to-one relation on `userEmail`

## How It Works

The entity uses a client-generated `varchar(64)` primary key. The `userEmail` column is both a regular column and a foreign key to `users.email` with `CASCADE` delete. Complex data (steps, inputs, outputs, lastRunLog) is stored as `jsonb`. The `scheduledAt` column allows the execution service to query for due workflows. TypeORM auto-manages `createdAt` and `updatedAt` timestamps.
