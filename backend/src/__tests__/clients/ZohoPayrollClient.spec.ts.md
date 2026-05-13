# ZohoPayrollClient.spec.ts

Tests the `ZohoPayrollClient` class, verifying correct base URL, organization ID injection, and CRUD operations for employees, pay components, pay runs, payslips, and tax declarations against the Zoho Payroll API v1.

## Test Suites

- **ZohoPayrollClient** — Main suite covering URL validation, org parameter injection, and all payroll resource endpoints.

## Key Test Cases

- `uses the correct base URL` — Verifies base URL contains `payroll.zoho.com/api/v1`
- `appends organization_id when provided` — Ensures org ID is added as query parameter
- `listEmployees()` / `getEmployee()` / `createEmployee()` / `updateEmployee()` — Employee CRUD
- `terminateEmployee()` — Validates termination date is sent in POST body
- `listPayComponents()` / `getPayComponent()` — Pay component retrieval
- `listPayRuns()` / `createPayRun()` / `approvePayRun()` — Pay run lifecycle including approval
- `listPayslips()` / `getPayslip()` — Payslip retrieval per pay run
- `listDeclarations()` — Tax declaration listing

## Test Setup

- **beforeEach**: Creates a new `ZohoPayrollClient` instance with `PassthroughAuth` and a fixed organization ID; sets up `axios-mock-adapter`.
- **afterEach**: Restores the mock adapter.
