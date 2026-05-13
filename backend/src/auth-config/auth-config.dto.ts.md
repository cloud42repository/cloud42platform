# auth-config.dto.ts

Data Transfer Object interfaces for the auth-config REST API — defines the configuration shape, request body, and response payload.

## Key Exports

- **AuthConfigDto** — interface representing a full auth configuration (type, clientId, clientSecret, tokenUrl, scope, tokens, API key fields, etc.)
- **SaveAuthConfigDto** — request body for `PUT /api/auth-configs/:moduleId` (wraps an `AuthConfigDto` in a `config` field)
- **AuthConfigResponseDto** — response shape with `moduleId`, `config`, and `updatedAt`

## Dependencies

None (pure type definitions).

## How It Works

`AuthConfigDto` is a flexible interface supporting multiple authentication types: OAuth2 (authorization code, client credentials, device flow), API key, basic auth, and bearer token. It also includes fields for Zoho-specific token data (`accessToken`, `tokenExpiresAt`, `accountsUrl`). The `SaveAuthConfigDto` wraps it for the PUT endpoint, and `AuthConfigResponseDto` adds the `moduleId` and timestamp for responses.
