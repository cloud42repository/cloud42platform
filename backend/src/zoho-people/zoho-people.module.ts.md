# zoho-people.module.ts

NestJS module definition that bundles the Zoho People controller and service together, making the service available for injection in other modules.

## Key Exports

- **ZohoPeopleModule** — Module that registers `ZohoPeopleController` and `ZohoPeopleService`, and exports the service.

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoPeopleController` — REST controller for people/HR endpoints
- `ZohoPeopleService` — Business logic service for Zoho People

## How It Works

Standard NestJS module pattern: declares the controller for HTTP routing, provides and exports the service so other modules can inject `ZohoPeopleService`.
