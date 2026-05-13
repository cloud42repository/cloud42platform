# zoho-mail.controller.spec.ts

Unit test for the `ZohoMailController` verifying that the controller can be instantiated correctly through the NestJS testing module with a mocked `ZohoMailService`.

## Test Suites

- **ZohoMailController** — basic controller instantiation tests

## Key Test Cases

- `should be defined` — confirms the controller is properly instantiated

## Test Setup

- Uses `@nestjs/testing` `Test.createTestingModule` to compile a minimal module
- Provides a partial mock of `ZohoMailService` (empty object) via `useValue`
- Controller is retrieved from the compiled module before each test
