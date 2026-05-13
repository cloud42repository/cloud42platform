# dashboard.module.ts

NestJS feature module for the dashboard domain. Registers the entity, controller, and service.

## Key Exports

- **DashboardModule** — Module exporting `DashboardService` for use by other modules (e.g., share)

## Dependencies

- `@nestjs/common` — Module decorator
- `@nestjs/typeorm` — TypeOrmModule for registering `DashboardEntity`
- `DashboardEntity` — TypeORM entity for the `dashboards` table
- `DashboardController` — REST endpoint handler
- `DashboardService` — Business logic

## How It Works

Registers `DashboardEntity` with TypeORM via `forFeature`, declares the controller and service provider, and exports `DashboardService` so other modules can query dashboards (e.g., the share module resolves dashboard data by ID).
