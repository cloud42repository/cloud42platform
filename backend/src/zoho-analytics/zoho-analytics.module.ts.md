# zoho-analytics.module.ts

NestJS module that bundles the Zoho Analytics controller and service together, making `ZohoAnalyticsService` available for injection in other modules.

## Key Exports

- **ZohoAnalyticsModule** — NestJS module registering the controller and service, exporting the service

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoAnalyticsController` — HTTP route handler
- `ZohoAnalyticsService` — Business logic layer

## How It Works

Declares `ZohoAnalyticsController` as the controller, registers `ZohoAnalyticsService` as a provider, and exports the service so other modules can import and use it.
