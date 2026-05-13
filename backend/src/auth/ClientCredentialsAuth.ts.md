# ClientCredentialsAuth.ts

Implements the OAuth2 Client Credentials Grant flow for server-to-server communication with Zoho APIs. No user context is involved — the application authenticates directly using its client ID and secret.

## Key Exports

- **`ClientCredentialsAuth`** — Class implementing `IAuthProvider`; fetches and caches access tokens using client credentials.
- **`ClientCredentialsConfig`** — Configuration interface (`clientId`, `clientSecret`, `scope`, `accountsUrl`).

## Dependencies

- `axios` — HTTP client for token endpoint calls.
- `./IAuthProvider` — `IAuthProvider`, `ZohoRawTokenResponse`, `CachedToken`.

## How It Works

1. **`getAccessToken()`** — Checks the local cache. If valid (within a 60s expiry buffer), returns the cached token. Otherwise, POSTs `grant_type=client_credentials` with the configured scope to Zoho's token endpoint.
2. The response is cached with a computed `expiresAt` timestamp.
3. **`invalidate()`** — Clears the entire cache, forcing a fresh token fetch on the next call.

No refresh token is involved since client credentials tokens are simply re-requested when expired.
