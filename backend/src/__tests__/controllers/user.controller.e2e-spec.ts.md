# user.controller.e2e-spec.ts

End-to-end tests for the `UserController`, covering user registration, retrieval, role assignment, module visibility management, and deletion with real database interactions.

## Test Suites

- **UserController (e2e)** — Tests full user lifecycle CRUD and configuration endpoints.

## Key Test Cases

- `GET /users → findAll()` — Returns an array of all users.
- `GET /users/:email → findOne()` — Retrieves a specific user by email.
- `POST /users/login → registerLogin()` — Registers/updates a user on login.
- `PATCH /users/:email/role → setRole()` — Updates a user's role.
- `PATCH /users/:email/module-visibility → setModuleVisibility()` — Toggles module visibility for a user.
- `PATCH /users/:email/modules-bulk → setAllModulesEnabled()` — Bulk enables/disables modules.
- `DELETE /users/:email → remove()` — Deletes a user.

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- Seeds a test user with a unique timestamped email in `beforeAll`.
- Cleans up the test user in `afterAll` (ignores errors if already removed).
- Module fixture is closed in `afterAll`.
