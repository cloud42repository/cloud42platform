# zoho-oauth.dto.ts

Defines TypeScript interfaces for all Zoho OAuth request/response data transfer objects used by the controller and service, following the Zoho OAuth 2.0 web server application flow.

## Key Exports

- **AuthorizeQueryDto** — Query parameters for building the Zoho authorization URL (scope, clientId, redirectUri, accountsUrl, state, accessType).
- **GenerateTokenDto** — Request body for exchanging a grant/authorization code for tokens (code, clientId, clientSecret, redirectUri, accountsUrl).
- **RefreshTokenDto** — Request body for refreshing an access token using a refresh token (refreshToken, clientId, clientSecret, accountsUrl).
- **RevokeTokenDto** — Request body for revoking a refresh token (refreshToken, accountsUrl).
- **ZohoTokenResponse** — Shape of the response from Zoho's token endpoint (access_token, refresh_token, token_type, expires_in, scope, api_domain, error).

## Dependencies

None — this file contains only TypeScript interface declarations with no runtime imports.

## How It Works

Each interface corresponds to a specific OAuth endpoint operation. All credential fields (clientId, clientSecret, redirectUri, accountsUrl) are optional because the service falls back to environment variables when they are omitted. The `ZohoTokenResponse` interface includes an optional `error` field to handle Zoho API error responses inline.
