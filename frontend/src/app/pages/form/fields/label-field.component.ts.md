# label-field.component.ts

A standalone Angular component that renders a read-only label/text display field. It shows a value or falls back to placeholder/label text from the field configuration.

## Key Exports

- **LabelFieldComponent** — Standalone component (`app-label-field`) that displays a non-editable text value with data-source tag.

## Dependencies

- `@angular/core` — Component, Input, Output, EventEmitter
- `FormField` — Field configuration type from `form.types`
- `DataSourceTagComponent` — Displays the field's data source binding info

## How It Works

The component renders a simple `<div>` displaying the current `value`, falling back to `field.placeholder`, then `field.label`, then the literal `'Label'`. Clicking the element emits `selectField` with the field ID. A `DataSourceTagComponent` is rendered below to indicate any data-source binding. This component has no editable input — it serves as a display-only label within the form builder.
