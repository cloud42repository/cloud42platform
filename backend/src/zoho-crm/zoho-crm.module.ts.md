# zoho-crm.module.ts

NestJS module that bundles the Zoho CRM controller and service, making the service available for injection in other modules.

## Key Exports

- **ZohoCrmModule** — Module registering `ZohoCrmController` and `ZohoCrmService`, exporting the service.

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoCrmController` — REST controller for CRM endpoints
- `ZohoCrmService` — Business logic and client management

## How It Works

Declares the controller and service as module members, and exports `ZohoCrmService` so other modules can inject it directly.
