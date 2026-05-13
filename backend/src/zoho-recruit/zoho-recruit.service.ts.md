# zoho-recruit.service.ts

NestJS injectable service that manages Zoho Recruit API client instances, supporting both a default shared client and per-user clients based on stored OAuth credentials. It proxies all recruitment operations through the resolved client.

## Key Exports

- **ZohoRecruitService** — Service class that resolves the appropriate `ZohoRecruitClient` per request and delegates API calls.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `AuthConfigService` — Retrieves per-user Zoho OAuth configurations
- `ZohoOAuthService` — Handles OAuth flows
- `StoredTokenAuthProvider` — Auth provider using stored tokens
- `getCurrentUserEmail` — Extracts current user email from request context
- `ZohoRecruitClient` — Low-level HTTP client for the Zoho Recruit API

## How It Works

1. **Client resolution** — `getClient()` checks the current user. For authenticated users, it resolves cached clients (10-minute TTL) or creates new ones from stored credentials. Falls back to the default environment-configured client.
2. **Service methods** — Methods for job openings, candidates, interviews, and offers all await client resolution then delegate. Supports bulk create/update for job openings, candidates, and interviews.
3. **OAuth lifecycle** — `getAuthUrl` builds authorization URLs, `exchangeGrantCode` stores tokens and invalidates cached client, `revokeAuth` removes tokens and cache.
