# zoho-cliq.module.ts

NestJS module that bundles the Zoho Cliq controller and service, exporting `ZohoCliqService` for use in other modules.

## Key Exports

- **ZohoCliqModule** — NestJS module registering the controller and service, exporting the service

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoCliqController` — HTTP route handler
- `ZohoCliqService` — Business logic layer

## How It Works

Declares `ZohoCliqController` as the controller, registers `ZohoCliqService` as a provider, and exports the service for dependency injection in other modules.
