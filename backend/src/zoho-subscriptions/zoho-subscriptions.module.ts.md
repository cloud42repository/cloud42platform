# zoho-subscriptions.module.ts

NestJS module that bundles the Zoho Subscriptions controller and service, exporting the service for use by other modules.

## Key Exports

- **ZohoSubscriptionsModule** — Module registering `ZohoSubscriptionsController` and exporting `ZohoSubscriptionsService`.

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoSubscriptionsController` — REST controller
- `ZohoSubscriptionsService` — Service provider

## How It Works

Declares the controller and service, and exports the service so other modules can inject `ZohoSubscriptionsService` by importing this module.
