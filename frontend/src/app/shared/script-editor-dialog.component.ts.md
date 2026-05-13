# script-editor-dialog.component.ts

This component provides a full-featured script editor dialog using Monaco Editor. It supports editing JavaScript/TypeScript scripts for various contexts (field data sources, onChange handlers, row select handlers, action scripts, workflow steps, dashboard scripts) with a built-in debug console, breakpoint support, and context-sensitive documentation panel.

## Key Exports

- **`ScriptEditorDialogComponent`** — Standalone Angular dialog component for script editing (selector: `app-script-editor-dialog`)
- **`ScriptEditorDialogData`** — Interface for dialog input data (code, title, mode, extraGlobals, onRun callback)
- **`ScriptDebugResult`** — Interface for debug execution results (logs, result, error, duration)

## Template

The template is structured as:
- **Header** — Title with code icon, action buttons (Run & Debug, Debug Console toggle, Help toggle, Close)
- **Editor content area** — Split layout:
  - **Main editor** — Monaco editor container with error fallback
  - **Debug console** (toggleable) — Shows log entries, return values, errors, execution timing, with clear button
- **Help panel** (toggleable) — Context-sensitive documentation:
  - Available globals table (varies by script mode)
  - API modules list (all available module names)
  - Mode-specific examples (data source, onChange, rowSelect, action, workflow, dashboard scripts)

## Dependencies

- `@angular/material` — Dialog (MAT_DIALOG_DATA, MatDialogRef), Button, Icon, Tooltip
- `monaco` — Monaco Editor (loaded dynamically, declared globally)
- `MODULES` / `extractPathParams` — API module names for documentation panel

## How It Works

On view init (`AfterViewInit`), the component initializes a Monaco Editor instance in the container element with the provided code and JavaScript language mode. The help panel dynamically shows relevant documentation based on the `mode` property (field-script, field-onChange, field-rowSelect, action-script, workflow-script, dashboard-script). When "Run & Debug" is clicked, it calls the `onRun` callback with the current editor content, then displays the results (logs, return value, errors, timing) in the debug console. The dialog returns the edited code on save or `undefined` on cancel.
