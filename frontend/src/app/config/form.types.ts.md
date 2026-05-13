# form.types.ts

This file defines the TypeScript type system for the form builder feature, describing field types, data sources, submit actions, and the full form definition structure used for building and executing dynamic forms.

## Key Exports

- `FormFieldKind` — Type union of field types: `'label' | 'text' | 'number' | 'boolean' | 'date' | 'select' | 'datatable'`
- `FieldDataSourceMode` — Type union: `'api' | 'script'`
- `FormFieldDataSource` — Interface for API data source configuration on select/datatable fields
- `FormField` — Interface for a single form field with position, data source, bindings, scripts, and masking options
- `BodyMode` — Type union for body configuration: `'fields' | 'text' | 'form'`
- `ActionMode` — Type union: `'api' | 'script' | 'notification'`
- `BodyFieldSource` — Discriminated union for body field value sourcing (hardcoded or from form field)
- `FormSubmitAction` — Interface for form submit actions with API endpoint config, script code, or notification settings
- `FormStatus` — Type union: `'draft' | 'published'`
- `FormDefinition` — Interface for the full form definition (id, name, fields, submit actions, status, timestamps)

## Dependencies

- None (pure type definitions)

## How It Works

A `FormDefinition` contains arrays of `FormField` objects (positioned on a grid) and `FormSubmitAction` objects. Fields can fetch data from APIs or scripts for populating selects/datatables, and support change handlers (`onChangeScript`, `onRowSelectScript`) and field-to-field bindings (`boundFieldId`, `boundColumn`). Submit actions support three modes: calling an API endpoint with field-mapped or raw body, running a script, or sending a notification. The `BodyFieldSource` union allows each body field to come from a hardcoded value or a form field's current value.
