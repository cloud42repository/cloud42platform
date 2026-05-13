# schema.service.ts

Loads and provides access to the dynamic field/column schema for API endpoints. Used by the form builder and data tables to render appropriate input fields and columns based on backend metadata.

## Key Exports

- **`FieldType`** — Type: `'text' | 'number' | 'email' | 'date' | 'textarea' | 'select'`.
- **`FieldOption`** — Interface for select field options (label, value).
- **`FieldSchema`** — Interface describing a form field (key, label, type, required, options, placeholder, rows).
- **`EndpointSchema`** — Interface containing optional `fields` and `columns` arrays.
- **`SchemaService`** — Injectable service with `load()`, `getFields()`, and `getColumns()` methods.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `@angular/common/http` — `HttpClient`
- `rxjs` — `Observable`, `tap`, `map`, `catchError`, `of`
- `../../environments/environment` — `environment.apiBase`

## How It Works

1. **`load()`** — Called by `APP_INITIALIZER` at startup. Fetches the full schema map from `/schema` (keyed by `apiPrefix` → `endpointId` → `EndpointSchema`) and caches it in memory.
2. **`getFields(apiPrefix, endpointId)`** — Returns the field definitions for a specific endpoint, or an empty array if not found.
3. **`getColumns(apiPrefix, endpointId)`** — Returns the column names for data table rendering.
4. On load failure, logs a warning and continues with an empty schema (graceful degradation).
