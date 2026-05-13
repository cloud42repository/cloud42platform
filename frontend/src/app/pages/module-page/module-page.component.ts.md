# module-page.component.ts

This component renders the detail page for any API module in the platform. It provides a two-panel layout with endpoint navigation on the left and the active endpoint's data view (list or form) on the right. It supports both GET endpoints (rendered as data tables via `ListViewComponent`) and mutation endpoints (rendered as forms via `FormViewComponent`).

## Key Exports

- **`ModulePageComponent`** — Standalone Angular component for displaying a module's endpoints (selector: `app-module-page`)

## Template

The template includes:
- Module header with icon, label, and API prefix
- Two-panel layout:
  - **Left nav** — Endpoint buttons grouped by "Views" (GET) and "Actions" (POST/PUT/PATCH/DELETE) with method badges
  - **Right content** — Dynamically renders `app-list-view` for GET endpoints or `app-form-view` for mutation endpoints
- Empty state when no module is found

## Dependencies

- `@angular/core` — Component, OnInit, inject, signal
- `@angular/router` — ActivatedRoute (reads `moduleId` from route data)
- `@angular/material` — Icon, Divider, Button, Tooltip
- `EndpointDef` / `ModuleDef` / `MODULE_MAP` — Module and endpoint type definitions and lookup map
- `ListViewComponent` — Reusable list/table component for GET endpoints
- `FormViewComponent` — Reusable form component for mutation endpoints

## How It Works

On init, the component reads the `moduleId` from the route's data, looks up the module in `MODULE_MAP`, then splits its endpoints into GET (views) and non-GET (actions). The first endpoint is auto-selected. When the user clicks an endpoint in the left nav, the right panel switches between `ListViewComponent` (for GET) and `FormViewComponent` (for mutations). The component also provides action endpoint mappings (`getListActionEndpoints`) and ID field mappings (`getIdMapping`) so that selecting a row in a list view can pre-fill related action forms (e.g., selecting a storage account enables patch/delete actions).
