# zoho-payroll.service.ts

NestJS injectable service that manages Zoho Payroll API client instances, supporting both a default shared client and per-user clients based on stored OAuth credentials. It provides methods for all payroll operations and handles the OAuth lifecycle.

## Key Exports

- **ZohoPayrollService** — Service class that resolves the appropriate `ZohoPayrollClient` per request and delegates API calls.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `AuthConfigService` — Retrieves per-user Zoho OAuth configurations from storage
- `ZohoOAuthService` — Handles OAuth authorization URL building, token exchange, and revocation
- `StoredTokenAuthProvider` — Auth provider that retrieves tokens from the stored OAuth service
- `getCurrentUserEmail` — Extracts the current user's email from request context
- `ZohoPayrollClient` — Low-level HTTP client for the Zoho Payroll API

## How It Works

1. **Client resolution** — `getClient()` checks the current user email. For authenticated users, it looks up cached clients (10-minute TTL) or creates new ones from stored credentials via `AuthConfigService`. Falls back to the default client configured from environment variables.
2. **Service methods** — Each public method (e.g., `listEmployees`, `createPayRun`) awaits the resolved client and delegates the call.
3. **OAuth lifecycle** — `getAuthUrl` builds an authorization URL, `exchangeGrantCode` stores tokens and invalidates the user's cached client, `revokeAuth` clears tokens and cache.
