# zoho-desk.controller.e2e-spec.ts

End-to-end test for the `ZohoDeskController` that boots the full `AppModule` and exercises Zoho Desk endpoints including Tickets, Comments, Contacts, Agents, and Departments.

## Test Suites

- **ZohoDeskController (e2e)** — full integration tests against Zoho Desk endpoints

## Key Test Cases

- **Tickets** — `listTickets()`, `searchTickets()`, `getTicket()`, `createTicket()`, `updateTicket()`, `deleteTicket()`
- **Comments** — `listComments()`, `addComment()`, `deleteComment()`
- **Contacts** — `listContacts()`, `getContact()`, `createContact()`, `updateContact()`, `deleteContact()`
- **Agents** — `listAgents()`, `getAgent()`
- **Departments** — `listDepartments()`, `getDepartment()`

## Test Setup

- Imports the full `AppModule` via `Test.createTestingModule`
- Controller is retrieved from the compiled module in `beforeAll`
- Module is closed in `afterAll` for cleanup
- Tests call controller methods directly with sample ticket/contact data and IDs
