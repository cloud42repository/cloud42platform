# OAuthRefreshProvider.ts

Implements the simplest server-side OAuth2 flow: exchanging a pre-existing refresh token for short-lived access tokens. This is the default auth strategy used by `ZohoBaseClient` when a `refreshToken` is provided in the config.

## Key Exports

- **`OAuthRefreshProvider`** — Class implementing `IAuthProvider`; exchanges a long-lived refresh token for access tokens and caches them.
- **`RefreshTokenAuth`** — Alias export of `OAuthRefreshProvider` for discoverability.
- **`OAuthRefreshConfig` / `RefreshTokenAuthConfig`** — Configuration interface (`clientId`, `clientSecret`, `oauthRefreshToken`, `accountsUrl`).

## Dependencies

- `axios` — HTTP client for the token endpoint.
- `./IAuthProvider` — `IAuthProvider`, `ZohoRawTokenResponse`, `CachedToken`.

## How It Works

1. **`getAccessToken()`** — Returns the cached token if still valid (60s expiry buffer). Otherwise, POSTs `grant_type=refresh_token` to Zoho's token endpoint with the configured refresh token.
2. The resulting access token and expiration are cached.
3. **`invalidate()`** — Clears the cache entirely, forcing a fresh exchange on the next call.

This provider assumes the refresh token never expires (Zoho refresh tokens are long-lived unless manually revoked).
