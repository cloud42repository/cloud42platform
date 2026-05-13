# zoho-salesiq.controller.ts

NestJS REST controller that exposes Zoho SalesIQ API endpoints for managing visitors, chats, operators, departments, bots, and feedback forms. All endpoints are scoped by a `screenName` path parameter representing the SalesIQ portal screen.

## Key Exports

- **ZohoSalesIQController** — Controller class registered at route `zoho-salesiq`, delegating all operations to `ZohoSalesIQService`.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Param, Body, Query decorators
- `ZohoSalesIQService` — Business logic layer for SalesIQ operations

## How It Works

The controller defines RESTful endpoints grouped by resource:
1. **Visitors** — list, get, and search visitors under a screen name.
2. **Chats** — list, get, list messages, send messages, and set ratings for chats.
3. **Operators** — list, get, and set availability for operators.
4. **Departments** — list and get departments.
5. **Bots** — list bots and send bot messages.
6. **Feedback Forms** — list feedback forms.
7. **OAuth** — authorize, exchange grant code, and revoke authentication.

Each method delegates directly to the corresponding service method.
