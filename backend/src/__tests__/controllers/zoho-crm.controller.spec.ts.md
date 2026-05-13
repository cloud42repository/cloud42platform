# zoho-crm.controller.spec.ts

Unit test for the `ZohoCrmController` verifying that the controller can be instantiated correctly through the NestJS testing module with a mocked `ZohoCrmService`.

## Test Suites

- **ZohoCrmController** — basic controller instantiation tests

## Key Test Cases

- `should be defined` — confirms the controller is properly instantiated

## Test Setup

- Uses `@nestjs/testing` `Test.createTestingModule` to compile a minimal module
- Provides a partial mock of `ZohoCrmService` (empty object) via `useValue`
- Controller is retrieved from the compiled module before each test
