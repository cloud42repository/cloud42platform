# ZohoSignClient.ts

Low-level HTTP client for the Zoho Sign v1 REST API, extending `ZohoBaseClient` with typed methods for requests, templates, and documents.

## Key Exports

- **ZohoSignConfig** — Configuration interface extending `ZohoCredentials` with optional `organizationId` and `apiBaseUrl`
- **ZohoSignClient** — Client class with methods for the full Sign API surface

## Dependencies

- `ZohoBaseClient` from `../base/ZohoBaseClient` — Base HTTP client with token management
- `ZohoCredentials` from `../base/types` — Credential interface
- DTO types from `./zoho-sign.dto` — Type definitions for Sign entities

## How It Works

1. Constructor sets API base URL to `https://sign.zoho.com/api/v1` by default.
2. **Requests**: `listRequests`, `getRequest`, `createRequest`, `sendRequest`, `deleteRequest`, `recallRequest`, `remindRequest` — Full CRUD and lifecycle management.
3. **Templates**: `listTemplates`, `getTemplate`, `createRequestFromTemplate` — Template listing and request generation from templates.
4. **Documents**: `getDocument`, `downloadDocument` — Retrieve document metadata or download signed PDF as a Buffer.
