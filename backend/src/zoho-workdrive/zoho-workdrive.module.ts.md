# zoho-workdrive.module.ts

NestJS module that bundles the Zoho WorkDrive controller and service, exporting the service for use by other modules.

## Key Exports

- **ZohoWorkdriveModule** — Module registering `ZohoWorkdriveController` and exporting `ZohoWorkdriveService`.

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoWorkdriveController` — REST controller
- `ZohoWorkdriveService` — Service provider

## How It Works

Declares the controller and service, and exports the service so other modules can inject `ZohoWorkdriveService` by importing this module.
