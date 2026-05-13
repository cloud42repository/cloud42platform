# zoho-invoice.controller.ts

NestJS REST controller that exposes Zoho Invoice API endpoints for managing customers, invoices (including send), estimates, recurring invoices, and payments. It also provides OAuth endpoints for authorization, token exchange, and revocation.

## Key Exports

- `ZohoInvoiceController` — Controller class handling all `/zoho-invoice/*` routes, delegating to `ZohoInvoiceService`

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Put, Delete, Param, Body, Query decorators
- `./zoho-invoice.service` — `ZohoInvoiceService` for business logic

## How It Works

The controller defines RESTful endpoints grouped by resource: customers (CRUD), invoices (CRUD + send), estimates (CRUD), recurring invoices (create/list/get/delete), payments (list/create/delete), and OAuth (authorize/exchange/revoke). Each method extracts route params, query params, or body data and delegates directly to the service.
