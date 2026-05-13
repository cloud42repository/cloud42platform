# form.module.ts

NestJS feature module for the form domain. Registers the entity, controller, and service.

## Key Exports

- **FormModule** — Module exporting `FormService` for use by other modules (e.g., share)

## Dependencies

- `@nestjs/common` — Module decorator
- `@nestjs/typeorm` — TypeOrmModule for registering `FormEntity`
- `FormEntity` — TypeORM entity for the `forms` table
- `FormController` — REST endpoint handler
- `FormService` — Business logic

## How It Works

Registers `FormEntity` with TypeORM via `forFeature`, declares the controller and service provider, and exports `FormService` so other modules can query forms by ID (e.g., the share module resolves form data for public share links).
