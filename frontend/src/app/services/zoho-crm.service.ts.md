# zoho-crm.service.ts

Angular service providing an HTTP client for the Zoho CRM API. Covers leads, contacts, accounts, deals, tasks, and notes with dedicated methods, plus generic module-based record operations for any CRM module.

## Key Exports

- **ZohoCrmService** — Injectable Angular service (root-provided) for Zoho CRM operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-crm'` and provides methods grouped by resource:

1. **Leads** — List, search, get, create (batch), update (batch), delete.
2. **Contacts** — List, search, get, create (batch), update (batch), delete.
3. **Accounts** — List, get, create (batch), update (batch), delete.
4. **Deals** — List, get, create (batch), update (batch), delete.
5. **Tasks** — List, get, create (batch), update (batch), delete.
6. **Notes** — List, get, create (batch), delete.
7. **Generic module methods** — `listRecords`, `getRecord`, `createRecords`, `updateRecords`, `deleteRecord`, `searchRecords` operating on any CRM module by name.

Batch create/update methods accept arrays wrapped in `{ data }` to match Zoho's bulk API format.
