# zoho-people.controller.e2e-spec.ts

End-to-end test for the `ZohoPeopleController` that boots the full `AppModule` and exercises Zoho People endpoints including Employees, Departments, Leave management (types, requests, approve/reject), Attendance, and Forms.

## Test Suites

- **ZohoPeopleController (e2e)** — full integration tests against Zoho People endpoints

## Key Test Cases

- **Employees** — `listEmployees()`, `getEmployee()`, `addEmployee()`, `updateEmployee()`, `deleteEmployee()`
- **Departments** — `listDepartments()`
- **Leave** — `listLeaveTypes()`, `listLeaveRequests()`, `addLeaveRequest()`, `approveLeave()`, `rejectLeave()`
- **Attendance** — `listAttendance()` (by employee ID and date range)
- **Forms** — `getFormRecords()`, `addFormRecord()`, `updateFormRecord()`

## Test Setup

- Imports the full `AppModule` via `Test.createTestingModule`
- Controller is retrieved from the compiled module in `beforeAll`
- Module is closed in `afterAll` for cleanup
- Tests call controller methods directly with sample HR data (employee names, leave types, date ranges, form names)
