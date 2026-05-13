# ZohoDeskClient.spec.ts

Tests the `ZohoDeskClient` class which wraps the Zoho Desk API v1, covering base URL, auth headers, and CRUD operations for tickets (including search), comments, contacts, agents, and departments.

## Test Suites

- **ZohoDeskClient** — Single top-level suite with sections for Tickets, Comments, Contacts, and Agents/Departments.

## Key Test Cases

- `uses the correct base URL` — Verifies `desk.zoho.com/api/v1`.
- `injects auth header` — Confirms Zoho-oauthtoken format.
- `listTickets/getTicket/createTicket/updateTicket/deleteTicket/searchTickets` — Full ticket lifecycle including PATCH updates and search.
- `listComments/addComment/deleteComment` — Ticket comment management.
- `listContacts/createContact/deleteContact` — Desk contact CRUD.
- `listAgents()` — Agent listing.
- `listDepartments()` — Department listing.

## Test Setup

- Uses `axios-mock-adapter` on the client's axios instance.
- `PassthroughAuth` provides a static test token.
- `beforeEach` creates a fresh client and mock; `afterEach` restores the mock.
