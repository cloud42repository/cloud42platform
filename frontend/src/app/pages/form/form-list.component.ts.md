# form-list.component.ts

This component provides the form listing page, displaying all saved form definitions in a responsive card grid with metadata about fields, actions, and status, along with CRUD operations.

## Key Exports

- **FormListComponent** — Standalone Angular component that renders the form collection with edit, export, import, and delete functionality.

## Template

- **Page Header** — Title with icon, import button, and "New Form" button linking to the form builder.
- **Empty State** — Displayed when no forms exist; includes icon, message, and create button.
- **Form Grid** — Responsive CSS grid of cards, each displaying:
  - Name and status chip (draft/published)
  - Metadata row (field count, action count, last updated date)
  - Field pills showing first 6 fields with type-specific icons (text, date, select, datatable)
  - Action buttons: Edit (navigates to builder), Export (JSON download), Delete (with confirmation)

## Dependencies

- `@angular/core` (Component, inject, ViewChild, ElementRef)
- `@angular/router` (Router, RouterLink)
- Angular Material (Button, Icon, Tooltip)
- `FormService` — Provides reactive `forms()` signal and CRUD methods
- `FormDefinition` type from `form.types`
- `TranslatePipe` / `TranslateService` — i18n support

## How It Works

The component uses `FormService` to access the reactive `forms()` signal in the template. The `delete()` method confirms then calls `svc.remove()`. Export serializes the form definition (excluding timestamps) to JSON and downloads it. Import reads a JSON file, validates the `_type` field, creates a new entry with a fresh UUID and draft status, upserts it, then navigates to the builder for editing.
