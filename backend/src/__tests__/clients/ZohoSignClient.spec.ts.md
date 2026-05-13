# ZohoSignClient.spec.ts

Tests the `ZohoSignClient` class, verifying correct base URL, auth header injection, and operations for signature requests (create, send, recall, remind, delete), templates, and document retrieval against the Zoho Sign API v1.

## Test Suites

- **ZohoSignClient** — Main suite covering authentication, URL configuration, and all e-signature resource endpoints.

## Key Test Cases

- `uses the correct base URL` — Verifies base URL contains `sign.zoho.com/api/v1`
- `injects auth header` — Confirms `Zoho-oauthtoken` header is set
- `listRequests()` / `getRequest()` / `createRequest()` / `sendRequest()` / `deleteRequest()` — Full request lifecycle
- `recallRequest()` — Recall a sent signature request
- `remindRequest()` — Send reminder for pending request
- `listTemplates()` / `getTemplate()` — Template management
- `createRequestFromTemplate()` — Create a signature request from an existing template
- `getDocument()` — Retrieve a document from a specific request

## Test Setup

- **beforeEach**: Creates a new `ZohoSignClient` instance with `PassthroughAuth` and initializes `axios-mock-adapter`.
- **afterEach**: Restores the mock adapter.
