# user.module.ts

NestJS module that wires together the user feature: entity registration, controller, service, and shared dependencies.

## Key Exports

- **UserModule** — Feature module exporting `UserService` and `EmailService` for use by other modules

## Dependencies

- `@nestjs/common` — Module decorator
- `@nestjs/typeorm` — TypeOrmModule for registering `UserEntity`
- `UserEntity` — TypeORM entity for the `users` table
- `UserController` — REST endpoint handler
- `UserService` — Business logic
- `EmailService` — Shared email-sending service
- `MicrosoftGraphModule` — Imported for Microsoft Graph integration

## How It Works

Registers `UserEntity` with TypeORM via `forFeature`, declares the controller and providers, and exports `UserService` and `EmailService` so other modules (e.g., auth) can inject them without re-declaring.
