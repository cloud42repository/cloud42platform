# ZohoBooksClient.spec.ts

Tests the `ZohoBooksClient` class which wraps the Zoho Books API v3, covering regional URL construction, organization_id injection, auth headers, and CRUD operations for contacts, invoices, expenses, payments, items, and bills.

## Test Suites

- **ZohoBooksClient** — Single top-level suite with sections for URL construction, Auth header, Contacts, Invoices, Expenses, Payments, Items, and Bills.

## Key Test Cases

- `uses the correct default base URL (com region)` — Confirms `zohoapis.com/books/v3`.
- `uses the EU base URL for region=eu` — Regional URL support.
- `appends organization_id as a default query param` — Automatic org ID injection.
- `injects Zoho-oauthtoken header` — Auth format verification.
- `listContacts/getContact/createContact/deleteContact` — Contact CRUD.
- `listInvoices/getInvoice/createInvoice/updateInvoice/sendInvoice/deleteInvoice` — Invoice lifecycle.
- `listExpenses/createExpense` — Expense operations.
- `listPayments/createPayment` — Payment operations.
- `listItems/createItem` — Item management.
- `listBills/createBill` — Bill management.

## Test Setup

- Uses `axios-mock-adapter` on the client's axios instance.
- `PassthroughAuth` provides a static test token.
- `makeClient()` helper supports optional region parameter.
- `beforeEach` creates a fresh client and mock; `afterEach` restores the mock.
