# zoho-sign.service.ts

Injectable NestJS service providing per-user Zoho Sign API access with automatic client caching and fallback to a default shared client.

## Key Exports

- **ZohoSignService** — Service managing `ZohoSignClient` instances per authenticated user (cached 10 minutes) with a default fallback client.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `AuthConfigService` — Per-user Zoho credential retrieval
- `ZohoOAuthService` — OAuth lifecycle management
- `StoredTokenAuthProvider` — Token provider using persisted OAuth tokens
- `getCurrentUserEmail` — Request context user extraction
- `ZohoSignClient` — Low-level Zoho Sign API client

## How It Works

1. Constructs a `defaultClient` from environment variables on initialization.
2. `getClient()` resolves the current user's email, looks up stored credentials, and creates/caches a per-user client with `StoredTokenAuthProvider`.
3. All public methods (listRequests, createRequest, sendRequest, etc.) resolve the client then delegate.
4. OAuth methods manage authorization flow and invalidate cached clients when credentials change.
