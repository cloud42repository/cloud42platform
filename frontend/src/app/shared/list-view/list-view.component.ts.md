# list-view.component.ts

This component provides a reusable data table view for GET API endpoints. It fetches data, extracts arrays from various API response envelopes (Zoho, custom), displays results in a paginated Material table with filtering, and optionally shows action forms when a row is selected.

## Key Exports

- **`ListViewComponent`** — Standalone Angular component for endpoint data display (selector: `app-list-view`)
- **`extractArray`** (module-level function) — Recursively finds the first array in a response object, checking common envelope keys (data, items, list, contacts, leads, etc.)

## Template

The template renders:
- Card with list icon, endpoint label, method chip, and path template
- Parameter form (path params + query params) with "Load" button in a styled container
- Filter input (appears when data is loaded)
- Loading spinner and error message states
- Material data table with:
  - Auto-detected or schema-configured columns
  - Sortable headers with pretty-printed column names
  - Row click selection (highlights row)
  - Paginator with page size options (10, 25, 50)
- Action panel (shown when row selected + actionEndpoints provided):
  - Header with selected row identifier
  - Embedded `FormViewComponent` instances for each action endpoint, pre-filled with mapped ID values
- Raw JSON fallback for non-array responses
- "No results" / "No data" empty states

## Dependencies

- `@angular/material` — Card, FormField, Input, Button, ProgressSpinner, Table, Icon, Chips, Tooltip, Expansion, Paginator
- `ReactiveFormsModule` / `FormBuilder` — Parameter form construction
- `EndpointDef` / `extractPathParams` — Endpoint config and path param parsing
- `FormViewComponent` — Embedded for action endpoints
- `ApiService` — Executes GET requests
- `SchemaService` — Provides column configuration per endpoint

## How It Works

On init, the component parses path parameters from the endpoint template, builds a form for them, and auto-loads data if no path params are required. The `load()` method calls `ApiService.get()`, then uses `extractArray()` to unwrap the response envelope into table rows. Columns are determined from `SchemaService` config or auto-detected from the first row (up to 8 columns). Client-side filtering matches any column value. Pagination is handled locally via signals. When a row is clicked, it's highlighted and an action panel appears (if `actionEndpoints` are provided), showing `FormViewComponent` instances pre-filled with ID values mapped from the selected row via `idMapping`.
