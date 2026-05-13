# notification.controller.ts

REST controller for managing user notifications. Provides endpoints for listing, creating, marking as read, and deleting notifications.

## Key Exports

- **NotificationController** — NestJS controller registered at `/notifications` with endpoints for full CRUD and read-status management.

## Dependencies

- `@nestjs/common` — decorators (`Controller`, `Get`, `Post`, `Patch`, `Delete`, `Param`, `Query`, `Body`)
- `NotificationService` — handles persistence logic
- `CreateNotificationDto`, `MarkReadDto` — request DTOs

## How It Works

The controller exposes seven REST endpoints:
1. `GET /notifications?userEmail=` — lists all notifications for a user (newest first)
2. `GET /notifications/unread?userEmail=` — lists only unread notifications
3. `POST /notifications` — creates a new notification
4. `PATCH /notifications/read` — marks specific notifications as read (by ID array)
5. `PATCH /notifications/read-all` — marks all notifications for a user as read
6. `DELETE /notifications/:id` — deletes a single notification
7. `DELETE /notifications?userEmail=` — deletes all notifications for a user
