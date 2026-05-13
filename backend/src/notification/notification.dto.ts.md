# notification.dto.ts

Data Transfer Object interfaces for the notification REST API — defines request and response shapes.

## Key Exports

- **CreateNotificationDto** — request body for `POST /api/notifications` (userEmail, title, optional type/message/metadata)
- **NotificationResponseDto** — response shape returned by notification endpoints (id, userEmail, type, title, message, read, metadata, createdAt)
- **MarkReadDto** — request body for `PATCH /api/notifications/read` (array of notification IDs)

## Dependencies

None (pure type definitions).

## How It Works

Plain TypeScript interfaces with no runtime validation. `CreateNotificationDto` defaults the type to `'info'` at the service level if not provided. `NotificationResponseDto` serializes dates as ISO strings. `MarkReadDto` is a simple wrapper around an `ids` string array for batch read-marking.
