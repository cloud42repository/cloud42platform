# AuthorizationCodeAuth.ts

Implements the OAuth2 Authorization Code Grant flow for Zoho APIs. This is the standard interactive flow where a user logs in via browser, approves access, and the application exchanges the resulting authorization code for access and refresh tokens.

## Key Exports

- **`AuthorizationCodeAuth`** — Class implementing `IAuthProvider`; manages the full authorization code lifecycle including URL generation, code exchange, and automatic refresh.
- **`AuthCodeConfig`** — Configuration interface (`clientId`, `clientSecret`, `redirectUri`, `accountsUrl`).
- **`AuthCodeTokens`** — Token result interface (`accessToken`, `refreshToken`, `expiresAt`).

## Dependencies

- `axios` — HTTP client for token endpoint calls.
- `./IAuthProvider` — `IAuthProvider`, `ZohoRawTokenResponse`, `CachedToken`.

## How It Works

1. **`getAuthorizationUrl(scope, state?)`** — Builds the Zoho OAuth consent URL with `response_type=code` and `access_type=offline`.
2. **`exchangeCode(code)`** — POSTs the one-time authorization code to Zoho's token endpoint, receives access + refresh tokens, and caches them.
3. **`getAccessToken()`** — Returns the cached access token if still valid (with a 60s buffer). If expired, silently refreshes using the stored refresh token.
4. **`invalidate()`** — Zeroes the `expiresAt` timestamp while preserving the refresh token, forcing a refresh on the next call.

The class supports pre-loading tokens via the `initialTokens` constructor parameter for resuming sessions without re-authentication.
