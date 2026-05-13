# zoho-expense.service.ts

Injectable NestJS service that manages Zoho Expense API interactions with per-user client resolution. It creates and caches `ZohoExpenseClient` instances based on the authenticated user's stored OAuth credentials, falling back to a default client configured via environment variables.

## Key Exports

- `ZohoExpenseService` — Service class providing methods for categories, expenses, reports, advances, and OAuth lifecycle management

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `../auth-config/auth-config.service` — AuthConfigService for per-user credential lookup
- `../zoho-oauth/zoho-oauth.service` — ZohoOAuthService for OAuth token management
- `../auth/StoredTokenAuthProvider` — Auth provider using stored tokens
- `../auth-module/user-context` — `getCurrentUserEmail` for identifying the current user
- `./ZohoExpenseClient` — The underlying API client

## How It Works

On initialization, a default `ZohoExpenseClient` is created from environment variables. When a request comes in, `getClient()` checks the current user's email, looks up cached clients (with a 10-minute TTL), and if not found, queries `AuthConfigService` for per-user Zoho credentials to create a dedicated client. All service methods delegate to the resolved client. OAuth methods handle authorization URL generation, grant code exchange (storing tokens), and revocation (clearing cached clients).
