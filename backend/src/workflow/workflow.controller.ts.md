# workflow.controller.ts

REST controller that exposes CRUD and execution endpoints for workflows. It delegates persistence operations to `WorkflowService` and execution to `WorkflowExecutionService`.

## Key Exports

- **WorkflowController** — NestJS controller registered at `/workflows` with endpoints for listing, creating, updating, deleting, and executing workflows.

## Dependencies

- `@nestjs/common` — decorators (`Controller`, `Get`, `Post`, `Put`, `Delete`, `Query`, `Param`, `Body`)
- `WorkflowService` — handles CRUD persistence
- `WorkflowExecutionService` — handles workflow execution logic
- `CreateWorkflowDto`, `UpdateWorkflowDto`, `ExecuteWorkflowDto` — request DTOs

## How It Works

The controller exposes six REST endpoints:
1. `GET /workflows?userEmail=` — lists all workflows for a user
2. `GET /workflows/:id` — retrieves a single workflow by ID
3. `POST /workflows/:id/execute` — triggers backend execution of a workflow with optional input values
4. `POST /workflows` — creates a new workflow
5. `PUT /workflows/:id` — updates an existing workflow
6. `DELETE /workflows/:id` — deletes a workflow

Each method simply forwards the request to the appropriate service method and returns the result.
