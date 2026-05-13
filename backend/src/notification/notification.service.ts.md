# notification.service.ts

Service responsible for CRUD operations on notifications, including read-status management and bulk operations.

## Key Exports

- **NotificationService** — injectable NestJS service providing `findAllByUser`, `findUnreadByUser`, `create`, `markAsRead`, `markAllRead`, `remove`, and `removeAllByUser` methods.

## Dependencies

- `@nestjs/common` — `Injectable`, `NotFoundException`
- `@nestjs/typeorm` — `InjectRepository`
- `typeorm` — `Repository`
- `NotificationEntity` — TypeORM entity
- `CreateNotificationDto`, `NotificationResponseDto` — DTO interfaces

## How It Works

Injects a TypeORM `Repository<NotificationEntity>` and provides:
- **findAllByUser** — queries by `userEmail`, ordered by `createdAt DESC`.
- **findUnreadByUser** — same but filtered to `read: false`.
- **create** — generates a unique ID (`ntf-{timestamp}-{random}`), sets defaults, and persists.
- **markAsRead(ids)** — bulk-updates the `read` flag to `true` for the given ID array.
- **markAllRead(userEmail)** — marks all unread notifications for a user as read.
- **remove(id)** — deletes a single notification, throws `NotFoundException` if not found.
- **removeAllByUser** — bulk-deletes all notifications for a user.
