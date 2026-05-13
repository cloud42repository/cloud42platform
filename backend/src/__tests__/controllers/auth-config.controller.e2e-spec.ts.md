# auth-config.controller.e2e-spec.ts

End-to-end tests for the `AuthConfigController`, verifying CRUD operations on authentication configurations per module, including admin-level access to user-specific configs.

## Test Suites

- **AuthConfigController (e2e)** — Tests auth config management endpoints with the full AppModule.

## Key Test Cases

- `GET /auth-configs → findAll()` — Lists all auth configurations for the authenticated user.
- `GET /auth-configs/:moduleId → findOne()` — Retrieves a specific auth config by module ID.
- `PUT /auth-configs/:moduleId → save()` — Saves/updates an OAuth config for a module.
- `DELETE /auth-configs/:moduleId → remove()` — Deletes an auth config entry.
- `GET /auth-configs/admin/:userEmail → adminFindAll()` — Admin endpoint to list configs for a specific user.

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- Mocks request object with `user: { sub: 'test@test.com', role: 'admin' }`.
- Module fixture is closed in `afterAll`.
