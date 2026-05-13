# ZohoInvoiceClient.ts

HTTP client class for the Zoho Invoice v3 API, extending the shared `ZohoBaseClient` to provide typed methods for customers, invoices (including email sending), estimates, recurring invoices, and payments.

## Key Exports

- `ZohoInvoiceConfig` — Configuration interface extending `ZohoCredentials` with required `organizationId` and optional `region`/`apiBaseUrl`
- `ZohoInvoiceClient` — Client class with methods for all Zoho Invoice API endpoints

## Dependencies

- `../base/ZohoBaseClient` — Base HTTP client with get/post/put/delete methods and token management
- `../base/types` — `ZohoCredentials`, `ZOHO_API_BASE`, `ZohoRegion`
- `./zoho-invoice.dto` — All DTO/interface types for request/response data

## How It Works

The constructor derives the API base URL from the region (using `ZOHO_API_BASE` mapping, defaulting to "com") appending `/invoice/v3`, and sets `organization_id` as a default query parameter. Methods map to Zoho Invoice REST endpoints: full CRUD for customers, full CRUD + `sendInvoice` (via email endpoint) for invoices, full CRUD for estimates, create/list/get/delete for recurring invoices, and list/create/delete for payments. All methods return typed Promises.
