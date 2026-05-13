# zoho-invoice.service.ts

Angular service providing an HTTP client for the Zoho Invoice API. Manages customers, invoices, estimates, recurring invoices, and payments.

## Key Exports

- **ZohoInvoiceService** — Injectable Angular service (root-provided) for Zoho Invoice operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-invoice'` and provides methods grouped by resource:

1. **Customers** — List, get, create, update, delete customer records.
2. **Invoices** — List, get, create, update, delete invoices; send an invoice via email.
3. **Estimates** — List, get, create, update, delete estimates.
4. **Recurring Invoices** — List, get, create, delete recurring invoice schedules.
5. **Payments** — List, create, delete payment records.
