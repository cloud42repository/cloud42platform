# zoho-books.controller.ts

REST controller that exposes Zoho Books API operations as HTTP endpoints under the `/zoho-books` route prefix. Provides full CRUD for contacts, invoices, bills, expenses, payments, items, and recurring invoices, plus OAuth management.

## Key Exports

- **ZohoBooksController** — NestJS controller handling all Zoho Books HTTP routes

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Put, Delete, Param, Body, Query decorators
- `ZohoBooksService` — Service layer for Zoho Books operations

## How It Works

The controller organizes endpoints by resource:
1. **Contacts** — list, get, create, update, delete
2. **Invoices** — list, get, create, update, delete, send, mark as sent, void
3. **Bills** — list, get, create, update, delete
4. **Expenses** — list, get, create, update, delete
5. **Payments** — list, get, create, delete
6. **Items** — list, get, create, update, delete
7. **Recurring Invoices** — list, get, create, update (single and bulk), delete, stop, resume, update template, list comments
8. **OAuth** — authorize, exchange grant code, revoke

Each handler delegates directly to the corresponding `ZohoBooksService` method.
