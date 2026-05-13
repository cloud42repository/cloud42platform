# workflow-builder.component.ts

The Workflow Builder is a comprehensive visual editor for designing multi-step API orchestration workflows. It supports endpoint steps, control flow blocks (try-catch, loops, if-else, mapper, filter, sub-workflow, script, notification), input/output configuration, scheduling, and real-time execution with result logging.

## Key Exports

- **WorkflowBuilderComponent** — Standalone Angular component implementing the workflow design surface with step management, execution, sharing, and backend deployment.
- **AutocompleteSuggestion** (interface) — Shape for IntelliSense suggestions in expression fields.
- **EndpointRef** (interface) — Module + endpoint reference pair.
- **ControlFlowRef** (interface) — Control flow block type reference.

## Template

The template is organized into a top bar and a three-panel layout:

- **Top Bar** — Back button, workflow name input, schedule datetime field, save button, I/O config toggle, run/run-on-backend buttons, results toggle, and share button with URL chip.
- **I/O Configuration Panel** — Expandable section to define workflow inputs (name + default value) and outputs (name + source step + field path).
- **Browser Panel (left)** — Control flow items (try-catch, loop, if-else, mapper, filter, sub-workflow, script, notification) as draggable blocks, plus a searchable endpoint list grouped by modules — both draggable into the canvas.
- **Canvas (center)** — Displays the ordered step list with endpoint steps showing method/label/params and control flow blocks showing nested branch drop zones. Steps are draggable for reordering. Empty state prompts for drag interaction.
- **Config Panel (right)** — Opens when a step is selected. Configures endpoint params, body payload (key-value, JSON, or script), field mappings with autocomplete referencing previous step outputs, and control-flow-specific settings (loop source, conditions, mapper transforms).
- **Results Panel** — Collapsible execution log showing step-by-step success/failure with response data.

## Dependencies

- `@angular/core` (Component, OnInit, signal, computed, inject, ChangeDetectorRef)
- `@angular/cdk/drag-drop` (DragDropModule, moveItemInArray)
- Angular Material (Button, Icon, Input, FormField, Select, Tooltip, Chips, ProgressSpinner, SnackBar, Divider, Radio, ButtonToggle, Dialog)
- `WorkflowService` — CRUD and execution of workflows
- `ApiService` — Direct API calls for execution
- `ShareService` — Share URL generation
- `SchemaService` — Endpoint schema resolution
- `Workflow`, `WorkflowNode`, `WorkflowStep`, `TryCatchBlock`, `LoopBlock`, `IfElseBlock`, `MapperBlock`, `FilterBlock`, `SubWorkflowBlock`, `ScriptBlock`, `NotificationBlock` from `workflow.types`
- `MODULES`, `ModuleDef`, `EndpointDef`, `extractPathParams` from `endpoints`
- `getEndpointPayload`, `getEndpointInputSchema`, `getEndpointOutputSchema`, `flattenSchemaKeys` from config helpers
- `FormViewComponent`, `StepRefSuggestion` — Inline form view
- `TranslatePipe` — i18n
- `ScriptEditorDialogComponent` — Full-screen script editor

## How It Works

On init, the component loads an existing workflow by route ID or creates a new one. The browser panel provides both control-flow blocks and API endpoints as draggable sources. Dropping into the canvas creates steps — endpoint steps configure method, URL, params, and body with field mappings that reference previous step outputs using template syntax (`{{steps[0].response.data}}`). Control flow blocks contain nested branch drop zones for their child steps. The I/O panel defines workflow-level inputs (usable as `{{input.name}}`) and outputs that pull from specific step results. Execution (local or backend) iterates steps sequentially, resolving references and logging results. The schedule field allows deferred execution at a specific datetime. Sharing generates a public token URL.
