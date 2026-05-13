# zoho-expense.module.spec.ts

Tests the NestJS module metadata for `ZohoExpenseModule`, verifying that the module is properly defined and correctly registers its controller, service provider, and exports.

## Test Suites

- **ZohoExpenseModule** — Validates module definition and metadata registration for the Zoho Expense integration module.

## Key Test Cases

- `should be defined` — Confirms the module class exists.
- `should register ZohoExpenseController in controllers` — Verifies the controller is listed in module metadata.
- `should register ZohoExpenseService in providers` — Verifies the service is registered as a provider.
- `should export ZohoExpenseService` — Verifies the service is exported for use by other modules.

## Test Setup

No `beforeEach` or mocking is used. Tests directly inspect module metadata via `Reflect.getMetadata` using the `reflect-metadata` polyfill.
