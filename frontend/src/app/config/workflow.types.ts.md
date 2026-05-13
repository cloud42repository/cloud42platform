# workflow.types.ts

This file defines the TypeScript type system for the workflow builder, including all workflow node types (API steps, control flow blocks, scripts, mappers, filters), execution logging, and the full workflow definition structure.

## Key Exports

- `PayloadSource` — Discriminated union for sourcing field values: hardcoded string or from a prior step's response
- `StepKind` — Type union of all node types: `'endpoint' | 'try-catch' | 'loop' | 'if-else' | 'mapper' | 'filter' | 'sub-workflow' | 'script' | 'notification'`
- `BodyMode` — Type union: `'fields' | 'text' | 'form'`
- `WorkflowStep` — Interface for an API-endpoint step with method, path, params, and body configuration
- `TryCatchBlock` — Interface for try/catch control flow with try and catch step arrays
- `LoopBlock` — Interface for loops (count-based or for-each over a prior step's array)
- `IfElseBlock` — Interface for conditional branching with condition config and then/else step arrays
- `MapperBlock` — Interface for transforming a step's response into a new payload via field mappings
- `FilterBlock` — Interface for filtering an array from a prior step using a condition
- `SubWorkflowBlock` — Interface for calling another workflow with input bindings
- `ScriptBlock` — Interface for running user-defined JavaScript with named input bindings
- `NotificationBlock` — Interface for creating notifications with configurable title, message, and target user
- `WorkflowNode` — Union type of all block/step types
- `WorkflowInput` / `WorkflowOutput` — Interfaces for named workflow parameters
- `WorkflowRunStepLog` / `WorkflowRunLog` — Interfaces for execution logging
- `Workflow` — Interface for the full workflow definition (id, name, inputs, outputs, steps, status, schedule, run log)

## Dependencies

- None (pure type definitions)

## How It Works

A `Workflow` contains an ordered array of `WorkflowNode` items representing a visual canvas of steps. Each node is discriminated by `kind`. API endpoint steps (`WorkflowStep`) configure HTTP calls with path/body parameters sourced from hardcoded values or prior step results. Control flow blocks (`TryCatchBlock`, `LoopBlock`, `IfElseBlock`) nest child steps. Data transformation blocks (`MapperBlock`, `FilterBlock`) process prior step outputs. `SubWorkflowBlock` enables workflow composition. `ScriptBlock` runs arbitrary JavaScript. Execution results are tracked in `WorkflowRunLog` with per-step timing, resolved parameters, and response/error data.
