# application-list.component.ts

This component provides the application listing page, displaying all saved applications in a responsive card grid with metadata about pages, navigation style, and full CRUD operations including duplicate and import/export.

## Key Exports

- **ApplicationListComponent** — Standalone Angular component rendering the application collection with open, duplicate, export, import, and delete functionality.

## Template

- **Page Header** — Title with apps icon, import button, and "New Application" button.
- **Empty State** — Shown when no applications exist; includes icon, message, and create button.
- **Application Grid** — Responsive CSS grid of clickable cards, each showing:
  - Name and status chip (draft/published)
  - Optional description text
  - Metadata row (page count, navigation style, last updated)
  - Page pills showing first 5 pages with type-specific icons and colors (form=purple, dashboard=blue, workflow=amber)
  - Action buttons: Edit, Export, Duplicate, Delete

## Dependencies

- `@angular/core` (Component, inject)
- `@angular/router` (Router, RouterLink)
- Angular Material (Button, Icon, Tooltip)
- `ApplicationService` — Provides reactive `apps()` signal, CRUD, and `getById()` methods
- `ApplicationDefinition` from `application.types`
- `TranslatePipe` — i18n

## How It Works

The component injects `ApplicationService` and renders its reactive `apps()` signal. Clicking a card or its edit button navigates to the application builder. The `duplicate()` method clones the application with a new ID and "(copy)" suffix in draft status. Export serializes the definition (excluding timestamps and resolved pages) to a JSON download. Import reads and validates a JSON file, assigns a new ID and draft status, upserts it, then navigates to the builder. Delete removes via the service directly.
