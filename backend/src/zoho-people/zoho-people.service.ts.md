# zoho-people.service.ts

NestJS injectable service that manages Zoho People API client instances, supporting both a default shared client and per-user clients based on stored OAuth credentials. It proxies all HR operations through the resolved client.

## Key Exports

- **ZohoPeopleService** — Service class that resolves the appropriate `ZohoPeopleClient` per request and delegates API calls.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `AuthConfigService` — Retrieves per-user Zoho OAuth configurations
- `ZohoOAuthService` — Handles OAuth flows (authorization, token exchange, revocation)
- `StoredTokenAuthProvider` — Auth provider using stored tokens
- `getCurrentUserEmail` — Extracts current user email from request context
- `ZohoPeopleClient` — Low-level HTTP client for Zoho People API

## How It Works

1. **Client resolution** — `getClient()` checks the current user. For authenticated users, it looks up cached clients (10-minute TTL) or builds new ones from stored credentials. Falls back to the default environment-configured client.
2. **Service methods** — Methods for employees, departments, leave types, leave requests, attendance, and custom forms all await client resolution then delegate.
3. **OAuth lifecycle** — `getAuthUrl` builds authorization URLs, `exchangeGrantCode` stores tokens and clears client cache, `revokeAuth` removes tokens and cache.
