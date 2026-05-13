# zoho-people.service.ts

Angular service providing an HTTP client for the Zoho People HR API. Manages employees, departments, leave types, leave requests, attendance tracking, and custom form records.

## Key Exports

- **ZohoPeopleService** — Injectable Angular service (root-provided) for Zoho People operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-people'` and provides methods grouped by resource:

1. **Employees** — List, get, add, update, delete employee records.
2. **Departments** — List all departments.
3. **Leave Types** — List available leave types.
4. **Leave Requests** — List leave requests, add a new request, approve or reject.
5. **Attendance** — List attendance records for an employee with query filters.
6. **Forms** — Get records from a named form, add a new record, update an existing record.
