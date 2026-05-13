# softvalue.service.ts

Injectable NestJS service that manages per-user Softvalue API clients. Resolves credentials from the auth-config store, caches client instances for 10 minutes, and exposes generic HTTP methods and token management.

## Key Exports

- **`SoftvalueService`** — Service wrapping SoftvalueClient with per-user credential resolution and HTTP proxy methods.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService (reads SOFTVALUE_TOKEN, SOFTVALUE_BASE_URL)
- `../auth-config/auth-config.service` — AuthConfigService
- `../auth-module/user-context` — getCurrentUserEmail
- `./SoftvalueClient` — SoftvalueClient

## How It Works

1. Creates a `defaultClient` from environment-level token on initialization.
2. `getClient()` resolves the current user's email, looks up per-user config (key `__softvalue__`), and caches clients for 10 minutes.
3. Exposes generic `get`, `post`, `put`, `patch`, `delete` methods that delegate to the resolved client.
4. `updateToken()` and `getToken()` allow runtime token rotation on the current user's client.
