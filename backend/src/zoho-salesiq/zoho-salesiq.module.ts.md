# zoho-salesiq.module.ts

NestJS module that bundles the Zoho SalesIQ controller and service, making the service available for injection in other modules.

## Key Exports

- **ZohoSalesiqModule** — Module that registers `ZohoSalesIQController` and exports `ZohoSalesIQService`.

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoSalesIQService` — Service provider
- `ZohoSalesIQController` — REST controller

## How It Works

Declares the controller and service as module members, and exports the service so other modules can import `ZohoSalesiqModule` to use `ZohoSalesIQService` directly.
