# notification.entity.ts

TypeORM entity representing a notification stored in the `notifications` table. Notifications inform users about system events, workflow results, or other activities.

## Key Exports

- **NotificationType** — type alias: `'info' | 'success' | 'warning' | 'error'`
- **NotificationEntity** — TypeORM entity class with columns for id, userEmail, type, title, message, read, metadata, and createdAt.

## Dependencies

- `typeorm` — `Entity`, `Column`, `PrimaryColumn`, `CreateDateColumn`, `ManyToOne`, `JoinColumn`
- `UserEntity` — referenced via a many-to-one relation on `userEmail`

## How It Works

Uses a service-generated `varchar(64)` primary key. The `userEmail` column is a foreign key to `users.email` with `CASCADE` delete. The `type` column categorizes the notification severity. The `read` boolean flag enables read/unread filtering. The `metadata` JSONB column stores arbitrary context (e.g., source workflow ID, link URL). Only a `createdAt` timestamp is tracked (no `updatedAt` since notifications are immutable aside from the `read` flag).
