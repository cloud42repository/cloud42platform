# auth-config.module.ts

Global NestJS module that registers the auth-config feature and makes `AuthConfigService` available application-wide.

## Key Exports

- **AuthConfigModule** — `@Global()` NestJS module that exports `AuthConfigService`.

## Dependencies

- `@nestjs/common` — `Global`, `Module`
- `@nestjs/typeorm` — `TypeOrmModule.forFeature`
- `AuthConfigEntity` — TypeORM entity
- `AuthConfigController` — REST controller
- `AuthConfigService` — persistence service

## How It Works

Marked with `@Global()` so that `AuthConfigService` is available to all modules without explicit imports. Registers `AuthConfigEntity` with TypeORM, declares the controller, and provides + exports the service. This allows any module (e.g., Zoho OAuth, workflow execution) to read auth configs without importing this module.
