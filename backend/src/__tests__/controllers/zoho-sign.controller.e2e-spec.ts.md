# zoho-sign.controller.e2e-spec.ts

This end-to-end test validates the `ZohoSignController` by loading the full `AppModule` and invoking controller methods directly to verify integration with the real service layer for document signing requests, templates, and document management.

## Test Suites

- **ZohoSignController (e2e)** — Full integration test of all Zoho Sign endpoints

## Key Test Cases

- `should be defined` — Controller instantiation check
- **Requests**: `listRequests`, `getRequest`, `createRequest`, `sendRequest`, `deleteRequest`, `recallRequest`, `remindRequest`
- **Templates**: `listTemplates`, `getTemplate`, `createRequestFromTemplate`
- **Documents**: `getDocument`, `downloadDocument`

## Test Setup

- Imports the full `AppModule` to create a complete application context
- Uses `beforeAll`/`afterAll` for module lifecycle (compile and close)
- Controller methods are called directly with dummy IDs and minimal payloads (e.g., request names, recipient emails, action types)
- All assertions verify that results are defined
