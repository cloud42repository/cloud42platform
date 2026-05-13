# zoho-analytics.service.ts

Injectable NestJS service that manages Zoho Analytics API interactions with support for multi-tenant per-user client resolution. It maintains a default client using environment credentials and creates per-user clients when authenticated users have stored Zoho configurations.

## Key Exports

- **ZohoAnalyticsService** — Service providing workspace, view, report, dashboard, import/export, and OAuth operations

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `AuthConfigService` — Retrieves per-user Zoho configurations from the database
- `ZohoOAuthService` — Handles OAuth authorization URL building, token exchange, and revocation
- `StoredTokenAuthProvider` — Provides stored tokens for per-user authentication
- `getCurrentUserEmail` — Extracts current user email from request context
- `ZohoAnalyticsClient` — Low-level API client for Zoho Analytics

## How It Works

1. On construction, creates a `defaultClient` using environment variables (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN).
2. `getClient()` resolves the appropriate client: if a user is authenticated and has stored Zoho credentials, a per-user client is created and cached for 10 minutes; otherwise the default client is used.
3. All service methods (listWorkspaces, getView, importData, etc.) call `getClient()` then delegate to the corresponding `ZohoAnalyticsClient` method.
4. OAuth lifecycle methods (getAuthUrl, exchangeGrantCode, revokeAuth) use `ZohoOAuthService` and invalidate the per-user client cache on token changes.
