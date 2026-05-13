# ZohoProjectsClient.ts

HTTP client class for the Zoho Projects REST API, extending the shared `ZohoBaseClient` with typed methods for projects, tasks, milestones, bugs, and time logs. Supports portal-scoped API paths.

## Key Exports

- **ZohoProjectsConfig** — Configuration interface extending `ZohoCredentials` with optional `portalId`, `organizationId`, and `apiBaseUrl`
- **ZohoProjectsClient** — Client class with methods for all Zoho Projects API endpoints

## Dependencies

- `ZohoBaseClient` from `../base/ZohoBaseClient` — Base HTTP client with authentication
- `ZohoCredentials` from `../base/types` — Base credential types
- DTO types from `./zoho-projects.dto` — `ProjectsProject`, `ProjectsTask`, `ProjectsMilestone`, `ProjectsBug`, `ProjectsTimeLog`, etc.

## How It Works

1. **Constructor** — Accepts a `ZohoProjectsConfig`, defaulting the API base URL to `https://projectsapi.zoho.com/restapi`. Stores the `portalId` for path scoping.
2. **Portal path** — `portalPath()` helper prepends `/portal/:portalId` to all API paths when a portal ID is configured.
3. **Projects** — `listProjects`, `getProject`, `createProject`, `updateProject`, `deleteProject` map to `/projects/` endpoints.
4. **Tasks** — `listTasks`, `getTask`, `createTask`, `updateTask`, `deleteTask` are nested under `/projects/:id/tasks/`.
5. **Milestones** — `listMilestones` fetches milestones for a project.
6. **Bugs** — Full CRUD via `/projects/:id/bugs/`.
7. **Timesheets** — `listTimeLogs`, `addTimeLog`, `deleteTimeLog` handle time tracking under tasks.

All methods return typed Promises wrapping the Zoho Projects API response structure.
