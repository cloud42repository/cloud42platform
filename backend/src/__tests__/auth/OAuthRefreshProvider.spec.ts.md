# OAuthRefreshProvider.spec.ts

Tests the `OAuthRefreshProvider` class which uses a stored OAuth refresh token to obtain and cache access tokens, with support for invalidation, expiration-based re-fetch, custom accounts URLs, and error handling.

## Test Suites

- **OAuthRefreshProvider** — Single suite covering the refresh token grant flow.

## Key Test Cases

- `fetches an access token on first call` — Verifies POST with grant_type=refresh_token.
- `returns cached token without re-fetching` — Confirms caching on subsequent calls.
- `re-fetches after invalidate()` — Validates that invalidation triggers a new token request.
- `re-fetches when token is expired` — Ensures expired tokens are automatically refreshed.
- `uses custom accountsUrl` — Tests regional token endpoint support (e.g., zoho.eu).
- `throws when the server returns an error` — Verifies descriptive error messages on auth failure.

## Test Setup

- `axios` is mocked globally via `jest.mock("axios")`.
- `beforeEach` clears mocks and configures a default successful token response.
- `makeTokenResponse()` helper creates configurable mock responses with access token and expiry.
