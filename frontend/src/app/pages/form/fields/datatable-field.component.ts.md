# datatable-field.component.ts

A standalone Angular component that renders a data table with column tags, a scrollable table grid, and row selection support. It displays tabular data from a field's data source with column headers and clickable rows.

## Key Exports

- **DatatableFieldComponent** — Standalone component (`app-datatable-field`) that renders a column tag preview and an interactive data table with row selection.

## Dependencies

- `@angular/core` — Component, Input, Output, EventEmitter
- `@angular/common` — CommonModule
- `@angular/material/icon` — MatIconModule
- `FormField` — Field configuration type from `form.types`
- `DataSourceTagComponent` — Displays the field's data source binding info
- `TranslatePipe` — i18n translation pipe

## How It Works

The component first renders a `DataSourceTagComponent` and a row of column tags parsed from `field.columns` (comma-separated). If no columns are configured, a "no columns" message is shown. When `field.lastData` is an array, it renders a full HTML table with sticky headers from the `columns` input and rows from the `rows` input. Each row is clickable and emits a `rowSelect` event containing the field, row index, and row data. The currently selected row is highlighted via a `row-selected` CSS class determined by comparing `selectedRow` input state.
