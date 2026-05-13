# PKCEAuth.spec.ts

Tests the `PKCEAuth` class which implements the OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange), covering code verifier/challenge generation, flow initiation, code exchange without client_secret, token caching, and refresh.

## Test Suites

- **static helpers** — Tests for `generateCodeVerifier()` and `generateCodeChallenge()` utility methods.
- **startFlow()** — Verifies the authorization URL includes PKCE parameters (code_challenge, code_challenge_method).
- **exchangeCode()** — Tests token exchange with code_verifier and ensures no client_secret is sent.
- **getAccessToken()** — Tests cached token retrieval, silent refresh without client_secret, and error when uninitialized.

## Key Test Cases

- `generateCodeVerifier() produces a URL-safe base64 string` — Validates format and minimum length.
- `generateCodeChallenge() is the S256 of the verifier` — Confirms SHA-256 hashing with base64url encoding.
- `returns a URL with code_challenge and code_challenge_method` — Ensures PKCE params in auth URL.
- `posts with grant_type=authorization_code and code_verifier` — Verifies exchange request body.
- `PKCE does NOT send client_secret` — Critical security check for public client flow.
- `silently refreshes when expired` — Confirms refresh also omits client_secret.
- `throws when no tokens are available and not yet exchanged` — Validates initialization guard.

## Test Setup

- `axios` is mocked globally via `jest.mock("axios")`.
- `crypto.createHash` is used to verify the S256 challenge computation.
- `beforeEach` clears all mocks.
- Configuration uses only `clientId` and `redirectUri` (no client_secret for PKCE).
