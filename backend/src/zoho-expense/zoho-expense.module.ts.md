# zoho-expense.module.ts

NestJS module definition that wires together the Zoho Expense controller and service, and exports the service for use by other modules.

## Key Exports

- `ZohoExpenseModule` — Module registering `ZohoExpenseController` and `ZohoExpenseService`

## Dependencies

- `@nestjs/common` — Module decorator
- `./zoho-expense.controller` — ZohoExpenseController
- `./zoho-expense.service` — ZohoExpenseService

## How It Works

Declares the controller for HTTP route handling, registers the service as a provider, and exports the service so other modules can inject `ZohoExpenseService` directly.
