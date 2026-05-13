# PassthroughAuth.ts

A minimal authentication provider that simply forwards a pre-supplied access token to every request. Used when an external system (secrets manager, parent service, CI environment) already handles OAuth and provides a ready-to-use credential.

## Key Exports

- **`PassthroughAuth`** — Class implementing `IAuthProvider`; returns a static token value and supports external rotation via `update()`.

## Dependencies

- `./IAuthProvider` — `IAuthProvider` interface.

## How It Works

1. **Constructor** — Takes an initial access token string.
2. **`getAccessToken()`** — Always returns the currently stored token (no refresh logic).
3. **`update(newValue)`** — Replaces the internal token, e.g. after credential rotation by the upstream system.
4. **`invalidate()`** — No-op by default since the upstream system owns the token lifecycle.

This is the simplest provider — no HTTP calls, no caching logic, no expiration checks.
