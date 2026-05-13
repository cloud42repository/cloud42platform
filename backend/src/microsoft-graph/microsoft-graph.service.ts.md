# microsoft-graph.service.ts

Injectable NestJS service that sends emails via the Microsoft Graph API. It manages OAuth2 token refresh per user, caches access tokens, and constructs the Graph API mail payload including recipients, body, and attachments.

## Key Exports

- **`MicrosoftGraphService`** — Service with `sendMail()` method for sending emails through Microsoft Graph.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService (MS_GRAPH_CLIENT_ID, MS_GRAPH_CLIENT_SECRET, MS_GRAPH_TENANT_ID)
- `../auth-config/auth-config.service` — AuthConfigService (per-user credential lookup)
- `../auth-module/user-context` — getCurrentUserEmail
- `axios` — HTTP requests to Microsoft token and Graph endpoints
- `./microsoft-graph.dto` — SendMailRequest, SendMailResponse

## How It Works

1. `sendMail()` resolves the current user's email from async-local-storage context.
2. `getAccessToken()` checks an in-memory token cache; if expired, loads the user's OAuth config from the `auth_configs` table (key `__microsoft-graph__`).
3. Exchanges the stored refresh token for a new access token via the Microsoft OAuth2 token endpoint.
4. If a new refresh token is returned, persists it back to the database.
5. Constructs the Graph API `/me/sendMail` payload with to/cc/bcc recipients, HTML or text body, and optional file attachments (base64-encoded).
6. Sends the request with the Bearer access token and returns a success response.
