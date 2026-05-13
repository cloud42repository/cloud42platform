# ZohoCreatorClient.ts

HTTP client for the Zoho Creator v2 REST API, extending `ZohoBaseClient` to provide typed methods for applications, forms, records, reports, and workflows.

## Key Exports

- **ZohoCreatorConfig** — Configuration interface extending `ZohoCredentials` with `ownerName`, `organizationId`, and optional `apiBaseUrl`
- **ZohoCreatorClient** — API client class with methods for all Creator v2 endpoints

## Dependencies

- `ZohoBaseClient` — Base HTTP client with OAuth token management
- `ZohoCredentials` — Credential type definitions
- `zoho-creator.dto` — DTO interfaces (`CreatorApplication`, `CreatorForm`, `CreatorRecord`, `CreatorReport`, etc.)

## How It Works

The client extends `ZohoBaseClient`, defaulting the API base URL to `https://creator.zoho.com/api/v2`. It stores an `ownerName` and uses a helper `ownerPath()` to prefix all API paths with the owner's login name. Methods are organized by resource: applications (list, get), forms (list, get), records (list, get, create via forms, update/delete via reports, search with criteria), reports (list), and workflows (trigger). Record operations use forms for creation and reports for read/update/delete, following Creator's API design.
