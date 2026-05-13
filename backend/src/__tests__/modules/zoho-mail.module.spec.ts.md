# zoho-mail.module.spec.ts

Tests the NestJS module metadata for `ZohoMailModule`, verifying that the module is properly defined and correctly registers its controller, service provider, and exports.

## Test Suites

- **ZohoMailModule** — Validates module definition and metadata registration for the Zoho Mail integration module.

## Key Test Cases

- `should be defined` — Confirms the module class exists.
- `should register ZohoMailController in controllers` — Verifies the controller is listed in module metadata.
- `should register ZohoMailService in providers` — Verifies the service is registered as a provider.
- `should export ZohoMailService` — Verifies the service is exported for use by other modules.

## Test Setup

No `beforeEach` or mocking is used. Tests directly inspect module metadata via `Reflect.getMetadata` using the `reflect-metadata` polyfill.
