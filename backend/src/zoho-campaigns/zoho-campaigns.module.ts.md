# zoho-campaigns.module.ts

NestJS module that bundles the Zoho Campaigns controller and service, exporting `ZohoCampaignsService` for use in other modules.

## Key Exports

- **ZohoCampaignsModule** — NestJS module registering the controller and service, exporting the service

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoCampaignsController` — HTTP route handler
- `ZohoCampaignsService` — Business logic layer

## How It Works

Declares `ZohoCampaignsController` as the controller, registers `ZohoCampaignsService` as a provider, and exports the service for dependency injection in other modules.
