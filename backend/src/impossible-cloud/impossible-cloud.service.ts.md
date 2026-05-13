# impossible-cloud.service.ts

Injectable NestJS service that manages per-user Impossible Cloud API clients. Resolves credentials from the auth-config store, caches clients for 10 minutes, and proxies all API calls to the appropriate client instance.

## Key Exports

- **`ImpossibleCloudService`** — Service wrapping ImpossibleCloudClient with per-user credential resolution.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService (reads IC_API_KEY, IC_BASE_URL)
- `../auth-config/auth-config.service` — AuthConfigService
- `../auth-module/user-context` — getCurrentUserEmail
- `./ImpossibleCloudClient` — ImpossibleCloudClient

## How It Works

1. Creates a `defaultClient` from environment variables on initialization.
2. `getClient()` checks async-local-storage for the current user's email, looks up per-user credentials (key `__impossible-cloud__`), and caches clients for 10 minutes.
3. Exposes async methods for every API operation (regions, contracts, partners, members, storage accounts, usage) that resolve the client and delegate the call.
