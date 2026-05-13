# zoho-books.service.spec.ts

Tests the instantiation and basic setup of `ZohoBooksService`, verifying that it can be created via the NestJS dependency injection container and that its internal HTTP client is initialized.

## Test Suites

- **ZohoBooksService** — Validates service creation and default client initialization for the Zoho Books integration.

## Key Test Cases

- `should be defined` — Confirms the service instance is successfully created.
- `should have a client instance` — Verifies the internal `defaultClient` property is initialized.

## Test Setup

A `beforeEach` block creates a NestJS `TestingModule` with:
- `ZohoBooksService` as the service under test.
- A mocked `ConfigService` returning `'test'` for all `get`/`getOrThrow` calls.
- A mocked `AuthConfigService` with `findOne` resolving to `null`.
