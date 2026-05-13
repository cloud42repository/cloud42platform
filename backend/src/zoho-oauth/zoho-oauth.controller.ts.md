# zoho-oauth.controller.ts

NestJS REST controller implementing the full Zoho OAuth 2.0 token lifecycle — authorization URL generation, token exchange, refresh, revocation, and integrated store/clear operations.

## Key Exports

- **ZohoOAuthController** — Controller registered at route `zoho-oauth` with endpoints for the complete OAuth flow.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, HttpCode, HttpStatus, Body, Query decorators
- `ZohoOAuthService` — OAuth service handling token operations
- DTO types from `./zoho-oauth.dto` — `AuthorizeQueryDto`, `GenerateTokenDto`, `RefreshTokenDto`, `RevokeTokenDto`

## How It Works

The controller exposes six endpoints covering the Zoho OAuth 2.0 web server flow:
1. **GET /authorize** — Builds and returns the Zoho consent URL using optional query parameters (scope, clientId, redirectUri, etc.) with env var fallbacks.
2. **POST /token** — Exchanges a one-time grant token for access + refresh tokens.
3. **POST /exchange-store** — Exchanges the grant token AND persists credentials in the user's auth-config (`__zoho__` module), enabling automatic pickup by all Zoho service clients.
4. **POST /refresh** — Refreshes an expired access token using a stored refresh token.
5. **POST /revoke** — Revokes a refresh token.
6. **POST /revoke-clear** — Revokes the token AND removes stored auth-config for the current user.
