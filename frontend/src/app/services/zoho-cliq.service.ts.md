# zoho-cliq.service.ts

Angular service providing an HTTP client for the Zoho Cliq team communication API. Supports channel management, messaging, direct messages, user groups, and bot interactions.

## Key Exports

- **ZohoCliqService** — Injectable Angular service (root-provided) for Zoho Cliq operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-cliq'` and provides methods grouped by resource:

1. **Channels** — List, get, create, delete channels; add/remove members; list and send messages; delete messages.
2. **Direct Messages** — Send a direct message to a user by email.
3. **User Groups** — List, get, and create user groups.
4. **Bots** — List bots and send messages via a bot.
