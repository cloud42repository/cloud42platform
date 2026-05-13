# zoho-payroll.module.ts

NestJS module definition that bundles the Zoho Payroll controller and service together, making the service available for injection in other modules.

## Key Exports

- **ZohoPayrollModule** — Module that registers `ZohoPayrollController` and `ZohoPayrollService`, and exports the service.

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoPayrollController` — REST controller for payroll endpoints
- `ZohoPayrollService` — Business logic service for Zoho Payroll

## How It Works

Standard NestJS module pattern: declares the controller for HTTP routing, provides and exports the service so other modules can inject `ZohoPayrollService` without re-declaring it.
