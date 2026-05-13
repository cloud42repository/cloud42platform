# softvalue.controller.spec.ts

Unit test for the `SoftvalueController`, verifying that the controller is properly instantiated when provided with a mocked service.

## Test Suites

- **SoftvalueController** — Basic instantiation test with a mocked service.

## Key Test Cases

- `should be defined` — Confirms the controller is successfully created via the testing module.

## Test Setup

- Uses `Test.createTestingModule` with the controller and a partial mock of `SoftvalueService`.
- No actual service methods are mocked; only verifies DI wiring.
- Module is recompiled before each test via `beforeEach`.
