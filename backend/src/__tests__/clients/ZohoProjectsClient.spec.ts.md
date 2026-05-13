# ZohoProjectsClient.spec.ts

Tests the `ZohoProjectsClient` class, verifying correct base URL, auth header injection, portal-based URL prefixing, and CRUD operations for projects, tasks, bugs, milestones, and time logs against the Zoho Projects REST API.

## Test Suites

- **ZohoProjectsClient** — Main suite covering authentication, portal-prefix URL logic, and all project management endpoints.

## Key Test Cases

- `uses the correct base URL` — Verifies base URL contains `projectsapi.zoho.com/restapi`
- `injects auth header` — Confirms `Zoho-oauthtoken` header is present
- `uses portal prefix when portalId is set` — Validates `/portal/:id/` prefix in URLs
- `omits portal prefix when portalId is not set` — Confirms direct paths without portal prefix
- `listProjects()` / `getProject()` / `createProject()` / `deleteProject()` — Project CRUD
- `listTasks()` / `createTask()` / `deleteTask()` — Task management per project
- `listBugs()` / `createBug()` — Bug tracking per project
- `listMilestones()` — Milestone listing per project
- `listTimeLogs()` — Time log retrieval per project

## Test Setup

- **beforeEach**: Creates a new `ZohoProjectsClient` with `PassthroughAuth` and a fixed portal ID; sets up `axios-mock-adapter`.
- **afterEach**: Restores the mock adapter.
- A `makeClient()` factory accepts optional `portalId` to test both prefixed and non-prefixed URL modes.
