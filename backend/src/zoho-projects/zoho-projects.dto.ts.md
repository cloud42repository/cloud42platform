# zoho-projects.dto.ts

TypeScript type definitions and interfaces for the Zoho Projects integration, covering projects, tasks, milestones, bugs, time logs, and list query parameters.

## Key Exports

- **ProjectStatus** — Type union: `"active" | "completed" | "archived"`
- **ProjectsProject** — Interface for a project record with owner, budget, billing type, and custom fields
- **CreateProjectDTO** — DTO for creating projects
- **UpdateProjectDTO** — Partial DTO for project updates
- **TaskStatus** — Type union: `"open" | "closed"`
- **TaskPriority** — Type union: `"none" | "low" | "medium" | "high"`
- **ProjectsTask** — Interface for a task with assignees, dates, and parent task support
- **CreateProjectTaskDTO** — DTO for creating tasks
- **UpdateProjectTaskDTO** — Partial DTO for task updates
- **ProjectsMilestone** — Interface for project milestones
- **BugSeverity** — Type union: `"critical" | "major" | "minor" | "trivial"`
- **ProjectsBug** — Interface for bug/issue records
- **CreateBugDTO** / **UpdateBugDTO** — DTOs for bug CRUD
- **ProjectsTimeLog** — Interface for time log entries
- **CreateTimeLogDTO** — DTO for adding time logs
- **ProjectsListParams** — Extended list params with status, search, sort column and order

## Dependencies

- `ZohoListParams` from `../shared/shared.dto`

## How It Works

Provides a comprehensive type model for Zoho Projects API entities. Interfaces capture the full structure of each resource including nested objects (owners, assignees). DTOs enforce required fields for creation while allowing partial updates. `ProjectsListParams` adds sorting and search capabilities on top of shared pagination.
