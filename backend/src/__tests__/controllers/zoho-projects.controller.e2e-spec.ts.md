# zoho-projects.controller.e2e-spec.ts

End-to-end test for the `ZohoProjectsController` that boots the full `AppModule` and exercises Zoho Projects endpoints including Projects, Tasks, Milestones, Bugs, and Time Logs.

## Test Suites

- **ZohoProjectsController (e2e)** — full integration tests against Zoho Projects endpoints

## Key Test Cases

- **Projects** — `listProjects()`, `getProject()`, `createProject()`, `updateProject()`, `deleteProject()`
- **Tasks** — `listTasks()`, `getTask()`, `createTask()`, `updateTask()`, `deleteTask()`
- **Milestones** — `listMilestones()`
- **Bugs** — `listBugs()`, `getBug()`, `createBug()`, `updateBug()`, `deleteBug()`
- **Time Logs** — `listTimeLogs()`, `addTimeLog()`, `deleteTimeLog()`

## Test Setup

- Imports the full `AppModule` via `Test.createTestingModule`
- Controller is retrieved from the compiled module in `beforeAll`
- Module is closed in `afterAll` for cleanup
- Tests call controller methods directly with sample project data (project names, task names, bug titles, time log hours)
