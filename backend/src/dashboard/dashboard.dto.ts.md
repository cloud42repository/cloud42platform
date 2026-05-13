# dashboard.dto.ts

Data Transfer Object interfaces for the dashboard module, defining request and response shapes.

## Key Exports

- **CreateDashboardDto** — Payload for creating a dashboard (optional id, userEmail, name, description, widgets, status)
- **UpdateDashboardDto** — Payload for updating a dashboard (all fields optional for partial updates)
- **DashboardResponseDto** — Standard API response shape with timestamps as ISO strings

## Dependencies

- `DashboardStatus` — Type import from `dashboard.entity`

## How It Works

Pure TypeScript interfaces. `CreateDashboardDto` allows the client to supply an `id` or let the server generate one. `UpdateDashboardDto` uses optional fields for partial updates. `DashboardResponseDto` normalises entity data for the frontend (dates as ISO strings, guaranteed non-null fields).
