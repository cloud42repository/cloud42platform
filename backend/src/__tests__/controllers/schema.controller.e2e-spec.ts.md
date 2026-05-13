# schema.controller.e2e-spec.ts

End-to-end test for the `SchemaController`, verifying that the schema endpoint returns the application's API schema as a defined object.

## Test Suites

- **SchemaController (e2e)** — Tests the schema retrieval endpoint with the full AppModule.

## Key Test Cases

- `GET /schema → getSchema()` — Confirms the schema is returned as a defined object.

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- No external mocks required; the controller method is synchronous.
- Module fixture is closed in `afterAll`.
