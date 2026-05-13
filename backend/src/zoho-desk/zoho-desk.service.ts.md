# zoho-desk.service.ts

NestJS injectable service that manages per-user Zoho Desk API clients with caching, falling back to a default client configured from environment variables.

## Key Exports

- **ZohoDeskService** — Service providing methods for tickets, comments, contacts, agents, departments, and OAuth lifecycle management.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `ConfigService` — Environment configuration access
- `AuthConfigService` — Per-user auth configuration lookup
- `ZohoOAuthService` — OAuth token exchange and revocation
- `StoredTokenAuthProvider` — Token provider for per-user clients
- `getCurrentUserEmail` — Request-scoped user context utility
- `ZohoDeskClient` — Underlying HTTP client for Zoho Desk API

## How It Works

On construction, a default `ZohoDeskClient` is created from environment variables. For each request, `getClient()` resolves the current user's email, checks a 10-minute TTL cache, and optionally creates a per-user client from stored credentials. All service methods (tickets, comments, contacts, agents, departments) delegate to the resolved client. OAuth methods handle token exchange/revocation and invalidate the user's cached client.
