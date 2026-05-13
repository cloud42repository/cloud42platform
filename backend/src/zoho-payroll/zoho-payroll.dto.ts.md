# zoho-payroll.dto.ts

TypeScript type definitions and interfaces for the Zoho Payroll integration, covering employees, bank accounts, pay components, pay runs, payslips, tax declarations, and list query parameters.

## Key Exports

- **PayrollEmployeeStatus** — Type union: `"active" | "inactive" | "terminated"`
- **PayrollEmployee** — Interface representing a payroll employee record
- **CreatePayrollEmployeeDTO** — DTO for creating a new employee
- **UpdatePayrollEmployeeDTO** — Partial DTO for updating employee fields
- **PayrollBankAccount** — Interface for employee bank account details
- **ComponentType** — Type union: `"earnings" | "deductions" | "taxes"`
- **PayComponent** — Interface for a pay component (earnings/deductions/taxes)
- **PayRunStatus** — Type union: `"draft" | "approved" | "paid" | "cancelled"`
- **PayRun** — Interface representing a pay run
- **CreatePayRunDTO** — DTO for creating a pay run
- **Payslip** — Interface representing an individual payslip
- **TaxDeclaration** — Interface for employee tax declarations
- **PayrollListParams** — Extended list params with status, department, and employment type filters

## Dependencies

- `ZohoAddress`, `ZohoListParams` from `../shared/shared.dto`

## How It Works

Provides a complete type model for all Zoho Payroll API resources. Interfaces mirror the Zoho Payroll v1 API response shapes, and DTO types enforce required fields for creation while allowing partial updates. `PayrollListParams` extends the shared `ZohoListParams` with payroll-specific filter options.
