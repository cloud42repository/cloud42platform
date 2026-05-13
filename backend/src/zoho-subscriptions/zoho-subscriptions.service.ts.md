# zoho-subscriptions.service.ts

Injectable NestJS service providing per-user Zoho Subscriptions API access with client caching and a default shared client fallback.

## Key Exports

- **ZohoSubscriptionsService** — Service managing `ZohoSubscriptionsClient` instances per user (cached 10 minutes) with region and organization support.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `AuthConfigService` — Per-user Zoho credential retrieval
- `ZohoOAuthService` — OAuth lifecycle management
- `StoredTokenAuthProvider` — Token provider using persisted OAuth tokens
- `getCurrentUserEmail` — Request context user extraction
- `ZohoSubscriptionsClient` — Low-level API client
- `ZohoRegion` from `../base/types` — Region type for API URL resolution

## How It Works

1. Constructs a `defaultClient` from env vars including `ZOHO_REGION` and `ZOHO_ORGANIZATION_ID`.
2. `getClient()` resolves per-user credentials from auth-config and creates region-aware clients.
3. Exposes methods for plans, addons, coupons, customers, and subscriptions — all delegating to the resolved client.
4. OAuth methods handle token exchange/revocation and invalidate cached clients.
