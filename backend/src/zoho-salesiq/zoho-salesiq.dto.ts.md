# zoho-salesiq.dto.ts

TypeScript type definitions and interfaces representing Zoho SalesIQ API entities including visitors, chats, operators, departments, bots, and feedback forms.

## Key Exports

- **VisitorStatus** — Union type for visitor states: browsing, chatting, idle, triggered
- **SalesIQVisitor** — Interface for visitor data (name, email, IP, visits, custom data, etc.)
- **ChatStatus** — Union type for chat states: open, missed, waiting, completed
- **SalesIQChat** — Interface for chat data with messages, duration, and rating
- **SalesIQMessage** — Interface for individual chat messages
- **OperatorStatus** — Union type: online, busy, offline
- **SalesIQOperator** — Interface for operator details including departments
- **SalesIQDepartment** — Interface for department with operator list
- **SalesIQFeedbackForm** — Interface for feedback forms with typed questions
- **SalesIQBot** — Interface for bot configuration (webhook or codal)
- **SalesIQListParams** — Extended list parameters with status, department, date, and sort filters

## Dependencies

- `ZohoListParams` from `../shared/shared.dto` — Base pagination parameters

## How It Works

Provides strongly-typed interfaces used across the SalesIQ controller, service, and client to ensure type safety for API request/response payloads. All fields are optional to accommodate partial API responses.
