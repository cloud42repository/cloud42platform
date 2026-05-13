# form-builder.component.ts

The Form Builder is a drag-and-drop visual editor for designing form definitions. It supports configuring form fields, submit actions (API calls or scripts), data sources for dynamic selects, and provides a live preview mode with field rendering components.

## Key Exports

- **FormBuilderComponent** — Standalone Angular component implementing the form design surface with field management, submit action configuration, endpoint browsing, and sharing.

## Template

The template uses a `cdkDropListGroup` layout with three panels:

- **Browser Panel (left)** — Contains draggable field type items (label, text, number, boolean, date, select, datatable), a list of configured submit actions with add/remove controls, a searchable API endpoint browser grouped by module.
- **Canvas (center)** — Toolbar with navigation, name input, save/preview/share/export buttons. Below is the form canvas where fields are dropped and reordered. In preview mode, actual field components render with live interaction.
- **Config Panel (right)** — Opens when a field or action is selected. For fields: label, placeholder, width, required flag, validation, and data source (for select/datatable). For actions: endpoint selection, method, path/query params, body mapping, and script mode.

## Dependencies

- `@angular/core` (Component, signal, computed, OnInit, inject)
- `@angular/cdk/drag-drop` (CdkDrag, CdkDropList, CdkDropListGroup, etc.)
- Angular Material (Button, Icon, FormField, Input, Select, Tooltip, Divider, Checkbox, SlideToggle, ProgressSpinner, Dialog, SnackBar)
- `FormService` — CRUD operations for form definitions
- `ShareService` — Sharing functionality
- `ApiService` — API calls for testing actions
- `UserManagementService` — User list for sharing
- `FormDefinition`, `FormField`, `FormFieldKind`, `FormSubmitAction` from `form.types`
- `MODULES`, `EndpointDef` from `endpoints` config
- `getEndpointPayload`, `getEndpointInputSchema` — Schema helpers
- `TranslatePipe` — i18n
- `ScriptEditorDialogComponent` — Script editing dialog
- `NotificationService` — Toast notifications
- Field components: `LabelFieldComponent`, `TextFieldComponent`, `NumberFieldComponent`, `BooleanFieldComponent`, `DateFieldComponent`, `SelectFieldComponent`, `DatatableFieldComponent`

## How It Works

On init, the component loads an existing form by route ID or initializes a new one. Users drag field types from the browser to the canvas to add fields, which can be reordered via drag-and-drop. Selecting a field opens the config panel for editing properties. Submit actions define what happens on form submission — each action targets an API endpoint or runs a script, with body field mappings sourced from form field values. The endpoint browser allows exploring available API modules and selecting endpoints for both field data sources and submit actions. Preview mode renders actual field components and allows testing form interactions. Save persists the form definition via `FormService`.
