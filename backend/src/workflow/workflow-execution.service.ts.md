# workflow-execution.service.ts

Execution engine that runs workflow step trees on the backend. It supports multiple node kinds including API endpoint calls, try-catch blocks, loops, if-else conditionals, mappers, filters, sub-workflows, scripts, and notifications.

## Key Exports

- **WorkflowExecutionService** — injectable service with the `execute(workflowId, inputValues?)` method and a `checkScheduled()` method for timer-based workflows.

## Dependencies

- `@nestjs/common` — `Injectable`, `Logger`, `NotFoundException`
- `@nestjs/config` — `ConfigService` (reads `PORT`)
- `typeorm` — `Repository`, `InjectRepository`
- `axios` — HTTP client for API proxy calls
- `WorkflowEntity` — database entity
- `workflow.endpoints` — `MODULES`, `extractPathParams`
- `workflow.types` — all workflow node type definitions
- `NotificationService` — sends in-app notifications
- `MicrosoftGraphService` — Microsoft Graph integrations

## How It Works

1. **execute()** — loads the workflow from DB, marks it as `running`, seeds input values into a `stepResults` map, then walks the step tree via `executeNodes()`.
2. **executeNodes()** — iterates nodes sequentially; for each node, dispatches to a kind-specific handler (endpoint, try-catch, loop, if-else, mapper, filter, sub-workflow, script, notification).
3. **Endpoint steps** — resolves path parameters and body from `PayloadSource` references, then calls the local API via axios.
4. **Control-flow blocks** — try-catch catches failures and runs catch steps; loops iterate by count or over arrays; if-else evaluates a condition and branches.
5. **Mapper/Filter** — transforms or filters data arrays from previous step results.
6. **Sub-workflow** — recursively executes another workflow by ID.
7. **Script** — runs user-defined JavaScript in a sandboxed VM with bound inputs and an API proxy object.
8. **Notification** — creates an in-app notification via `NotificationService`.
9. After execution, it builds outputs, updates the workflow status (`completed`/`failed`), and persists the run log.
10. **checkScheduled()** — queries workflows with status `scheduled` and `scheduledAt <= now`, then fires their execution.
