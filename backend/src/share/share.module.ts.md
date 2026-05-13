# share.module.ts

NestJS feature module for the sharing system. Registers the share entity and imports related entities needed for resolving shared items.

## Key Exports

- **ShareModule** — Module exporting `ShareService`

## Dependencies

- `@nestjs/common` — Module decorator
- `@nestjs/typeorm` — TypeOrmModule for registering entities
- `ShareEntity` — The share-link entity
- `DashboardEntity`, `FormEntity`, `WorkflowEntity`, `ApplicationEntity` — Imported so the service can resolve shared item data
- `ShareController` — REST endpoint handler
- `ShareService` — Business logic

## How It Works

Registers all five entities (ShareEntity + four item entities) with TypeORM via `forFeature`. This allows `ShareService` to directly query any shared item type when resolving a public share token, without depending on other feature modules' services.
