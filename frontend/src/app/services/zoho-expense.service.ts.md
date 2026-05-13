# zoho-expense.service.ts

Angular service providing an HTTP client for the Zoho Expense API. Manages expense categories, individual expenses, expense reports with approval workflows, and advances.

## Key Exports

- **ZohoExpenseService** — Injectable Angular service (root-provided) for Zoho Expense operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-expense'` and provides methods grouped by resource:

1. **Categories** — List and get expense categories.
2. **Expenses** — List, get, create, update, delete individual expenses.
3. **Reports** — List, get, create, update, delete expense reports; submit and approve reports via dedicated action endpoints.
4. **Advances** — List and get advance records.
