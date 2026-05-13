# zoho-books.service.ts

Injectable NestJS service managing Zoho Books API interactions with multi-tenant per-user client support. Provides methods for contacts, invoices, bills, expenses, payments, items, recurring invoices, and OAuth lifecycle.

## Key Exports

- **ZohoBooksService** — Service with full Zoho Books CRUD operations and OAuth management

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `AuthConfigService` — Retrieves per-user Zoho configurations
- `ZohoOAuthService` — OAuth URL building, token exchange, and revocation
- `StoredTokenAuthProvider` — Provides stored tokens for per-user auth
- `getCurrentUserEmail` — Extracts current user from request context
- `ZohoBooksClient` — Low-level API client
- `ZohoRegion` type from `../base/types`

## How It Works

1. Creates a `defaultClient` on construction using environment variables including `ZOHO_ORGANIZATION_ID` and `ZOHO_REGION`.
2. `getClient()` resolves the correct client per user: checks for stored per-user credentials, creates and caches a client for 10 minutes, or falls back to the default.
3. All resource methods (listContacts, createInvoice, etc.) await `getClient()` and delegate to `ZohoBooksClient`.
4. OAuth methods use `ZohoOAuthService` and clear the per-user client cache on token changes.
