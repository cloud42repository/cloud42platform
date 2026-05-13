# zoho-creator.module.ts

NestJS module that bundles the Zoho Creator controller and service, making the service available for injection in other modules.

## Key Exports

- **ZohoCreatorModule** — Module registering `ZohoCreatorController` and `ZohoCreatorService`, exporting the service.

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoCreatorService` — Business logic and client management
- `ZohoCreatorController` — REST controller for Creator endpoints

## How It Works

Declares the controller and service as module members, and exports `ZohoCreatorService` so other modules can inject it without importing the full module.
