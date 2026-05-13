# text-field.component.ts

A standalone Angular component that renders a text input field with optional password masking and autocomplete proposals. It supports disabled state, placeholder text from field configuration, and emits value changes on user input or autocomplete selection.

## Key Exports

- **TextFieldComponent** — Standalone component (`app-text-field`) that renders a styled text input with Material autocomplete support and data-source tag display.

## Dependencies

- `@angular/core` — Component, Input, Output, EventEmitter
- `@angular/material/autocomplete` — MatAutocompleteModule for suggestion dropdown
- `FormField` — Field configuration type from `form.types`
- `DataSourceTagComponent` — Displays the field's data source binding info

## How It Works

The component renders an `<input>` element whose type switches between `text` and `password` based on `field.masked`. As the user types, `onInput()` emits the current value via `inputChange` and filters the `proposals` array to populate a Material autocomplete dropdown. When an autocomplete option is selected, `onOptionSelected()` emits that value. The `selectField` event fires on click to notify the parent which field is active. A `DataSourceTagComponent` is rendered below the input to show any bound data source.
