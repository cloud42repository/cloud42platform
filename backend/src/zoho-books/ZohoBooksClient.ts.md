# ZohoBooksClient.ts

HTTP client class for the Zoho Books v3 API, extending `ZohoBaseClient` with full CRUD methods for contacts, invoices, bills, expenses, payments, items, and recurring invoices.

## Key Exports

- **ZohoBooksConfig** — Configuration interface extending ZohoCredentials with organizationId, region, and apiBaseUrl
- **ZohoBooksClient** — API client class for all Zoho Books operations

## Dependencies

- `ZohoBaseClient` from `../base/ZohoBaseClient` — Base HTTP client with token management
- `ZohoCredentials`, `ZOHO_API_BASE`, `ZohoRegion` from `../base/types` — Credential types and region-based URL mapping
- DTO types from `./zoho-books.dto` — Request/response type definitions

## How It Works

1. Constructor takes `ZohoBooksConfig`, determines the region-specific API base URL (defaulting to `.com`), and passes `organization_id` as a default query parameter to all requests.
2. **Contacts** — CRUD on `/contacts` endpoints.
3. **Invoices** — CRUD plus send (email), mark as sent, and void via status endpoints.
4. **Bills** — CRUD on `/bills` endpoints.
5. **Expenses** — CRUD on `/expenses` endpoints.
6. **Payments** — List/get/create/delete on `/customerpayments` endpoints.
7. **Items** — CRUD on `/items` endpoints.
8. **Recurring Invoices** — CRUD plus stop/resume status actions, template update, and comment listing on `/recurringinvoices` endpoints.
