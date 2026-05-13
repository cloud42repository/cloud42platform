# zoho-projects.module.ts

NestJS module definition that bundles the Zoho Projects controller and service together, making the service available for injection in other modules.

## Key Exports

- **ZohoProjectsModule** — Module that registers `ZohoProjectsController` and `ZohoProjectsService`, and exports the service.

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoProjectsController` — REST controller for project management endpoints
- `ZohoProjectsService` — Business logic service for Zoho Projects

## How It Works

Standard NestJS module pattern: declares the controller for HTTP routing, provides and exports the service so other modules can inject `ZohoProjectsService`.
