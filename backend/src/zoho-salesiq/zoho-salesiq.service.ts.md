# zoho-salesiq.service.ts

Injectable NestJS service that provides per-user Zoho SalesIQ API access with automatic client caching and fallback to a default shared client configured via environment variables.

## Key Exports

- **ZohoSalesIQService** — Service that manages `ZohoSalesIQClient` instances, one per authenticated user (cached for 10 minutes), plus a default client.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `AuthConfigService` — Retrieves per-user Zoho credentials from the database
- `ZohoOAuthService` — OAuth lifecycle (authorize URL, exchange, revoke)
- `StoredTokenAuthProvider` — Token provider using stored OAuth tokens
- `getCurrentUserEmail` — Extracts current user email from request context
- `ZohoSalesIQClient` — Low-level API client

## How It Works

1. On construction, a `defaultClient` is created using env vars (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`).
2. `getClient()` checks the current user's email; if a per-user config exists in `auth-config`, it creates a dedicated client with `StoredTokenAuthProvider`.
3. Clients are cached in a `Map` with a 10-minute TTL.
4. All public methods (listVisitors, getChat, etc.) call `getClient()` then delegate to the resolved client.
5. OAuth methods (`getAuthUrl`, `exchangeGrantCode`, `revokeAuth`) manage the OAuth flow and invalidate cached clients on credential changes.
