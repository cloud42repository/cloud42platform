# zoho-inventory.module.ts

NestJS module definition that wires together the Zoho Inventory controller and service, and exports the service for use by other modules.

## Key Exports

- `ZohoInventoryModule` — Module registering `ZohoInventoryController` and `ZohoInventoryService`

## Dependencies

- `@nestjs/common` — Module decorator
- `./zoho-inventory.controller` — ZohoInventoryController
- `./zoho-inventory.service` — ZohoInventoryService

## How It Works

Declares the controller for HTTP route handling, registers the service as a provider, and exports the service so other modules can inject `ZohoInventoryService` directly.
