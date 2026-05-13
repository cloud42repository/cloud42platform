# zoho-analytics.service.ts

Angular service that provides an HTTP client for the Zoho Analytics API. It enables workspace management, view and report listing, dashboard access, and data import/export operations.

## Key Exports

- **ZohoAnalyticsService** — Injectable Angular service (root-provided) for Zoho Analytics operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-analytics'` and delegates to `ApiService`. Methods are grouped by resource:

1. **Workspaces** — List, get, create, and delete analytics workspaces.
2. **Views** — List, get, create, and delete views within a workspace (supports query filters).
3. **Reports & Dashboards** — List reports and dashboards for a workspace.
4. **Import / Export** — Import data via POST body and export view data with optional query parameters.
