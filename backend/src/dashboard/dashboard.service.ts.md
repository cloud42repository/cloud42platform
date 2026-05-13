# dashboard.service.ts

Business logic service for dashboard persistence. Handles CRUD operations with TypeORM and maps entities to response DTOs.

## Key Exports

- **DashboardService** — Injectable service with methods: `findAllByUser`, `findById`, `create`, `update`, `remove`, `removeAllByUser`

## Dependencies

- `@nestjs/common` — NotFoundException
- `typeorm` / `@nestjs/typeorm` — Repository for `DashboardEntity`
- `DashboardEntity` — TypeORM entity
- `dashboard.dto` — DTO interfaces

## How It Works

The service wraps a TypeORM repository. Key behaviors:

- **findAllByUser** — Queries by `userEmail`, orders by most recently updated.
- **create** — Accepts an optional `id`; if not provided, generates one with a `db-` prefix + timestamp + random suffix.
- **update** — Partial updates: only fields present in the DTO are applied.
- **remove** — Deletes by ID; throws `NotFoundException` if nothing was affected.
- **removeAllByUser** — Bulk-deletes all dashboards for a given user (used during user deletion).

All public methods return `DashboardResponseDto` (timestamps as ISO strings).
