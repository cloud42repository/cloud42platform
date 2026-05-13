# zoho-creator.service.ts

Angular service providing an HTTP client for the Zoho Creator low-code platform API. Manages applications, forms, records, reports, and workflow triggers.

## Key Exports

- **ZohoCreatorService** — Injectable Angular service (root-provided) for Zoho Creator operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-creator'` and provides methods grouped by resource:

1. **Applications** — List and get Creator applications by link name.
2. **Forms** — List and get forms within an application.
3. **Records** — List, get, create, update, delete, and search records via report or form link names.
4. **Reports** — List reports for an application.
5. **Workflows** — Trigger a named workflow within an application with a request body.

All paths use `appLinkName` and `formLinkName`/`reportLinkName` as identifiers rather than numeric IDs.
