# CustomAuthProvider.spec.ts

Tests the `CustomAuthProvider` class which allows plugging in a custom token-fetching function, supporting caching based on `expiresAt`, single-use tokens, and invalidation with reason tracking.

## Test Suites

- **CustomAuthProvider** — Single suite covering custom fetch callbacks, caching logic, expiration, invalidation, and cache introspection.

## Key Test Cases

- `calls fetchToken with reason=initial on first call` — Confirms the initial fetch reason.
- `returns cached token on second call (expiresAt in future)` — Validates caching when token is still valid.
- `treats token without expiresAt as single-use` — Ensures tokens without expiry are re-fetched every time.
- `calls fetchToken with reason=expired when token has expired` — Verifies expired reason is passed.
- `calls fetchToken with reason=invalidated after invalidate()` — Confirms invalidation reason tracking.
- `calls onInvalidate hook when invalidate() is called` — Tests the optional invalidation callback.
- `getCachedToken() returns null before first call` — Validates initial cache state.
- `getCachedToken() returns the cached result after getAccessToken()` — Confirms cache population.

## Test Setup

- No external HTTP mocks needed; `fetchToken` is a jest mock function.
- Each test constructs a `CustomAuthProvider` with inline mock functions for `fetchToken` and optionally `onInvalidate`.
