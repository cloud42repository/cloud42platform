# CustomAuthProvider.ts

Provides an escape-hatch authentication provider that delegates token acquisition to a user-supplied async function. Useful for scenarios not covered by built-in providers: internal SSO, API gateways, custom JWT signing, or testing with deterministic tokens.

## Key Exports

- **`CustomAuthProvider`** — Class implementing `IAuthProvider`; calls a configurable `fetchToken` function whenever a new token is needed.
- **`CustomAuthConfig`** — Configuration interface with `fetchToken(reason)` and optional `onInvalidate()` callback.
- **`CustomTokenResult`** — Return type from the fetcher (`accessToken`, optional `expiresAt`).
- **`CustomTokenFetcher`** — Type alias for `() => Promise<CustomTokenResult>`.

## Dependencies

- `./IAuthProvider` — `IAuthProvider` interface.

## How It Works

1. **`getAccessToken()`** — Returns the cached token if valid (with 60s buffer). If the token has no `expiresAt`, it is treated as single-use and re-fetched every time.
2. When a new token is needed, the configured `fetchToken` function is called with a `reason` parameter (`"initial"`, `"expired"`, or `"invalidated"`).
3. **`invalidate()`** — Fires the optional `onInvalidate` callback, clears the cache, and sets the reason to `"invalidated"` for the next fetch.
4. **`getCachedToken()`** — Debug helper exposing the current cache state.
