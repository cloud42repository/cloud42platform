# zoho-workdrive.controller.spec.ts

This unit test verifies that the `ZohoWorkdriveController` can be instantiated correctly through the NestJS testing module with a mocked `ZohoWorkdriveService` dependency.

## Test Suites

- **ZohoWorkdriveController** — Basic controller instantiation test

## Key Test Cases

- `should be defined` — Confirms the controller is successfully created and defined

## Test Setup

- Uses `@nestjs/testing` `Test.createTestingModule` to compile a minimal module
- Provides a partial mock of `ZohoWorkdriveService` (empty object) via `useValue`
- Controller is retrieved from the compiled module before each test
