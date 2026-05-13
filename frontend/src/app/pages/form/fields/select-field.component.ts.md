# select-field.component.ts

A standalone Angular component that renders a native HTML `<select>` dropdown with styled appearance, optional disabled state, and a preview of available options sourced from field data. It supports showing a truncated list of options with a "more" indicator.

## Key Exports

- **SelectFieldComponent** — Standalone component (`app-select-field`) that renders a styled native select element with option preview and data-source tag.

## Dependencies

- `@angular/core` — Component, Input, Output, EventEmitter
- `@angular/common` — CommonModule
- `@angular/material/icon` — MatIconModule
- `FormField` — Field configuration type from `form.types`
- `DataSourceTagComponent` — Displays the field's data source binding info

## How It Works

The component renders a native `<select>` element styled with a custom arrow indicator. Options are provided as an array of `{ display, value }` objects. When the user selects an option, `valueChange` emits the selected value. If `field.lastData` contains array data and options exist, a preview list of options is rendered below the dropdown showing display labels and values. When `totalCount` exceeds the visible options count, a "+N more" indicator is shown. The `isArray` helper method guards the preview rendering.
