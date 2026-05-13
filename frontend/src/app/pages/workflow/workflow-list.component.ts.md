# workflow-list.component.ts

This component provides the workflow listing page, displaying all saved workflows in a responsive card grid with execution status, step previews, run logs, and full CRUD/execution actions.

## Key Exports

- **WorkflowListComponent** — Standalone Angular component rendering the workflow collection with run, run-on-backend, edit, export, import, and delete capabilities.

## Template

- **Page Header** — Title with icon, import button, and "New Workflow" button.
- **Empty State** — Shown when no workflows exist.
- **Workflow Grid** — Responsive CSS grid of cards, each showing:
  - Name and status chip (draft/scheduled/running/completed/failed)
  - Metadata row (step count, scheduled time, last updated)
  - Step pills showing first 5 steps with method badges or control-flow icons
  - Last run log (expandable panel with step-by-step success/failure and responses)
  - Action buttons: Edit, Run Now (local execution), Run Backend (server-side execution), Export, Delete

## Dependencies

- `@angular/core` (Component, inject, signal)
- `@angular/router` (Router, RouterLink)
- Angular Material (Button, Icon, Table, Chips, Tooltip, ProgressSpinner, Expansion)
- `WorkflowService` — Provides reactive `workflows()` signal, CRUD, and `execute()` method
- `ApiService` — Backend execution via POST endpoint
- `Workflow`, `WorkflowStatus` from `workflow.types`
- `TranslatePipe` / `TranslateService` — i18n

## How It Works

The component injects `WorkflowService` and renders its reactive `workflows()` signal. The `run()` method calls `svc.execute(wf.id)` for local browser-based execution with a loading spinner tracked by `runningId` signal. The `runBackend()` method POSTs to `/workflows/:id/execute` for server-side execution, then reloads the workflow list. Export serializes the workflow (excluding timestamps and run logs) to JSON. Import reads and validates a JSON file, assigns a new UUID with draft status, and navigates to the editor. Delete confirms and removes via service.
