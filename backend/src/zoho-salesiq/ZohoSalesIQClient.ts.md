# ZohoSalesIQClient.ts

Low-level HTTP client for the Zoho SalesIQ v2 REST API, extending the shared `ZohoBaseClient` with typed methods for all supported SalesIQ resources.

## Key Exports

- **ZohoSalesIQConfig** — Configuration interface extending `ZohoCredentials` with optional `organizationId` and `apiBaseUrl`
- **ZohoSalesIQClient** — Client class providing typed methods for visitors, chats, operators, departments, bots, and feedback forms

## Dependencies

- `ZohoBaseClient` from `../base/ZohoBaseClient` — Base HTTP client with token management
- `ZohoCredentials` from `../base/types` — Credential interface (clientId, clientSecret, etc.)
- DTO types from `./zoho-salesiq.dto` — Type definitions for all SalesIQ entities

## How It Works

1. Constructor receives a `ZohoSalesIQConfig` and passes it to `ZohoBaseClient` with a default API base URL of `https://salesiq.zoho.com/api/v2`.
2. All methods are organized by resource and take a `screenName` parameter as the first path segment.
3. **Visitors**: `listVisitors`, `getVisitor`, `searchVisitors` — GET requests with optional query params.
4. **Chats**: `listChats`, `getChat`, `listChatMessages`, `sendChatMessage`, `setRating` — GET/POST for chat management.
5. **Operators**: `listOperators`, `getOperator`, `setOperatorAvailability` — manage operator online status.
6. **Departments**: `listDepartments`, `getDepartment` — read-only department access.
7. **Bots**: `listBots`, `sendBotMessage` — list bots and send payloads.
8. **Feedback Forms**: `listFeedbackForms` — retrieve available feedback forms.
