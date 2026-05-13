# ZohoExpenseClient.spec.ts

Tests the `ZohoExpenseClient` class which wraps the Zoho Expense API v1, covering base URL, optional organization_id injection, and CRUD operations for expense categories, expenses, expense reports (with submit/approve workflow), and advance payments.

## Test Suites

- **ZohoExpenseClient** — Single top-level suite with sections for Categories, Expenses, Expense Reports, and Advances.

## Key Test Cases

- `uses the correct base URL` — Verifies `expense.zoho.com/api/v1`.
- `appends organization_id when provided` — Automatic org param injection.
- `works without organizationId` — Validates optional org ID.
- `listCategories/getCategory` — Expense category retrieval.
- `listExpenses/getExpense/createExpense/updateExpense/deleteExpense` — Expense CRUD.
- `listReports/createReport/submitReport/approveReport/deleteReport` — Full expense report lifecycle with workflow actions.
- `listAdvances()` — Advance payment listing.

## Test Setup

- Uses `axios-mock-adapter` on the client's axios instance.
- `PassthroughAuth` provides a static test token.
- `makeClient()` helper accepts a boolean to toggle organization_id inclusion.
- `beforeEach` creates a fresh client and mock; `afterEach` restores the mock.
