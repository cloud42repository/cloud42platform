# zoho-payroll.service.ts

Angular service providing an HTTP client for the Zoho Payroll API. Manages employees, pay components, pay runs, payslips, and declarations.

## Key Exports

- **ZohoPayrollService** — Injectable Angular service (root-provided) for Zoho Payroll operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-payroll'` and provides methods grouped by resource:

1. **Employees** — List, get, create, update employees; terminate an employee.
2. **Pay Components** — List and get salary/deduction components.
3. **Pay Runs** — List, get, create pay runs; approve a pay run.
4. **Payslips** — List payslips within a pay run; get individual payslip details.
5. **Declarations** — List and get employee tax declarations.
