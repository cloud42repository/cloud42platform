# index.ts

Barrel file that re-exports all field components from the `fields` directory, providing a single import point for consumers of the form field components.

## Key Exports

- **DataSourceTagComponent** — Tag component showing field data source info
- **LabelFieldComponent** — Read-only label display field
- **TextFieldComponent** — Text input field with autocomplete
- **NumberFieldComponent** — Numeric input field
- **BooleanFieldComponent** — Toggle/slide switch field
- **DateFieldComponent** — Date picker input field
- **SelectFieldComponent** — Dropdown select field
- **DatatableFieldComponent** — Table/grid data display field

## Dependencies

- Local component files in the same directory

## How It Works

This is a standard TypeScript barrel file. It re-exports each component from its respective source file, allowing other modules to import all field components from a single `./fields` path rather than importing each component individually.
