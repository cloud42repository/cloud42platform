# zoho-cliq.service.ts

Injectable NestJS service managing Zoho Cliq API interactions with per-user client caching. Provides methods for channels, messages, user groups, bots, and OAuth lifecycle.

## Key Exports

- **ZohoCliqService** — Service with channel, messaging, user group, bot, and OAuth operations

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `AuthConfigService` — Per-user Zoho configuration retrieval
- `ZohoOAuthService` — OAuth URL building, token exchange, and revocation
- `StoredTokenAuthProvider` — Stored token provider for per-user auth
- `getCurrentUserEmail` — Extracts current user from request context
- `ZohoCliqClient` — Low-level API client for Zoho Cliq

## How It Works

1. Creates a `defaultClient` on construction using environment credentials (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN).
2. `getClient()` resolves per-user clients by checking stored configurations, creating cached clients with a 10-minute TTL, or falling back to the default.
3. Service methods are organized by resource:
   - **Channels** — list, get, create, delete, add/remove members
   - **Messages** — list channel messages, send channel/direct messages, delete messages
   - **User Groups** — list, get, create
   - **Bots** — list bots, send bot messages
4. OAuth methods handle authorization URL generation, code exchange, and token revocation while invalidating the per-user client cache.
