# zoho-people.controller.ts

NestJS REST controller that exposes Zoho People operations as HTTP endpoints under the `/zoho-people` route prefix. It handles employees, departments, leave management, attendance, custom forms, and OAuth lifecycle.

## Key Exports

- **ZohoPeopleController** — Controller class with REST endpoints for Zoho People HR operations and OAuth flows.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Delete, Param, Body, Query decorators
- `ZohoPeopleService` — Service layer handling Zoho People API interactions

## How It Works

The controller defines route handlers organized by resource:
1. **Employees** — CRUD operations (`GET/POST/DELETE /employees`)
2. **Departments** — List departments (`GET /departments`)
3. **Leave Types** — List available leave types (`GET /leave-types`)
4. **Leave Requests** — List, create, approve, and reject leave requests (`GET/POST /leave-requests`)
5. **Attendance** — List attendance records by employee with optional date range (`GET /attendance/:empId`)
6. **Forms** — Generic CRUD for custom form records (`GET/POST /forms/:formName/records`)
7. **OAuth** — Authorize URL, exchange grant code, and revoke endpoints

Each handler delegates to the corresponding service method.
