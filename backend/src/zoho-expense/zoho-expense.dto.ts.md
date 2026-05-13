# zoho-expense.dto.ts

TypeScript interfaces and type definitions for Zoho Expense API data structures, covering expense categories, expense records, expense reports, advances, and list query parameters.

## Key Exports

- `ExpenseCategory` — Interface for expense category objects
- `ExpenseStatus` — Union type for expense statuses (unsubmitted, submitted, approved, rejected, reimbursed)
- `Expense` — Interface for expense record objects
- `CreateExpenseRecordDTO` — DTO for creating an expense
- `UpdateExpenseRecordDTO` — Partial DTO for updating an expense
- `ReportStatus` — Union type for report statuses
- `ExpenseReport` — Interface for expense report objects
- `CreateExpenseReportDTO` — DTO for creating an expense report
- `UpdateExpenseReportDTO` — Partial DTO for updating a report
- `ExpenseAdvance` — Interface for advance payment objects
- `ExpenseListParams` — Query parameters for listing expenses (extends ZohoListParams)

## Dependencies

- `../shared/shared.dto` — `ZohoListParams` base interface for pagination/filtering

## How It Works

Defines the shape of all request/response data for the Zoho Expense module. DTOs use required fields for creation and `Partial<>` wrappers for updates. The `ExpenseListParams` interface extends the shared base to add expense-specific filters like status, employee_id, and date ranges.
