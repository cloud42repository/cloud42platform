/**
 * Workflow type definitions — backend mirror of frontend/src/app/config/workflow.types.ts.
 * Used by the backend execution engine.
 */

export type PayloadSource =
  | { type: 'hardcoded'; value: string }
  | { type: 'from-step'; stepId: string; field: string };

export type StepKind = 'endpoint' | 'try-catch' | 'loop' | 'if-else' | 'mapper' | 'filter' | 'sub-workflow' | 'script';

export type BodyMode = 'fields' | 'text' | 'form';

export interface WorkflowStep {
  id: string;
  kind: 'endpoint';
  moduleId: string;
  moduleLabel: string;
  moduleApiPrefix: string;
  endpointId: string;
  endpointLabel: string;
  method: string;
  pathTemplate: string;
  pathParamNames: string[];
  hasBody: boolean;
  paramSources: Record<string, PayloadSource>;
  bodyMode?: BodyMode;
  rawBody?: string;
  bodyKeys: string[];
  bodySources: Record<string, PayloadSource>;
}

export interface TryCatchBlock {
  id: string;
  kind: 'try-catch';
  label?: string;
  trySteps: WorkflowNode[];
  catchSteps: WorkflowNode[];
}

export type LoopMode = 'count' | 'for-each';

export interface LoopBlock {
  id: string;
  kind: 'loop';
  label?: string;
  loopMode?: LoopMode;
  loopCount?: number;
  loopSourceStepId?: string;
  loopSourceField?: string;
  bodySteps: WorkflowNode[];
}

export interface IfElseBlock {
  id: string;
  kind: 'if-else';
  label?: string;
  conditionStepId?: string;
  conditionField?: string;
  conditionOperator?: '==' | '!=' | '>' | '<' | 'contains';
  conditionValue?: string;
  thenSteps: WorkflowNode[];
  elseSteps: WorkflowNode[];
}

export interface FieldMapping {
  outputField: string;
  source: PayloadSource;
}

export interface MapperBlock {
  id: string;
  kind: 'mapper';
  label?: string;
  mappings: FieldMapping[];
}

export interface FilterBlock {
  id: string;
  kind: 'filter';
  label?: string;
  sourceStepId?: string;
  sourceField?: string;
  filterField?: string;
  filterOperator?: '==' | '!=' | '>' | '<' | 'contains';
  filterValue?: string;
}

export interface SubWorkflowBlock {
  id: string;
  kind: 'sub-workflow';
  label?: string;
  workflowId?: string;
  workflowName?: string;
  inputBindings: Record<string, PayloadSource>;
}

export interface ScriptBinding {
  name: string;
  source: PayloadSource;
}

export interface ScriptBlock {
  id: string;
  kind: 'script';
  label?: string;
  inputBindings: ScriptBinding[];
  code: string;
}

export interface WorkflowInput {
  name: string;
  defaultValue?: string;
}

export interface WorkflowOutput {
  name: string;
  source: PayloadSource;
}

export type WorkflowNode = WorkflowStep | TryCatchBlock | LoopBlock | IfElseBlock | MapperBlock | FilterBlock | SubWorkflowBlock | ScriptBlock;

export interface WorkflowRunStepLog {
  stepId: string;
  label: string;
  startedAt: string;
  finishedAt?: string;
  resolvedParams: Record<string, string>;
  resolvedBody?: Record<string, unknown>;
  response?: unknown;
  error?: string;
  success: boolean;
}

export interface WorkflowRunLog {
  startedAt: string;
  finishedAt?: string;
  steps: WorkflowRunStepLog[];
  success: boolean;
  error?: string;
  outputs?: Record<string, unknown>;
}
