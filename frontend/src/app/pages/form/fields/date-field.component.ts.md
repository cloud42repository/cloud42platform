# date-field.component.ts

A standalone Angular component that renders a native HTML date input field with disabled state support and data-source tag display.

## Key Exports

- **DateFieldComponent** — Standalone component (`app-date-field`) that renders a styled `<input type="date">` with data-source binding indicator.

## Dependencies

- `@angular/core` — Component, Input, Output, EventEmitter
- `FormField` — Field configuration type from `form.types`
- `DataSourceTagComponent` — Displays the field's data source binding info

## How It Works

The component renders a date input element inside a styled container. On value change, it emits the string value via `inputChange`. Clicking the input emits `selectField` with the field ID to signal the parent which field is active. The component accepts a `boundTableLabel` for display when the field is bound to a data table. A `DataSourceTagComponent` below the input shows any configured data-source binding (table, script, or API).
