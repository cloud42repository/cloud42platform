# boolean-field.component.ts

A standalone Angular component that renders a Material slide toggle for boolean/checkbox form fields with disabled state support and value change emission.

## Key Exports

- **BooleanFieldComponent** — Standalone component (`app-boolean-field`) that renders a Material slide toggle with a label.

## Dependencies

- `@angular/core` — Component, Input, Output, EventEmitter
- `@angular/material/slide-toggle` — MatSlideToggleModule for the toggle UI
- `FormField` — Field configuration type from `form.types`

## How It Works

The component renders a `<mat-slide-toggle>` inside a container div. The toggle's checked state is controlled by the `checked` input. When toggled, `valueChange` emits an object with the `fieldId` and new boolean `value`. Clicking the container emits `toggle` with the field ID to notify the parent of interaction. The label text is taken from `field.label` or defaults to `'Toggle'`. The component supports a disabled state that reduces opacity and blocks pointer events.
