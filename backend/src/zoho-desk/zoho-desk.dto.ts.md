# zoho-desk.dto.ts

TypeScript interfaces and types defining the data structures for the Zoho Desk integration, covering tickets, comments, contacts, agents, and departments.

## Key Exports

- **TicketStatus** — Union type for ticket statuses (Open, On Hold, Escalated, Closed, Resolved)
- **TicketPriority** — Union type for priority levels (Low, Medium, High, Urgent)
- **TicketChannel** — Union type for ticket channels (Email, Twitter, Facebook, Web, Phone, Chat, API)
- **DeskTicket** — Interface for a support ticket with contact, account, tags, and custom fields
- **CreateTicketDTO** — DTO for creating a ticket
- **UpdateTicketDTO** — Partial DTO for updating a ticket
- **DeskComment** — Interface for a ticket comment
- **CreateCommentDTO** — DTO for adding a comment
- **DeskContact** — Interface for a Desk contact
- **CreateDeskContactDTO / UpdateDeskContactDTO** — DTOs for contact operations
- **DeskAgent** — Interface for a support agent
- **DeskDepartment** — Interface for a department with associated channels
- **DeskListParams** — Pagination/filter params with status, priority, department, channel, and sort options

## Dependencies

- `../shared/shared.dto` — `ZohoListParams`

## How It Works

Defines all request/response shapes used by `ZohoDeskClient` and the service layer. Types are organized by domain entity (Ticket, Comment, Contact, Agent, Department) with separate Create/Update DTOs. The `DeskListParams` interface extends shared list params with Desk-specific filters.
