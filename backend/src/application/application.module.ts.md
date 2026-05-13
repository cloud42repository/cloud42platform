# application.module.ts

NestJS module that registers the application feature — entity, controller, and service.

## Key Exports

- **ApplicationModule** — NestJS module that exports `ApplicationService` for use by other modules.

## Dependencies

- `@nestjs/common` — `Module`
- `@nestjs/typeorm` — `TypeOrmModule.forFeature`
- `ApplicationEntity` — TypeORM entity
- `ApplicationController` — REST controller
- `ApplicationService` — CRUD service

## How It Works

Registers `ApplicationEntity` with TypeORM, declares the controller, and provides + exports `ApplicationService`. This is a standard feature module with no additional imports beyond the entity registration.
