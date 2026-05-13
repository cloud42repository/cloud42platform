# workflow.service.ts

The core workflow engine service that manages workflow definitions, executes multi-step workflows (including API calls, conditionals, loops, scripts, sub-workflows), and persists run logs to the backend.

## Key Exports

- **`WorkflowService`** — Injectable service providing workflow CRUD, execution engine, scheduling, and run-log management.

## Dependencies

- `@angular/core` — `Injectable`, `inject`, `signal`
- `@angular/common/http` — `HttpErrorResponse`
- `rxjs` — `firstValueFrom`
- `@angular/material/snack-bar` — `MatSnackBar`
- `./api.service` — `ApiService`
- `./user-management.service` — `UserManagementService`
- `../config/workflow.types` — `Workflow`, `WorkflowNode`, `WorkflowStep`, various block types, `WorkflowRunLog`, etc.
- `../config/endpoints` — `MODULES`, `extractPathParams`

## How It Works

1. **CRUD** — On construction, workflows are loaded from `/workflows`. `upsert` and `remove` manage local signal state with optimistic API sync.
2. **Execution** — `execute(workflowId, inputValues)` runs a workflow step-by-step, building a `WorkflowRunLog`. Each step result is stored in a `Map<string, unknown>` for inter-step data passing.
3. **Scheduling** — A 30-second interval calls `checkScheduled()` to fire workflows whose `scheduledAt` time has passed.
4. **Step types** — Supports API call steps, try/catch blocks, loops, if/else branches, mapper/filter transforms, sub-workflow calls, and script blocks.
5. **Persistence** — After execution, the final status and run log are persisted to the backend via `updateOnApi`.
