# PKCEAuth.ts

Implements the OAuth2 Authorization Code + PKCE (Proof Key for Code Exchange) flow for Zoho APIs. Designed for public clients (SPAs, mobile apps, CLI tools) that cannot safely store a client secret.

## Key Exports

- **`PKCEAuth`** — Class implementing `IAuthProvider`; manages PKCE challenge generation, code exchange, and automatic token refresh without a client secret.
- **`PKCEAuthConfig`** — Configuration interface (`clientId`, `redirectUri`, `accountsUrl`).

## Dependencies

- `axios` — HTTP client for token endpoint calls.
- `crypto` (`createHash`, `randomBytes`) — Cryptographic PKCE verifier/challenge generation.
- `./IAuthProvider` — `IAuthProvider`, `ZohoRawTokenResponse`, `CachedToken`.
- `./AuthorizationCodeAuth` — `AuthCodeTokens` type.

## How It Works

1. **`startFlow(scope, state?)`** — Generates a cryptographically random code verifier (RFC 7636 §4.1), derives the S256 challenge, and returns the authorization URL plus the verifier to save.
2. **`exchangeCode(code, codeVerifier)`** — POSTs the authorization code and verifier to Zoho's token endpoint (no client_secret needed). Caches the resulting tokens.
3. **`getAccessToken()`** — Returns cached token if valid (60s buffer). If expired, refreshes using the stored refresh token (PKCE refresh also omits client_secret).
4. **`invalidate()`** — Zeroes `expiresAt` to force a refresh while preserving the refresh token.
5. **Static helpers** — `generateCodeVerifier()` and `generateCodeChallenge(verifier)` for standalone use.
