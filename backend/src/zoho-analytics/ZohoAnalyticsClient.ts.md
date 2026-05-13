# ZohoAnalyticsClient.ts

HTTP client class for the Zoho Analytics v2 API, extending `ZohoBaseClient` with methods for managing workspaces, views, reports, dashboards, and data import/export operations.

## Key Exports

- **ZohoAnalyticsConfig** — Configuration interface extending ZohoCredentials with accountOwnerEmail, organizationId, and apiBaseUrl
- **ZohoAnalyticsClient** — API client class with methods for all supported Zoho Analytics operations

## Dependencies

- `ZohoBaseClient` from `../base/ZohoBaseClient` — Base HTTP client with auth token management
- `ZohoCredentials` from `../base/types` — Base credential types
- DTO types from `./zoho-analytics.dto` — Request/response type definitions

## How It Works

1. Constructor accepts a `ZohoAnalyticsConfig` and passes it to `ZohoBaseClient`, defaulting the API base URL to `https://analyticsapi.zoho.com/api/v2`.
2. **Workspaces** — CRUD via GET/POST/DELETE on `/workspaces` endpoints.
3. **Views** — CRUD within a workspace at `/workspaces/:id/views` endpoints; supports optional list parameters.
4. **Reports** — Lists reports by querying views with `viewType: "chart"` filter.
5. **Dashboards** — Lists dashboards by querying views with `viewType: "dashboard"` filter.
6. **Data Import** — Posts data to `/workspaces/:id/tables/:table/data` with import config options.
7. **Data Export** — Gets data from a view with a `responseFormat` query parameter (csv/json/xlsx).
