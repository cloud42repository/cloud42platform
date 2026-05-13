# zoho-invoice.service.ts

Injectable NestJS service that manages Zoho Invoice API interactions with per-user client resolution. It creates and caches `ZohoInvoiceClient` instances based on the authenticated user's stored OAuth credentials, falling back to a default client configured via environment variables.

## Key Exports

- `ZohoInvoiceService` — Service class providing methods for customers, invoices, estimates, recurring invoices, payments, and OAuth lifecycle management

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `../auth-config/auth-config.service` — AuthConfigService for per-user credential lookup
- `../zoho-oauth/zoho-oauth.service` — ZohoOAuthService for OAuth token management
- `../auth/StoredTokenAuthProvider` — Auth provider using stored tokens
- `../auth-module/user-context` — `getCurrentUserEmail` for identifying the current user
- `../base/types` — `ZohoRegion` type
- `./ZohoInvoiceClient` — The underlying API client

## How It Works

On initialization, a default `ZohoInvoiceClient` is created from environment variables (including region and organization ID). When a request arrives, `getClient()` resolves the current user's email, checks a 10-minute TTL cache, and falls back to querying `AuthConfigService` for per-user credentials. All service methods delegate to the resolved client. OAuth methods handle authorization URL generation, grant code exchange, and revocation with cache invalidation.
