# auth-config.types.ts

This file defines the TypeScript type system for authentication configuration across all platform modules, supporting multiple OAuth 2.0 flows, API key auth, basic auth, and service-specific config interfaces like Zoho OAuth.

## Key Exports

- `AuthType` — Type union of supported auth strategies: `'none' | 'client-credentials' | 'authorization-code' | 'pkce' | 'oauth-refresh' | 'device-flow' | 'api-key' | 'basic-auth'`
- `AuthConfig` — Interface with all possible auth fields (client ID/secret, token URLs, API keys, username/password, bearer tokens, stored token data)
- `AUTH_TYPE_LABELS: Record<AuthType, string>` — Human-readable labels for each auth type
- `AUTH_TYPE_FIELDS: Record<AuthType, (keyof AuthConfig)[]>` — Required fields per auth type (drives dynamic form rendering)
- `AUTH_FIELD_LABELS: Record<string, { label, placeholder?, secret? }>` — UI metadata for each auth field (label, placeholder text, secret masking flag)
- `ModuleAuthSetting` — Interface binding a module ID to its auth configuration
- `ZohoProductConfig` — Interface for Zoho-specific OAuth config shared by all Zoho modules

## Dependencies

- None (pure type definitions and constants)

## How It Works

The file establishes a flexible auth configuration system where each module can be assigned an `AuthConfig` with a `type` discriminator. The `AUTH_TYPE_FIELDS` constant defines which fields are relevant for each auth type, enabling the UI to dynamically show/hide form fields. `AUTH_FIELD_LABELS` provides display metadata including placeholder text and whether a field should be masked as a secret. The `ZohoProductConfig` interface extends the pattern for Zoho-specific fields like `accountsUrl` and `organizationId` shared across all 20+ Zoho modules.
