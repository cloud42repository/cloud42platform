# number-field.component.ts

A standalone Angular component that renders a numeric input field with placeholder support, disabled state, and data-source tag display. It emits the numeric value on user input.

## Key Exports

- **NumberFieldComponent** — Standalone component (`app-number-field`) that renders a styled `<input type="number">` with data-source binding indicator.

## Dependencies

- `@angular/core` — Component, Input, Output, EventEmitter
- `FormField` — Field configuration type from `form.types`
- `DataSourceTagComponent` — Displays the field's data source binding info

## How It Works

The component renders a number input element inside a styled container. The placeholder falls back through `field.placeholder`, `field.label`, and finally `'0'`. On input, it emits the `valueAsNumber` from the native input event via `inputChange`. Clicking the input emits `selectField` with the field ID to notify the parent of focus. A `DataSourceTagComponent` below shows any data-source binding. The component supports a `boundTableLabel` input for table-bound field display.
