# workflow.dto.ts

Data Transfer Object interfaces for the workflow REST API — defines the shapes of request bodies and response payloads.

## Key Exports

- **CreateWorkflowDto** — request body for `POST /api/workflows` (includes userEmail, name, steps, optional inputs/outputs/status/scheduledAt)
- **UpdateWorkflowDto** — request body for `PUT /api/workflows/:id` (all fields optional for partial updates)
- **ExecuteWorkflowDto** — request body for `POST /api/workflows/:id/execute` (optional `inputValues` map)
- **WorkflowResponseDto** — response shape returned by all workflow endpoints (includes id, timestamps as ISO strings, all serialized fields)

## Dependencies

- `WorkflowStatus` — imported from `workflow.entity` for the status field type

## How It Works

These are plain TypeScript interfaces (no runtime validation decorators). They serve as compile-time contracts between the controller, service, and API consumers. The response DTO serializes dates as ISO strings and ensures all optional entity fields have sensible defaults (empty string, empty array, null).
