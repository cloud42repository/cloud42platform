# zoho-expense.controller.e2e-spec.ts

End-to-end test for the `ZohoExpenseController` that boots the full `AppModule` and exercises Zoho Expense endpoints including Categories, Expenses, Reports (with submit/approve workflows), and Advances.

## Test Suites

- **ZohoExpenseController (e2e)** — full integration tests against Zoho Expense endpoints

## Key Test Cases

- **Categories** — `listCategories()`, `getCategory()`
- **Expenses** — `listExpenses()`, `getExpense()`, `createExpense()`, `updateExpense()`, `deleteExpense()`
- **Reports** — `listReports()`, `getReport()`, `createReport()`, `updateReport()`, `deleteReport()`, `submitReport()`, `approveReport()`
- **Advances** — `listAdvances()`, `getAdvance()`

## Test Setup

- Imports the full `AppModule` via `Test.createTestingModule`
- Controller is retrieved from the compiled module in `beforeAll`
- Module is closed in `afterAll` for cleanup
- Tests call controller methods directly with sample expense data (amounts, dates, category IDs)
