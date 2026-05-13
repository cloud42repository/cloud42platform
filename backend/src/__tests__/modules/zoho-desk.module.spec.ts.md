# zoho-desk.module.spec.ts

Tests the `ZohoDeskModule` NestJS module definition, verifying that the module is properly defined and correctly registers its controller, service provider, and exports using reflection metadata.

## Test Suites

- **ZohoDeskModule** — Validates module metadata for controllers, providers, and exports.

## Key Test Cases

- `should be defined` — Confirms the module class exists
- `should register ZohoDeskController in controllers` — Verifies controller is declared in module metadata
- `should register ZohoDeskService in providers` — Verifies service is listed as a provider
- `should export ZohoDeskService` — Verifies service is exported for use by other modules

## Test Setup

- Imports `reflect-metadata` to enable decorator metadata inspection.
- Uses `Reflect.getMetadata()` to read NestJS module decorator metadata (controllers, providers, exports) directly from the module class.
