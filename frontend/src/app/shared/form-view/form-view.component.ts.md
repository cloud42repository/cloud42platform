# form-view.component.ts

This component provides a reusable form view for executing mutation API endpoints (POST, PUT, PATCH, DELETE). It dynamically generates form fields from schema definitions, supports path/query parameters, typed body fields, raw JSON fallback, and an autocomplete overlay for workflow step output references.

## Key Exports

- **`FormViewComponent`** — Standalone Angular component for endpoint form submission (selector: `app-form-view`)
- **`StepRefSuggestion`** — Interface for autocomplete suggestions in workflow builder context (label, insertText, detail, typeHint)

## Template

The template renders:
- Card with method icon, endpoint label, method chip, and path template
- Form with:
  - Path parameter inputs (required, marked with red star)
  - Query parameter inputs
  - DTO-derived typed fields (select, textarea, text/number) or raw JSON textarea fallback
  - Autocomplete overlay for `{{steps.N.field}}` references
- Submit button (color-coded by method) with loading spinner
- Error message display
- Expandable response panel showing JSON result

## Dependencies

- `@angular/material` — Card, FormField, Input, Select, Button, ProgressSpinner, Icon, Chips, Expansion, Snackbar
- `ReactiveFormsModule` / `FormBuilder` / `FormGroup` — Reactive form construction
- `EndpointDef` / `extractPathParams` — Endpoint definitions and path param extraction
- `ApiService` — HTTP method calls (get, post, put, patch, delete)
- `SchemaService` / `FieldSchema` — Schema-driven form field generation

## How It Works

On init, the component extracts path parameters from the endpoint's path template, loads typed field schemas from `SchemaService`, and builds a reactive `FormGroup` with controls for all params and body fields. If `initialValues` are provided (e.g., from a selected row in list view), they're patched into the form. On submit, it separates path params, query params, and body fields, then calls the appropriate `ApiService` method. When `showSubmit` is false (embedded in workflow builder), it emits body value changes via `valuesChange` output. The autocomplete system activates when typing `{{` in any field, filtering step reference suggestions for workflow builder integration.
