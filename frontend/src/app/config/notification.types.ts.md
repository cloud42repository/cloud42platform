# notification.types.ts

This file defines the TypeScript interface for the platform's notification system, describing the shape of notification objects stored and displayed to users.

## Key Exports

- `Notification` — Interface for a notification record (id, userEmail, type, title, message, read status, metadata, timestamp)

## Dependencies

- None (pure type definition)

## How It Works

The `Notification` interface represents a single notification with a discriminated `type` field (`'info' | 'success' | 'warning' | 'error'`) for severity-based styling, a `read` boolean for tracking whether the user has seen it, and a generic `metadata` record for attaching arbitrary contextual data. Notifications are scoped to a user by `userEmail` and ordered by `createdAt` timestamp.
