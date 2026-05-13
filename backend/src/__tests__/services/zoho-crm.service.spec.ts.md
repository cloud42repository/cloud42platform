# zoho-crm.service.spec.ts

Unit test for the `ZohoCrmService` class, verifying that the service can be instantiated via the NestJS testing module and that its default HTTP client is properly initialized.

## Test Suites

- **ZohoCrmService** — Validates service instantiation and client initialization.

## Key Test Cases

- `should be defined` — Confirms the service instance is successfully created.
- `should have a client instance` — Verifies the internal `defaultClient` property is initialized.

## Test Setup

Uses NestJS `Test.createTestingModule` with mocked `ConfigService` (returning `'test'` for all config values) and mocked `AuthConfigService` (returning `null` for `findOne`). The service is resolved from the compiled testing module before each test.
