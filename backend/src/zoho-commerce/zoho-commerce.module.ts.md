# zoho-commerce.module.ts

NestJS module that bundles the Zoho Commerce controller and service, making the service available for injection in other modules.

## Key Exports

- **ZohoCommerceModule** — Module registering `ZohoCommerceController` and `ZohoCommerceService`, exporting the service.

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoCommerceController` — REST controller for Commerce endpoints
- `ZohoCommerceService` — Business logic and client management

## How It Works

Declares the controller and service as module members, and exports `ZohoCommerceService` so other modules can inject it directly without re-importing the full module internals.
