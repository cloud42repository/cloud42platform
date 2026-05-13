# zoho-creator.service.ts

NestJS injectable service that manages per-user Zoho Creator API clients with caching, falling back to a default client configured from environment variables.

## Key Exports

- **ZohoCreatorService** — Service providing methods for applications, forms, records, reports, workflows, and OAuth lifecycle management.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `ConfigService` — Environment configuration access
- `AuthConfigService` — Per-user auth configuration lookup
- `ZohoOAuthService` — OAuth token exchange and revocation
- `StoredTokenAuthProvider` — Token provider for per-user clients
- `getCurrentUserEmail` — Request-scoped user context utility
- `ZohoCreatorClient` — Underlying HTTP client for Zoho Creator API

## How It Works

On construction, a default `ZohoCreatorClient` is created using env vars including `ZOHO_CREATOR_OWNER_NAME`. For each request, `getClient()` resolves the current user, checks a 10-minute TTL cache, and optionally creates a per-user client from stored credentials. All service methods (applications, forms, records, reports, workflows) delegate to the resolved client. OAuth methods handle token exchange/revocation and invalidate the user's cached client.
