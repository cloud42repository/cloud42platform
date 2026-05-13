# zoho-books.service.ts

Angular service providing an HTTP client for the Zoho Books accounting API. Covers contacts, invoices, bills, expenses, payments, and items with full CRUD plus invoice lifecycle actions.

## Key Exports

- **ZohoBooksService** — Injectable Angular service (root-provided) for Zoho Books operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-books'` and organizes methods by resource:

1. **Contacts** — List, get, create, update, delete.
2. **Invoices** — Full CRUD plus `sendInvoice`, `markInvoiceAsSent`, and `voidInvoice` lifecycle actions.
3. **Bills** — List, get, create, update, delete.
4. **Expenses** — List, get, create, update, delete.
5. **Payments** — List, get, create, delete.
6. **Items** — List, get, create, update, delete.

All methods accept optional `query` parameters for filtering and return Observables from `ApiService`.
