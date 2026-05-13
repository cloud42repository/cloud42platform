# zoho-payroll.controller.e2e-spec.ts

End-to-end test for the `ZohoPayrollController` that boots the full `AppModule` and exercises Zoho Payroll endpoints including Employees, Pay Components, Pay Runs (with approval), Payslips, and Declarations.

## Test Suites

- **ZohoPayrollController (e2e)** — full integration tests against Zoho Payroll endpoints

## Key Test Cases

- **Employees** — `listEmployees()`, `getEmployee()`, `createEmployee()`, `updateEmployee()`, `terminateEmployee()`
- **Pay Components** — `listPayComponents()`, `getPayComponent()`
- **Pay Runs** — `listPayRuns()`, `getPayRun()`, `createPayRun()`, `approvePayRun()`
- **Payslips** — `listPayslips()`, `getPayslip()`
- **Declarations** — `listDeclarations()`, `getDeclaration()`

## Test Setup

- Imports the full `AppModule` via `Test.createTestingModule`
- Controller is retrieved from the compiled module in `beforeAll`
- Module is closed in `afterAll` for cleanup
- Tests call controller methods directly with sample payroll data (employee names, pay periods, termination dates)
