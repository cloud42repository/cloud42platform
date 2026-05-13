# ZohoSalesIQClient.spec.ts

Tests the `ZohoSalesIQClient` class, verifying correct base URL, auth header injection, and operations for visitors, chats (including messaging and ratings), operators, departments, bots, and feedback forms against the Zoho SalesIQ v2 API.

## Test Suites

- **ZohoSalesIQClient** — Main suite covering authentication, URL configuration, and all SalesIQ resource endpoints scoped by screen name.

## Key Test Cases

- `uses the correct base URL` — Verifies base URL contains `salesiq.zoho.com/api/v2`
- `injects auth header` — Confirms `Zoho-oauthtoken` header is set
- `listVisitors()` / `getVisitor()` / `searchVisitors()` — Visitor management and search
- `listChats()` / `getChat()` / `listChatMessages()` / `sendChatMessage()` — Chat lifecycle
- `setRating()` — Chat rating submission
- `listOperators()` / `getOperator()` / `setOperatorAvailability()` — Operator management
- `listDepartments()` / `getDepartment()` — Department endpoints
- `listBots()` / `sendBotMessage()` — Bot management and messaging
- `listFeedbackForms()` — Feedback form listing

## Test Setup

- **beforeEach**: Creates a new `ZohoSalesIQClient` instance with `PassthroughAuth` and initializes `axios-mock-adapter`.
- **afterEach**: Restores the mock adapter.
- Uses a constant `SCREEN` ("mysite") for all screen-name-scoped endpoints.
