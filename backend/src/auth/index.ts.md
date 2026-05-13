# index.ts

Barrel file that re-exports all authentication providers, their configuration interfaces, and core types from the `auth/` module. Consumers can import everything they need from `"../auth"` without knowing individual file paths.

## Key Exports

- **`IAuthProvider`** — Core auth interface (type export).
- **`ZohoRawTokenResponse`, `CachedToken`, `ZohoDeviceCodeResponse`** — Shared token types.
- **`OAuthRefreshProvider` / `RefreshTokenAuth`** — Refresh-token grant provider (with named alias).
- **`ClientCredentialsAuth`** — Client credentials grant provider.
- **`AuthorizationCodeAuth`** — Authorization code grant provider.
- **`PKCEAuth`** — PKCE (public client) authorization code provider.
- **`DeviceFlowAuth`** — Device authorization grant provider.
- **`PassthroughAuth`** — Pass-through provider for pre-supplied tokens.
- **`CustomAuthProvider`** — Bring-your-own token fetcher provider.
- Config types: `OAuthRefreshConfig`, `ClientCredentialsConfig`, `AuthCodeConfig`, `AuthCodeTokens`, `PKCEAuthConfig`, `DeviceFlowConfig`, `DeviceFlowPromptFn`, `CustomAuthConfig`, `CustomTokenResult`, `CustomTokenFetcher`.

## Dependencies

- All sibling files in `auth/` (re-exported).

## How It Works

Simple re-export barrel — no logic. Provides a single entry point for the entire auth module, including aliased exports (`RefreshTokenAuth`) for API discoverability.
