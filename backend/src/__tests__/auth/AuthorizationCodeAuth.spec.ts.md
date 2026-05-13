# AuthorizationCodeAuth.spec.ts

Tests the `AuthorizationCodeAuth` class which implements the OAuth 2.0 Authorization Code flow for Zoho APIs, including URL generation, code exchange, token caching, silent refresh, and invalidation.

## Test Suites

- **getAuthorizationUrl()** — Verifies the authorization URL contains correct OAuth parameters (response_type, client_id, redirect_uri, scope, state).
- **exchangeCode()** — Tests exchanging an authorization code for access/refresh tokens, and error handling when refresh_token is missing.
- **getAccessToken()** — Tests token retrieval from cache, silent refresh on expiration, error when no tokens exist, and behavior after invalidation.

## Key Test Cases

- `returns a URL containing required OAuth params` — Ensures the generated URL includes all mandatory OAuth query parameters.
- `exchanges code for tokens and caches them` — Verifies POST to token endpoint with grant_type=authorization_code.
- `throws when no refresh_token is returned` — Ensures error if server omits refresh_token in response.
- `returns initial access token without network call when still valid` — Confirms cached tokens are reused.
- `refreshes silently when access token expires` — Verifies automatic token refresh using the refresh token.
- `invalidate() clears the access token but keeps the refresh token` — Confirms partial invalidation behavior.
- `getCachedTokens() returns null before any token is obtained` — Validates initial state.

## Test Setup

- `axios` is mocked globally via `jest.mock("axios")`.
- `beforeEach` clears all mocks.
- A helper `mockTokenRes()` generates mock token endpoint responses.
- Configuration uses test client credentials and a redirect URI.
