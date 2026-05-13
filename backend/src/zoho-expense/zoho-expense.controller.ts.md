# zoho-expense.controller.ts

NestJS REST controller that exposes Zoho Expense API endpoints for managing expense categories, expense records, expense reports (including submission/approval workflows), and advance payments. It also provides OAuth endpoints for authorization, token exchange, and revocation.

## Key Exports

- `ZohoExpenseController` — Controller class handling all `/zoho-expense/*` routes, delegating to `ZohoExpenseService`

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Put, Delete, Param, Body, Query decorators
- `./zoho-expense.service` — `ZohoExpenseService` for business logic

## How It Works

The controller defines RESTful endpoints grouped by resource: categories (list/get), expenses (CRUD), reports (CRUD + submit/approve), advances (list/get), and OAuth (authorize/exchange/revoke). Each method extracts route params, query params, or body data and delegates directly to the corresponding service method, returning the result to the client.
