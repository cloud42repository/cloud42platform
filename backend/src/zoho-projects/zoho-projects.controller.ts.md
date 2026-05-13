# zoho-projects.controller.ts

NestJS REST controller that exposes Zoho Projects operations as HTTP endpoints under the `/zoho-projects` route prefix. It handles projects, tasks, milestones, bugs, time logs, and OAuth lifecycle.

## Key Exports

- **ZohoProjectsController** — Controller class with REST endpoints for Zoho Projects CRUD operations and OAuth flows.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Delete, Param, Body, Query decorators
- `ZohoProjectsService` — Service layer handling Zoho Projects API interactions

## How It Works

The controller defines route handlers organized by resource:
1. **Projects** — CRUD operations (`GET/POST/DELETE /projects`)
2. **Tasks** — CRUD nested under projects (`GET/POST/DELETE /projects/:projectId/tasks`)
3. **Milestones** — List milestones within a project (`GET /projects/:projectId/milestones`)
4. **Bugs** — CRUD nested under projects (`GET/POST/DELETE /projects/:projectId/bugs`)
5. **Time Logs** — List project logs, add/delete task-level logs (`GET /projects/:projectId/timelogs`, `POST/DELETE /projects/:projectId/tasks/:taskId/timelogs`)
6. **OAuth** — Authorize URL, exchange grant code, and revoke endpoints

Each handler delegates to the corresponding service method, passing path params, query params, and bodies.
