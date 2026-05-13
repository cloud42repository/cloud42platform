# ZohoCRMClient.ts

HTTP client for the Zoho CRM v6 REST API, extending `ZohoBaseClient` to provide typed methods for leads, contacts, accounts, deals, tasks, notes, and generic module operations.

## Key Exports

- **ZohoCRMConfig** — Configuration interface extending `ZohoCredentials` with `region`, `organizationId`, and optional `apiBaseUrl`
- **ZohoCRMClient** — API client class with full CRUD and search for all CRM modules

## Dependencies

- `ZohoBaseClient` — Base HTTP client with OAuth token management
- `ZohoCredentials`, `ZOHO_API_BASE`, `ZohoRegion` — Credential and region types
- `zoho-crm.dto` — DTO interfaces for all CRM entities
- `../shared/shared.dto` — `ZohoListWrapper`, `ZohoBulkResponse`

## How It Works

The client extends `ZohoBaseClient`, deriving the API base URL from the configured region (e.g., `https://www.zohoapis.com/crm/v6` for "com"). It provides typed methods for each standard module (Leads, Contacts, Accounts, Deals, Tasks, Notes) with list, get, create, update, delete, and search operations. Bulk create/update methods accept arrays wrapped in `{ data: [...] }`. A generic module section provides the same operations for any CRM module by name, using TypeScript generics for type flexibility.
