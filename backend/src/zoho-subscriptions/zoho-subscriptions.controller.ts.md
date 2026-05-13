# zoho-subscriptions.controller.ts

NestJS REST controller exposing Zoho Subscriptions API endpoints for managing plans, addons, coupons, customers, and subscriptions.

## Key Exports

- **ZohoSubscriptionsController** — Controller registered at route `zoho-subscriptions`, delegating to `ZohoSubscriptionsService`.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Put, Delete, Param, Body, Query decorators
- `ZohoSubscriptionsService` — Business logic layer for subscriptions operations

## How It Works

The controller exposes RESTful endpoints grouped by resource:
1. **Plans** — CRUD operations (list, get, create, update, delete).
2. **Addons** — List and get addons.
3. **Coupons** — List and get coupons.
4. **Customers** — CRUD operations (list, get, create, update, delete).
5. **Subscriptions** — List, get, create, update, cancel, and reactivate subscriptions.
6. **OAuth** — Authorize, exchange grant code, and revoke authentication.
