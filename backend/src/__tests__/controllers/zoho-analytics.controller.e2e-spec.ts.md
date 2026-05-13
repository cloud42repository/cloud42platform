# zoho-analytics.controller.e2e-spec.ts

End-to-end tests for the `ZohoAnalyticsController`, covering workspace management, view operations, report/dashboard listing, and data import/export functionality for the Zoho Analytics integration.

## Test Suites

- **ZohoAnalyticsController (e2e)** — Tests all Zoho Analytics endpoints with the full AppModule.

## Key Test Cases

- `GET /zoho-analytics/workspaces → listWorkspaces()` — Lists all analytics workspaces.
- `GET /zoho-analytics/workspaces/:id → getWorkspace()` — Retrieves a specific workspace.
- `POST /zoho-analytics/workspaces → createWorkspace()` — Creates a new workspace.
- `DELETE /zoho-analytics/workspaces/:id → deleteWorkspace()` — Deletes a workspace.
- `GET .../views → listViews()` — Lists views within a workspace.
- `GET .../views/:viewId → getView()` — Retrieves a specific view.
- `POST .../views → createView()` — Creates a new view (TABLE type).
- `DELETE .../views/:viewId → deleteView()` — Deletes a view.
- `GET .../reports → listReports()` — Lists reports in a workspace.
- `GET .../dashboards → listDashboards()` — Lists dashboards in a workspace.
- `POST /zoho-analytics/import → importData()` — Imports data into a view.
- `GET .../export → exportData()` — Exports view data as CSV.

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- No external mocks; relies on service-level integration or mock data.
- Module fixture is closed in `afterAll`.
