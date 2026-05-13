# zoho-invoice.module.ts

NestJS module definition that wires together the Zoho Invoice controller and service, and exports the service for use by other modules.

## Key Exports

- `ZohoInvoiceModule` — Module registering `ZohoInvoiceController` and `ZohoInvoiceService`

## Dependencies

- `@nestjs/common` — Module decorator
- `./zoho-invoice.controller` — ZohoInvoiceController
- `./zoho-invoice.service` — ZohoInvoiceService

## How It Works

Declares the controller for HTTP route handling, registers the service as a provider, and exports the service so other modules can inject `ZohoInvoiceService` directly.
