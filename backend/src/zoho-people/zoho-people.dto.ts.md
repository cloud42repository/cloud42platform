# zoho-people.dto.ts

TypeScript type definitions and interfaces for the Zoho People integration, covering employees, departments, leave types, leave requests, attendance, custom forms, and list query parameters.

## Key Exports

- **EmployeeStatus** — Type union: `"active" | "inactive" | "terminated"`
- **PeopleEmployee** — Interface representing an HR employee record (with dynamic fields via index signature)
- **CreateEmployeeDTO** — DTO for creating employees (required: FirstName, LastName, Email)
- **UpdateEmployeeDTO** — Partial DTO for employee updates
- **PeopleDepartment** — Interface for department records
- **PeopleLeaveType** — Interface for leave type definitions (days/hours units)
- **LeaveStatus** — Type union: `"Pending" | "Approved" | "Rejected" | "Cancelled"`
- **PeopleLeaveRequest** — Interface for leave request records
- **CreateLeaveRequestDTO** — DTO for creating leave requests
- **PeopleAttendance** — Interface for attendance log entries
- **PeopleForm** — Interface for custom form metadata with field definitions
- **PeopleListParams** — Extended list params with status, search, and modified time filters

## Dependencies

- `ZohoListParams` from `../shared/shared.dto`

## How It Works

Provides a complete type model for all Zoho People API resources. The `PeopleEmployee` interface uses an index signature to allow arbitrary custom fields. DTOs enforce required fields for creation, and `PeopleListParams` extends shared pagination with People-specific filters like `searchColumn`, `searchValue`, and `modifiedTime`.
