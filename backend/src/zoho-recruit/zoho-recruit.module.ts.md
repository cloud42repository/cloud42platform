# zoho-recruit.module.ts

NestJS module definition that bundles the Zoho Recruit controller and service together, making the service available for injection in other modules.

## Key Exports

- **ZohoRecruitModule** — Module that registers `ZohoRecruitController` and `ZohoRecruitService`, and exports the service.

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoRecruitController` — REST controller for recruitment endpoints
- `ZohoRecruitService` — Business logic service for Zoho Recruit

## How It Works

Standard NestJS module pattern: declares the controller for HTTP routing, provides and exports the service so other modules can inject `ZohoRecruitService`.
