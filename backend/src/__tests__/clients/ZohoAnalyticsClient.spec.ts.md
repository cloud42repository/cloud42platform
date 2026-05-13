# ZohoAnalyticsClient.spec.ts

Tests the `ZohoAnalyticsClient` class which wraps the Zoho Analytics API v2, covering base URL configuration, auth header injection, and CRUD operations for workspaces, views, and data import/export.

## Test Suites

- **ZohoAnalyticsClient** — Single top-level suite with sections for Workspaces, Views, and Data import/export.

## Key Test Cases

- `uses the correct base URL` — Verifies the API base URL contains `analyticsapi.zoho.com/api/v2`.
- `injects auth header` — Confirms Zoho-oauthtoken format.
- `listWorkspaces/getWorkspace/createWorkspace/deleteWorkspace` — Workspace CRUD operations.
- `listViews/getView/createView/deleteView` — View management within a workspace.
- `importData() calls POST /workspaces/:wsId/tables/:table/data` — Data import endpoint.
- `exportData() calls GET /workspaces/:wsId/views/:viewId/data` — Data export endpoint.

## Test Setup

- Uses `axios-mock-adapter` on the client's axios instance.
- `PassthroughAuth` provides a static test token.
- `beforeEach` creates a fresh client and mock; `afterEach` restores the mock.
