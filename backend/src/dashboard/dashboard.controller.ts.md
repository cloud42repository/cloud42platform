# dashboard.controller.ts

REST controller for dashboard CRUD operations. Exposes endpoints to list, get, create, update, and delete dashboards scoped to a user.

## Key Exports

- **DashboardController** — NestJS controller handling all `/api/dashboards` routes

## Dependencies

- `@nestjs/common` — Controller decorators (Get, Post, Put, Delete, Param, Query, Body)
- `DashboardService` — Business logic for dashboard persistence
- `dashboard.dto` — Request DTO interfaces (CreateDashboardDto, UpdateDashboardDto)

## How It Works

Each method maps an HTTP operation to the corresponding service call. Listing dashboards requires a `userEmail` query parameter to scope results. Individual dashboard access uses the `:id` path parameter. All routes require authentication (no `@Public()` decorator).
