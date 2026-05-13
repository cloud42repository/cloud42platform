# zoho-sign.service.ts

Angular service providing an HTTP client for the Zoho Sign e-signature API. Manages signature requests, templates, and document operations.

## Key Exports

- **ZohoSignService** — Injectable Angular service (root-provided) for Zoho Sign operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-sign'` and provides methods grouped by resource:

1. **Requests** — List, get, create, send, delete, recall, and remind signature requests.
2. **Templates** — List and get templates; create a new signature request from a template.
3. **Documents** — Get document metadata and download a signed document by request and document ID.
