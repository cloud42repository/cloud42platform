# schema.ts

Single source of truth for API schema metadata describing form fields and table columns for every endpoint in the platform. Served to the frontend via `GET /schema` to dynamically render forms and data tables.

## Key Exports

- **`FieldType`** — Type union: `'text' | 'number' | 'email' | 'date' | 'textarea' | 'select'`.
- **`FieldOption`** — Interface for select dropdown options (`label`, `value`).
- **`FieldSchema`** — Interface describing a single form field (key, label, type, required, options, placeholder, rows).
- **`EndpointSchema`** — Interface with optional `fields` (for POST/PUT/PATCH forms) and `columns` (for GET list tables).
- **`SCHEMA`** — Constant `Record<string, Record<string, EndpointSchema>>` mapping `apiPrefix → endpointId → schema`.

## Dependencies

- None (pure TypeScript types and a const data object).

## How It Works

The `SCHEMA` object is organized by API prefix (e.g. `'/impossible-cloud'`, `'/zoho-books'`, `'/zoho-analytics'`). Each prefix contains endpoint IDs (e.g. `'create-storage-account'`, `'list-invoices'`) mapped to their schema definition. The frontend reads this at startup to dynamically generate form inputs for mutation endpoints and column headers for list endpoints, eliminating the need for hardcoded UI definitions per API.
