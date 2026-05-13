# ZohoPeopleClient.ts

HTTP client class for the Zoho People API, extending the shared `ZohoBaseClient` with typed methods for employees, departments, leave management, attendance, and custom forms.

## Key Exports

- **ZohoPeopleConfig** — Configuration interface extending `ZohoCredentials` with optional `organizationId` and `apiBaseUrl`
- **ZohoPeopleClient** — Client class with methods for all Zoho People API endpoints

## Dependencies

- `ZohoBaseClient` from `../base/ZohoBaseClient` — Base HTTP client with authentication
- `ZohoCredentials` from `../base/types` — Base credential types
- DTO types from `./zoho-people.dto` — `PeopleEmployee`, `CreateEmployeeDTO`, `PeopleLeaveRequest`, etc.

## How It Works

1. **Constructor** — Accepts a `ZohoPeopleConfig`, defaulting the API base URL to `https://people.zoho.com/people/api`.
2. **Employees** — `listEmployees`, `getEmployee`, `addEmployee`, `updateEmployee`, `deleteEmployee` use the `/forms/employee/` endpoints with record-based operations.
3. **Departments** — `listDepartments` queries the topbar API.
4. **Leave Types** — `listLeaveTypes` uses `/leave/v2/leavetypes`.
5. **Leave Requests** — `listLeaveRequests`, `addLeaveRequest`, `approveLeave`, `rejectLeave` use the `/leave/v2/` endpoints.
6. **Attendance** — `listAttendance` fetches attendance records for an employee with optional date range.
7. **Forms (custom)** — `getFormRecords`, `addFormRecord`, `updateFormRecord` support generic custom form operations via `/forms/:formName/` endpoints.

All methods return Promises with untyped responses (`Promise<unknown>`) since Zoho People API responses vary by form configuration.
