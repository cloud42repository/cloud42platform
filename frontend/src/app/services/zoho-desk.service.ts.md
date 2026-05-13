# zoho-desk.service.ts

Angular service providing an HTTP client for the Zoho Desk helpdesk API. Manages tickets, comments, contacts, agents, and departments.

## Key Exports

- **ZohoDeskService** — Injectable Angular service (root-provided) for Zoho Desk operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-desk'` and provides methods grouped by resource:

1. **Tickets** — List, search, get, create, update (PATCH), delete.
2. **Comments** — List comments on a ticket, add a comment, delete a comment.
3. **Contacts** — List, get, create, update (PATCH), delete.
4. **Agents** — List and get agent records.
5. **Departments** — List and get departments.

Ticket and contact updates use PATCH semantics for partial updates.
