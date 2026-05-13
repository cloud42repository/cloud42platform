# zoho-desk.module.ts

NestJS module that bundles the Zoho Desk controller and service, making the service available for injection in other modules.

## Key Exports

- **ZohoDeskModule** — Module registering `ZohoDeskController` and `ZohoDeskService`, exporting the service.

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoDeskController` — REST controller for Desk endpoints
- `ZohoDeskService` — Business logic and client management

## How It Works

Declares the controller and service as module members, and exports `ZohoDeskService` so other modules can inject it directly.
