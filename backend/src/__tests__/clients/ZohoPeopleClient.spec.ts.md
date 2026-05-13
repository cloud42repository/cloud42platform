# ZohoPeopleClient.spec.ts

Tests the `ZohoPeopleClient` class, verifying correct base URL, auth header injection, and operations for employees, departments, leave management, attendance tracking, and custom form records against the Zoho People API.

## Test Suites

- **ZohoPeopleClient** — Main suite covering authentication, URL configuration, and all HR resource endpoints.

## Key Test Cases

- `uses the correct base URL` — Verifies base URL contains `people.zoho.com/people/api`
- `injects auth header` — Confirms `Zoho-oauthtoken` header is set
- `listEmployees()` / `getEmployee()` / `addEmployee()` / `updateEmployee()` / `deleteEmployee()` — Full employee lifecycle via form-based API
- `listDepartments()` — Department listing endpoint
- `listLeaveTypes()` / `listLeaveRequests()` / `addLeaveRequest()` — Leave management
- `approveLeave()` / `rejectLeave()` — Leave status updates with comments
- `listAttendance()` — Attendance retrieval by employee ID
- `getFormRecords()` — Custom form record retrieval

## Test Setup

- **beforeEach**: Creates a new `ZohoPeopleClient` instance with `PassthroughAuth` and initializes `axios-mock-adapter`.
- **afterEach**: Restores the mock adapter.
