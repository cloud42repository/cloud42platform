# data-source-tag.component.ts

A standalone Angular component that displays a small informational tag indicating where a form field's data comes from — either a table binding, a script, or an API data source.

## Key Exports

- **DataSourceTagComponent** — Standalone component (`app-data-source-tag`) that renders a colored tag with an icon showing the field's data source type and details.

## Dependencies

- `@angular/core` — Component, Input
- `@angular/material/icon` — MatIconModule
- `FormField` — Field configuration type from `form.types`

## How It Works

The component uses conditional rendering to display one of three tag variants based on the field configuration:

1. **Table binding** — Shown when `field.boundFieldId` exists and the field kind is one of `label`, `text`, `number`, `boolean`, or `date`. Displays a table icon with the bound table label and column name.
2. **Script** — Shown when `field.dataSourceMode === 'script'`. Displays a code icon with optional detail text (the `valueField` for non-select/datatable fields).
3. **API** — Shown when `field.dataSource` exists. Displays a cloud icon with the module label and either the endpoint label (for select/datatable) or the value field name.

Computed getters (`showBinding`, `detailText`, `apiDetailText`) handle the logic for determining visibility and label content based on field kind.
