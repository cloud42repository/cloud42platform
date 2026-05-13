# DeviceFlowAuth.ts

Implements the OAuth2 Device Authorization Grant (RFC 8628) for Zoho APIs. Designed for devices and CLI tools that cannot open a browser — the user visits a URL on a separate device and enters a code to authorize.

## Key Exports

- **`DeviceFlowAuth`** — Class implementing `IAuthProvider`; manages device code requests, user-approval polling, and automatic token refresh.
- **`DeviceFlowConfig`** — Configuration interface (`clientId`, `clientSecret`, `accountsUrl`).
- **`DeviceFlowPromptFn`** — Callback type `(info: ZohoDeviceCodeResponse) => Promise<void>` for displaying the user code.

## Dependencies

- `axios` — HTTP client for Zoho's device code and token endpoints.
- `./IAuthProvider` — `IAuthProvider`, `ZohoRawTokenResponse`, `ZohoDeviceCodeResponse`, `CachedToken`.
- `./AuthorizationCodeAuth` — `AuthCodeTokens` type for the return value.

## How It Works

1. **`startFlow(scope, onPrompt)`** — Requests a device code from Zoho, invokes `onPrompt` with the user code and verification URL, then polls the token endpoint at the specified interval until the user approves or the code expires.
2. Once approved, the access and refresh tokens are cached.
3. **`getAccessToken()`** — Returns the cached token if valid (60s buffer). If expired, silently refreshes using the stored refresh token.
4. **`invalidate()`** — Zeroes `expiresAt` to force a refresh on the next call while preserving the refresh token.

Supports pre-loading tokens via the `initialTokens` constructor parameter.
