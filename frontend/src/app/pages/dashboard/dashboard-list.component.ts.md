# dashboard-list.component.ts

This component provides the dashboard listing page, displaying all saved dashboards in a responsive card grid with metadata, widget previews, and actions for editing, exporting, importing, and deleting dashboards.

## Key Exports

- **DashboardListComponent** — Standalone Angular component that renders the dashboard collection with CRUD actions and import/export support.

## Template

- **Page Header** — Title with icon, import button (triggers hidden file input), and "New Dashboard" button linking to the builder.
- **Empty State** — Shown when no dashboards exist; includes an icon, message, and create button.
- **Dashboard Grid** — Responsive CSS grid of cards, each displaying:
  - Name and status chip (draft/published)
  - Metadata row (widget count, last updated date)
  - Widget pills showing the first 6 widget types with icons
  - Action buttons: Edit (navigates to builder), Export (JSON download), Delete (with confirmation)

## Dependencies

- `@angular/core` (Component, inject)
- `@angular/router` (Router, RouterLink)
- Angular Material (Button, Icon, Tooltip)
- `DashboardService` — Provides reactive `dashboards()` signal and CRUD methods
- `Dashboard` type from `dashboard.types`
- `TranslatePipe` / `TranslateService` — i18n support

## How It Works

The component injects `DashboardService` and accesses the reactive `dashboards()` signal directly in the template. The `delete()` method shows a confirm dialog then calls `svc.remove()`. The `exportItem()` method serializes a dashboard (excluding timestamps) to a JSON Blob and triggers a download. The `importFile()` method reads a JSON file, validates its `_type` field, assigns a new UUID and draft status, upserts it via the service, then navigates to the editor.
