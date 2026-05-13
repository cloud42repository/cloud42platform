# types.ts

Defines the shared configuration types and regional URL mappings used by `ZohoBaseClient` and all product-specific clients. Provides the canonical shape for credentials, product configs, and Zoho data center URLs.

## Key Exports

- **`ZohoCredentials`** — Interface for OAuth credentials (`clientId`, `clientSecret`, optional `refreshToken`, `accountsUrl`, `authProvider`).
- **`ZohoProductConfig`** — Extends `ZohoCredentials` with `apiBaseUrl` and optional `defaultParams`; the complete config passed to `ZohoBaseClient`.
- **`ZohoApiResponse<T>`** — Generic interface for Zoho's standard response envelope (`code`, `message`, `data`).
- **`ZohoRegion`** — Type union of supported regions: `"com" | "eu" | "in" | "au" | "jp" | "ca"`.
- **`ZOHO_ACCOUNTS_URL`** — Constant mapping `ZohoRegion` → OAuth accounts base URL.
- **`ZOHO_API_BASE`** — Constant mapping `ZohoRegion` → API base URL.
- **`IAuthProvider`** — Re-exported type from `../auth/IAuthProvider`.

## Dependencies

- `../auth/IAuthProvider` — `IAuthProvider` type import.

## How It Works

This is primarily a type-definition file. `ZohoProductConfig` is the single input type for `ZohoBaseClient`'s constructor. The `authProvider` field allows plugging in any `IAuthProvider` implementation; when omitted, `refreshToken` must be provided for the default `OAuthRefreshProvider`. The region constants enable clients to resolve the correct Zoho data center URLs based on a region code.
