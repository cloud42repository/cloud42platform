/**
 * A payload source for a single field in a workflow step.
 * Either a hardcoded string value, or a value read from a previous step's JSON response.
 */
export type PayloadSource =
  | { type: 'hardcoded'; value: string }
  | { type: 'from-step'; stepId: string; field: string };

/** Discriminator for workflow canvas nodes */
export type StepKind = 'endpoint' | 'try-catch' | 'loop' | 'if-else';

/** A single API-endpoint step in the workflow */
export interface WorkflowStep {
  id: string;             // uuid
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

  /** Source config for each path parameter */
  paramSources: Record<string, PayloadSource>;

  /** Ordered body field keys to send */
  bodyKeys: string[];

  /** Source config for each body field */
  bodySources: Record<string, PayloadSource>;
}

/** Try / Catch control flow block */
export interface TryCatchBlock {
  id: string;
  kind: 'try-catch';
  label?: string;
  trySteps: WorkflowNode[];
  catchSteps: WorkflowNode[];
}

/** Loop control flow block — repeats body N times (or over an array from a prior step) */
export interface LoopBlock {
  id: string;
  kind: 'loop';
  label?: string;
  loopCount?: number;
  loopSourceStepId?: string;
  loopSourceField?: string;
  bodySteps: WorkflowNode[];
}

/** If / Else control flow block */
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

/** Any top-level canvas node (endpoint step or control-flow block) */
export type WorkflowNode = WorkflowStep | TryCatchBlock | LoopBlock | IfElseBlock;

export type WorkflowStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';

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
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowNode[];
  status: WorkflowStatus;
  /** Optional ISO datetime: scheduler fires the whole workflow at this time */
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastRunLog?: WorkflowRunLog;
}
