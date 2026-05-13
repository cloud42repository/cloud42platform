# zoho-creator.controller.e2e-spec.ts

End-to-end test for the `ZohoCreatorController` that boots the full `AppModule` and invokes real controller methods to verify Zoho Creator API integration including applications, forms, records, reports, and workflows.

## Test Suites

- **ZohoCreatorController (e2e)** — full integration tests against Zoho Creator endpoints

## Key Test Cases

- `should be defined` — controller instantiation check
- `listApplications()` / `getApplication()` — application retrieval
- `listForms()` / `getForm()` — form listing and detail
- `listRecords()` / `getRecord()` / `createRecord()` / `updateRecord()` / `deleteRecord()` / `searchRecords()` — full CRUD and search on records
- `listReports()` — report listing
- `triggerWorkflow()` — workflow execution

## Test Setup

- Imports the full `AppModule` via `Test.createTestingModule`
- Controller is retrieved from the compiled module in `beforeAll`
- Module is closed in `afterAll` for cleanup
- Tests call controller methods directly with sample parameters (e.g., `'my-app'`, `'my-form'`)
