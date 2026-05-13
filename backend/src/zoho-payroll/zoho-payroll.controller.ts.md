# zoho-payroll.controller.ts

NestJS REST controller that exposes Zoho Payroll operations as HTTP endpoints under the `/zoho-payroll` route prefix. It handles employees, pay components, pay runs, payslips, declarations, and OAuth lifecycle endpoints, delegating all business logic to `ZohoPayrollService`.

## Key Exports

- **ZohoPayrollController** — Controller class with REST endpoints for Zoho Payroll CRUD operations and OAuth flows.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Put, Param, Body, Query decorators
- `ZohoPayrollService` — Service layer handling Zoho Payroll API interactions

## How It Works

The controller defines route handlers organized by resource:
1. **Employees** — CRUD operations plus termination (`GET/POST/PUT /employees`, `POST /employees/:id/terminate`)
2. **Pay Components** — List and get (`GET /pay-components`)
3. **Pay Runs** — CRUD plus approval (`GET/POST /payruns`, `POST /payruns/:id/approve`)
4. **Payslips** — List and get within a pay run (`GET /payruns/:payRunId/payslips`)
5. **Declarations** — List and get tax declarations (`GET /declarations`)
6. **OAuth** — Authorize URL, exchange grant code, and revoke endpoints

Each handler simply delegates to the corresponding service method, passing through path params, query params, and request bodies.
