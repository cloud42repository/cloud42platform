# zoho-salesiq.service.ts

Angular service providing an HTTP client for the Zoho SalesIQ live chat and visitor tracking API. Manages visitors, chats, operators, departments, bots, and feedback forms — all scoped by screen name.

## Key Exports

- **ZohoSalesiqService** — Injectable Angular service (root-provided) for Zoho SalesIQ operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-salesiq'` and provides methods grouped by resource:

1. **Visitors** — List, get, and search visitors for a given screen name.
2. **Chats** — List chats, get a chat, list chat messages, send a message, set a rating.
3. **Operators** — List operators, get an operator, set operator availability.
4. **Departments** — List and get departments.
5. **Bots** — List bots and send a bot message.
6. **Feedback Forms** — List feedback forms.

All methods require a `screenName` parameter that identifies the SalesIQ embed/portal context.
