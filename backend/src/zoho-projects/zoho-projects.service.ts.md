# zoho-projects.service.ts

NestJS injectable service that manages Zoho Projects API client instances, supporting both a default shared client and per-user clients. It proxies all project management operations through the resolved client.

## Key Exports

- **ZohoProjectsService** — Service class that resolves the appropriate `ZohoProjectsClient` per request and delegates API calls.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `AuthConfigService` — Retrieves per-user Zoho OAuth configurations
- `ZohoOAuthService` — Handles OAuth flows
- `StoredTokenAuthProvider` — Auth provider using stored tokens
- `getCurrentUserEmail` — Extracts current user email from request context
- `ZohoProjectsClient` — Low-level HTTP client for Zoho Projects API

## How It Works

1. **Client resolution** — `getClient()` checks the current user. For authenticated users, it resolves cached clients (10-minute TTL) or creates new ones from stored credentials including the `portalId`. Falls back to the default environment-configured client.
2. **Service methods** — Methods for projects, tasks, milestones, bugs, and time logs all await client resolution then delegate directly to the client.
3. **OAuth lifecycle** — `getAuthUrl` builds authorization URLs, `exchangeGrantCode` stores tokens and invalidates cached client, `revokeAuth` removes tokens and cache.
