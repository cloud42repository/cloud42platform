# zoho-projects.service.ts

Angular service providing an HTTP client for the Zoho Projects API. Manages projects, tasks, milestones, bugs, and time logs.

## Key Exports

- **ZohoProjectsService** — Injectable Angular service (root-provided) for Zoho Projects operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-projects'` and provides methods grouped by resource:

1. **Projects** — List, get, create, update, delete projects.
2. **Tasks** — List, get, create, update, delete tasks within a project.
3. **Milestones** — List milestones for a project.
4. **Bugs** — List, get, create, update, delete bugs within a project.
5. **Time Logs** — List time logs for a project; add a time log to a task; delete a time log.
