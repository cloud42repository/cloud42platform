# IAuthProvider.ts

Defines the core authentication interface and shared token types used by all OAuth providers in the system. Every authentication strategy (refresh token, client credentials, PKCE, device flow, etc.) implements `IAuthProvider` to provide a uniform token-acquisition contract for `ZohoBaseClient`.

## Key Exports

- **`IAuthProvider`** — Interface requiring `getAccessToken(): Promise<string>` and `invalidate(): void`; the contract all auth providers must satisfy.
- **`ZohoRawTokenResponse`** — Interface representing the raw JSON response from Zoho's OAuth token endpoint (access_token, refresh_token, expires_in, etc.).
- **`CachedToken`** — Interface for internally cached token data with `accessToken`, optional `refreshToken`, and `expiresAt` (ms epoch).
- **`ZohoDeviceCodeResponse`** — Interface for the device authorization grant's intermediate response (device_code, user_code, verification_url).

## Dependencies

- None (pure TypeScript interfaces/types with no external imports).

## How It Works

This file is purely declarative. `ZohoBaseClient` calls `getAccessToken()` before every HTTP request to obtain a valid bearer token, and calls `invalidate()` when a 401 response is received so the next request forces a fresh token acquisition. The shared token shapes (`ZohoRawTokenResponse`, `CachedToken`) standardize how providers parse and cache Zoho's OAuth responses.
