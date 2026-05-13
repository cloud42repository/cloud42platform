# ZohoPayrollClient.ts

HTTP client class for the Zoho Payroll v1 API, extending the shared `ZohoBaseClient` with typed methods for employees, pay components, pay runs, payslips, and tax declarations.

## Key Exports

- **ZohoPayrollConfig** — Configuration interface extending `ZohoCredentials` with optional `organizationId` and `apiBaseUrl`
- **ZohoPayrollClient** — Client class with typed methods for all Zoho Payroll API endpoints

## Dependencies

- `ZohoBaseClient` from `../base/ZohoBaseClient` — Base HTTP client with authentication and request handling
- `ZohoCredentials` from `../base/types` — Base credential types
- DTO types from `./zoho-payroll.dto` — `PayrollEmployee`, `PayComponent`, `PayRun`, `Payslip`, `TaxDeclaration`, etc.

## How It Works

1. **Constructor** — Accepts a `ZohoPayrollConfig`, defaulting the API base URL to `https://payroll.zoho.com/api/v1`. If an `organizationId` is provided, it's set as a default query parameter on all requests.
2. **Employees** — `listEmployees`, `getEmployee`, `createEmployee`, `updateEmployee`, `terminateEmployee` map to `/employees` endpoints.
3. **Pay Components** — `listPayComponents`, `getPayComponent` map to `/paycomponents`.
4. **Pay Runs** — `listPayRuns`, `getPayRun`, `createPayRun`, `approvePayRun` map to `/payruns`.
5. **Payslips** — `listPayslips`, `getPayslip` are nested under `/payruns/:id/payslips`.
6. **Tax Declarations** — `listDeclarations`, `getDeclaration` map to `/declarations`.

All methods return typed Promises wrapping the Zoho API response structure.
