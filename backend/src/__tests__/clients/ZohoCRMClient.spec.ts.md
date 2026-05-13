# ZohoCRMClient.spec.ts

Tests the `ZohoCRMClient` class which wraps the Zoho CRM API v6, covering regional URL construction, auth headers, and CRUD/search operations for Leads, Contacts, Accounts, Deals, Tasks, Notes, and generic modules.

## Test Suites

- **ZohoCRMClient** — Single top-level suite with sections for URL construction, Auth header, Leads, Contacts, Accounts, Deals, Tasks, Notes, and Generic module.

## Key Test Cases

- `uses the correct default base URL for region=com/eu/in` — Regional URL resolution.
- `injects Zoho-oauthtoken header` — Auth format verification.
- `listLeads/getLead/createLeads/updateLeads/deleteLead/searchLeads` — Full Leads module lifecycle.
- `listLeads() forwards query params` — Pagination parameter passing.
- `listContacts/getContact/createContacts/deleteContact` — Contact CRUD.
- `listAccounts/createAccounts` — Account operations.
- `listDeals/createDeals` — Deal operations.
- `listTasks/createTasks` — Task operations.
- `listNotes()` — Notes retrieval.
- `listRecords/createRecords/searchRecords` — Generic module operations for any CRM module.

## Test Setup

- Uses `axios-mock-adapter` on the client's axios instance.
- `PassthroughAuth` provides a static test token.
- `makeClient()` helper supports optional region parameter.
- `beforeEach` creates a fresh client and mock; `afterEach` restores the mock.
