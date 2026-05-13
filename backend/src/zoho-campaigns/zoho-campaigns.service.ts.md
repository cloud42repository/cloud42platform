# zoho-campaigns.service.ts

Injectable NestJS service managing Zoho Campaigns API interactions with per-user client caching. Provides methods for mailing lists, subscribers, topics, campaigns, and OAuth lifecycle.

## Key Exports

- **ZohoCampaignsService** — Service with mailing list, subscriber, campaign, and OAuth operations

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `AuthConfigService` — Per-user Zoho configuration retrieval
- `ZohoOAuthService` — OAuth URL building, token exchange, and revocation
- `StoredTokenAuthProvider` — Stored token provider for per-user auth
- `getCurrentUserEmail` — Extracts current user from request context
- `ZohoCampaignsClient` — Low-level API client

## How It Works

1. Creates a `defaultClient` on construction using environment credentials.
2. `getClient()` resolves per-user clients: checks stored config, creates a cached client (10-minute TTL), or falls back to the default.
3. Service methods (listMailingLists, addSubscriber, sendCampaign, etc.) delegate to the resolved `ZohoCampaignsClient`.
4. OAuth methods handle auth URL generation, code exchange, and token revocation while invalidating the client cache.
