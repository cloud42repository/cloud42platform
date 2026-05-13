# zoho-inventory.controller.ts

NestJS REST controller that exposes Zoho Inventory API endpoints for managing items, warehouses, sales orders, and purchase orders. It also provides OAuth endpoints for authorization, token exchange, and revocation.

## Key Exports

- `ZohoInventoryController` — Controller class handling all `/zoho-inventory/*` routes, delegating to `ZohoInventoryService`

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Put, Delete, Param, Body, Query decorators
- `./zoho-inventory.service` — `ZohoInventoryService` for business logic

## How It Works

The controller defines RESTful endpoints grouped by resource: items (CRUD), warehouses (list/get), sales orders (CRUD), purchase orders (CRUD), and OAuth (authorize/exchange/revoke). Each method extracts route params, query params, or body data and delegates directly to the service, returning the result.
