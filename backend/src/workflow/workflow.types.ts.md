# workflow.types.ts

Type definitions for the workflow execution engine — mirrors the frontend workflow type system and defines all possible node kinds, their shapes, and the run-log structure.

## Key Exports

- **PayloadSource** — union type for resolving values (hardcoded or from a previous step)
- **StepKind** — string union of all node kinds (`'endpoint' | 'try-catch' | 'loop' | 'if-else' | 'mapper' | 'filter' | 'sub-workflow' | 'script' | 'notification'`)
- **BodyMode** — `'fields' | 'text' | 'form'`
- **WorkflowStep** — an API endpoint call step with method, path, params, and body configuration
- **TryCatchBlock** — try/catch control-flow block with `trySteps` and `catchSteps`
- **LoopBlock** — iteration block supporting `count` or `for-each` modes
- **IfElseBlock** — conditional branching block with configurable condition and then/else branches
- **MapperBlock** — transforms data by applying field mappings
- **FilterBlock** — filters an array from a step result by a field condition
- **SubWorkflowBlock** — executes another workflow by ID with input bindings
- **ScriptBlock** — runs user-defined JavaScript with bound inputs
- **NotificationBlock** — sends an in-app notification with configurable type, title, and message
- **WorkflowNode** — discriminated union of all block types
- **WorkflowInput** / **WorkflowOutput** — named input parameters and output definitions
- **WorkflowRunStepLog** — per-step execution log entry
- **WorkflowRunLog** — overall execution log with timing, steps, success flag, and outputs

## Dependencies

None (pure type definitions).

## How It Works

This file is a backend mirror of the frontend type definitions. The execution engine uses these types to safely destructure workflow step trees and dispatch each node to its handler. The `WorkflowNode` union enables exhaustive pattern matching in the execution switch. The run-log types capture full observability data for each execution.
