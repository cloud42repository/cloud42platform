# mock-auth-provider.ts

A trivial authentication provider for mock/development mode that returns a static fake token. Prevents real OAuth handshakes from being attempted during local development and testing.

## Key Exports

- **`MockAuthProvider`** — Class implementing `IAuthProvider`; always returns `'mock-access-token-local'`.

## Dependencies

- `../auth/IAuthProvider` — `IAuthProvider` interface.

## How It Works

1. **`getAccessToken()`** — Returns `Promise.resolve('mock-access-token-local')` — no HTTP calls, no expiration logic.
2. **`invalidate()`** — No-op since there is nothing to invalidate.

Used automatically by `ZohoBaseClient` when `MOCK_MODE=true` is set in the environment, replacing any real auth provider.
