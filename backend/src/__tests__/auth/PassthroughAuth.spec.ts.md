# PassthroughAuth.spec.ts

Tests the `PassthroughAuth` class which provides a simple static token auth provider that returns a pre-configured token, supports token updates, and treats invalidation as a no-op.

## Test Suites

- **PassthroughAuth** — Single suite covering construction, token retrieval, update, and invalidation.

## Key Test Cases

- `returns the token supplied at construction` — Verifies the initial token is returned from `getAccessToken()`.
- `returns an updated token after update()` — Confirms that calling `update()` changes the returned token.
- `invalidate() is a no-op and does not clear the token` — Ensures invalidation does not affect the stored token.

## Test Setup

- No mocks or external dependencies; tests directly instantiate `PassthroughAuth` with string tokens.
