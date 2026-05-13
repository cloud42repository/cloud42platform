# notification.service.ts

Manages in-app notifications with backend persistence, polling, and reactive state. Provides methods for creating, reading, and clearing notifications with computed unread counts.

## Key Exports

- **`NotificationService`** — Injectable service with `notifications`, `unreadCount`, and `unread` signals, plus methods for `addNotification`, `markAsRead`, `markAllRead`, `remove`, `clearAll`, and `destroy`.

## Dependencies

- `@angular/core` — `Injectable`, `inject`, `signal`, `computed`
- `rxjs` — `firstValueFrom`
- `./api.service` — `ApiService`
- `./user-management.service` — `UserManagementService`
- `../config/notification.types` — `Notification`

## How It Works

1. **Polling** — On construction, starts a 30-second polling interval to fetch notifications from `/notifications` for the current user.
2. **`addNotification(title, message, type, metadata)`** — POSTs a new notification to the backend and prepends it to the local signal.
3. **`markAsRead(ids)` / `markAllRead()`** — PATCHes the backend and optimistically updates local state.
4. **Computed signals** — `unreadCount` and `unread` reactively derive from the notifications list.
5. **`destroy()`** — Cleans up the polling interval (for use on service teardown).
