# workflow.controller.e2e-spec.ts

End-to-end tests for the `WorkflowController`, testing the full CRUD lifecycle of workflows including creation, listing, retrieval, update, and deletion with a real database-backed user.

## Test Suites

- **WorkflowController (e2e)** — Tests workflow CRUD operations with the full AppModule.

## Key Test Cases

- `POST /workflows → create()` — Creates a workflow linked to a test user.
- `GET /workflows → findAll()` — Lists all workflows for a given user email.
- `GET /workflows/:id → findOne()` — Retrieves a specific workflow by ID.
- `PUT /workflows/:id → update()` — Updates a workflow's name.
- `DELETE /workflows/:id → remove()` — Deletes the workflow.

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- Seeds a test user via `UserController.registerLogin` (workflows have a FK to users).
- Tracks `createdId` to clean up workflow in `afterAll`.
- Cleans up both workflow and user in `afterAll`.
- Module fixture is closed in `afterAll`.
