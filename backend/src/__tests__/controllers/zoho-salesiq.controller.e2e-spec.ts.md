# zoho-salesiq.controller.e2e-spec.ts

This end-to-end test validates the `ZohoSalesIQController` by loading the full `AppModule` and invoking controller methods directly to verify integration with the real service layer for visitors, chats, operators, departments, bots, and feedback forms.

## Test Suites

- **ZohoSalesIQController (e2e)** — Full integration test of all Zoho SalesIQ endpoints

## Key Test Cases

- `should be defined` — Controller instantiation check
- **Visitors**: `listVisitors`, `getVisitor`, `searchVisitors`
- **Chats**: `listChats`, `getChat`, `listChatMessages`, `sendChatMessage`, `setRating`
- **Operators**: `listOperators`, `getOperator`, `setOperatorAvailability`
- **Departments**: `listDepartments`, `getDepartment`
- **Bots**: `listBots`, `sendBotMessage`
- **Feedback**: `listFeedbackForms`

## Test Setup

- Imports the full `AppModule` to create a complete application context
- Uses `beforeAll`/`afterAll` for module lifecycle (compile and close)
- All endpoints are scoped by a `screenName` parameter (uses `'my-screen'` as test value)
- Controller methods are called directly with dummy IDs and minimal payloads
- All assertions verify that results are defined
