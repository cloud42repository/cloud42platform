# zoho-books.module.ts

NestJS module that bundles the Zoho Books controller and service, exporting `ZohoBooksService` for use in other modules.

## Key Exports

- **ZohoBooksModule** — NestJS module registering the controller and service, exporting the service

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoBooksController` — HTTP route handler
- `ZohoBooksService` — Business logic layer

## How It Works

Declares `ZohoBooksController` as the controller, registers `ZohoBooksService` as a provider, and exports the service for dependency injection in other modules.
