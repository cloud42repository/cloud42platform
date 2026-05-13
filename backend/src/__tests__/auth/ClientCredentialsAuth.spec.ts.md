# ClientCredentialsAuth.spec.ts

Tests the `ClientCredentialsAuth` class which implements the OAuth 2.0 Client Credentials grant type for server-to-server Zoho API authentication, covering token fetching, caching, invalidation, expiration, error handling, and custom accounts URL support.

## Test Suites

- **ClientCredentialsAuth** — Single top-level suite covering all behaviors of the client credentials flow.

## Key Test Cases

- `requests a token with grant_type=client_credentials` — Verifies the correct grant type in the POST body.
- `includes client_id, client_secret, and scope in the request body` — Ensures all credentials are sent.
- `caches the token and does not refetch on second call` — Confirms token caching works.
- `re-fetches after invalidate()` — Validates that invalidation forces a new token request.
- `re-fetches when token expires` — Confirms expired tokens trigger a refresh.
- `throws on server-side error` — Tests error wrapping with descriptive messages.
- `uses custom accountsUrl` — Verifies regional/custom token endpoint support.

## Test Setup

- `axios` is mocked globally via `jest.mock("axios")`.
- `beforeEach` clears mocks and sets up a default mock for `axios.post`.
- A `mockToken()` helper generates token response objects with configurable expiration.
