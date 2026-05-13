# zoho-crm.service.ts

NestJS injectable service that manages per-user Zoho CRM API clients with caching, falling back to a default client configured from environment variables.

## Key Exports

- **ZohoCrmService** — Service providing methods for leads, contacts, accounts, deals, tasks, notes, generic module records, and OAuth lifecycle management.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `ConfigService` — Environment configuration access
- `AuthConfigService` — Per-user auth configuration lookup
- `ZohoOAuthService` — OAuth token exchange and revocation
- `StoredTokenAuthProvider` — Token provider for per-user clients
- `getCurrentUserEmail` — Request-scoped user context utility
- `ZohoCRMClient` — Underlying HTTP client for Zoho CRM API
- `ZohoRegion` — Region type for API base URL derivation

## How It Works

On construction, a default `ZohoCRMClient` is created from env vars with region support. For each request, `getClient()` resolves the current user's email, checks a 10-minute TTL cache, and optionally creates a per-user client using stored credentials with `StoredTokenAuthProvider`. All service methods for leads, contacts, accounts, deals, tasks, notes, and generic modules delegate to the resolved client. OAuth methods handle token exchange/revocation and invalidate cached per-user clients.
