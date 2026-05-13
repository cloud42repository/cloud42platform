# zoho-oauth.service.ts

Manages the full Zoho OAuth 2.0 token lifecycle including building authorization URLs, exchanging grant tokens for access/refresh tokens, refreshing expired tokens, revoking tokens, and persisting credentials in the per-user auth-config store.

## Key Exports

- **ZohoOAuthService** — Injectable NestJS service that wraps all Zoho OAuth operations (authorize, generate, refresh, revoke) with automatic fallback to environment variables for client credentials.

### Public Methods

- `buildAuthorizationUrl(opts)` — Constructs the Zoho consent/authorization URL with query parameters.
- `generateTokens(dto)` — Exchanges a one-time authorization code for access + refresh tokens via POST to Zoho.
- `refreshAccessToken(dto)` — Uses a refresh token to obtain a new access token.
- `revokeRefreshToken(dto)` — Revokes a refresh token so it can no longer be used.
- `exchangeAndStore(code, opts)` — Exchanges a grant code and persists the resulting tokens in the auth-config store for the current user.
- `getValidAccessToken(userEmail?)` — Returns a valid access token, automatically refreshing and persisting if expired.
- `revokeAndClear(opts)` — Revokes the stored refresh token and removes the auth-config entry.

## Dependencies

- `@nestjs/common` — Injectable, Logger, BadRequestException
- `@nestjs/config` — ConfigService (env variable resolution)
- `axios` — HTTP client for Zoho token endpoint calls
- `AuthConfigService` — Persistence layer for per-user OAuth credentials
- `getCurrentUserEmail` — Extracts current request user from async context
- `./zoho-oauth.dto` — DTO interfaces (GenerateTokenDto, RefreshTokenDto, RevokeTokenDto, ZohoTokenResponse)

## How It Works

The service resolves client credentials (clientId, clientSecret, redirectUri, accountsUrl) by checking explicit parameters first, then falling back to environment variables. Token operations POST URL-encoded bodies to Zoho's `/oauth/v2/token` endpoint. The `exchangeAndStore` convenience method combines token exchange with persistence into the `AuthConfigService` under module ID `__zoho__`. The `getValidAccessToken` method checks token expiry (with a 60-second buffer) and transparently refreshes if needed, persisting updated tokens back to the database.
