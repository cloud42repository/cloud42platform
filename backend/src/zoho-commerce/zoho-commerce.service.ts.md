# zoho-commerce.service.ts

NestJS injectable service that manages per-user Zoho Commerce API clients with caching, falling back to a default client configured from environment variables.

## Key Exports

- **ZohoCommerceService** — Service providing methods for products, categories, customers, orders, and OAuth lifecycle management.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `ConfigService` — Environment configuration access
- `AuthConfigService` — Per-user auth configuration lookup
- `ZohoOAuthService` — OAuth token exchange and revocation
- `StoredTokenAuthProvider` — Token provider for per-user clients
- `getCurrentUserEmail` — Request-scoped user context utility
- `ZohoCommerceClient` — Underlying HTTP client for Zoho Commerce API

## How It Works

On construction, a default `ZohoCommerceClient` is created from environment variables. For each request, `getClient()` resolves the current user's email, checks a 10-minute TTL cache for a per-user client, and if not found, queries `AuthConfigService` for user-specific Zoho credentials. If credentials exist, a per-user client with `StoredTokenAuthProvider` is created and cached. All service methods delegate to the resolved client. OAuth methods handle token exchange/revocation and invalidate the user's cached client.
