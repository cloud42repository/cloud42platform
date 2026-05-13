# notification-panel.component.ts

This component provides a notification bell icon with a dropdown menu panel showing the user's notifications. It displays unread count as a badge, supports marking notifications as read, deleting individual notifications, and marking all as read.

## Key Exports

- **`NotificationPanelComponent`** — Standalone Angular component for the notification dropdown (selector: `app-notification-panel`)

## Template

The template contains:
- Bell icon button with unread count badge (in toolbar)
- Material menu dropdown with:
  - Header row (title + "Mark all read" button)
  - Empty state when no notifications
  - Notification items (up to 20) with type icon, title, message, relative timestamp, and delete button
  - "+N more" indicator when notifications exceed 20
- Notifications styled by type: info (blue), success (green), warning (orange), error (red)

## Dependencies

- `@angular/material` — Icon, Button, Badge, Menu, Tooltip, Divider
- `NotificationService` — Service providing reactive notification state (notifications signal, unreadCount signal, load, markAsRead, markAllRead, remove methods)
- `Notification` — Type definition from notification config

## How It Works

The component injects `NotificationService` and directly uses its signals for rendering. When the menu opens (`onMenuOpen`), it triggers a fresh load of notifications. Clicking an unread notification marks it as read. The delete button removes a notification by ID. The `formatTime` method provides human-readable relative timestamps ("Just now", "5m ago", "2h ago", or a date). The `getIcon` method maps notification types to Material icon names.
