# ZohoCreatorClient.spec.ts

Tests the `ZohoCreatorClient` class which wraps the Zoho Creator API v2, covering base URL, auth headers, owner name prefixing, and CRUD operations for applications, forms, records, reports, and workflow triggering.

## Test Suites

- **ZohoCreatorClient** — Single top-level suite with sections for Applications, Forms, Records, Reports, and Workflows.

## Key Test Cases

- `uses the correct base URL` — Verifies `creator.zoho.com/api/v2`.
- `injects auth header` — Confirms Zoho-oauthtoken format.
- `prepends ownerName prefix when set` — Validates owner-scoped URL construction.
- `omits owner prefix when ownerName is not set` — Verifies fallback behavior.
- `listApplications/getApplication` — Application retrieval.
- `listForms/getForm` — Form management within an app.
- `listRecords/getRecord/createRecord/deleteRecord` — Record CRUD via reports and forms.
- `listReports()` — Report listing.
- `triggerWorkflow()` — Workflow execution via POST.

## Test Setup

- Uses `axios-mock-adapter` on the client's axios instance.
- `PassthroughAuth` provides a static test token.
- `makeClient()` helper accepts an optional `ownerName` parameter.
- `beforeEach` creates a fresh client and mock; `afterEach` restores the mock.
