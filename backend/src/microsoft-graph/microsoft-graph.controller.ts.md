# microsoft-graph.controller.ts

NestJS REST controller that exposes Microsoft Graph API functionality under the `/microsoft-graph` route prefix. Currently provides a single endpoint for sending emails.

## Key Exports

- **`MicrosoftGraphController`** — Controller with a `POST /send-mail` endpoint.

## Dependencies

- `@nestjs/common` — Controller, Post, Body decorators
- `./microsoft-graph.service` — MicrosoftGraphService
- `./microsoft-graph.dto` — SendMailRequest

## How It Works

The controller defines one route:
- `POST /microsoft-graph/send-mail` — accepts a `SendMailRequest` body (recipients, subject, body, attachments) and delegates to `MicrosoftGraphService.sendMail()`.
