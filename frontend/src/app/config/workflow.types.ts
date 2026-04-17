/**
 * A payload source for a single field in a workflow step.
 * Either a hardcoded string value, or a value read from a previous step's JSON response.
 */
export type PayloadSource =
  | { type: 'hardcoded'; value: string }
  | { type: 'from-step'; stepId: string; field: string };

/** Discriminator for workflow canvas nodes */
export type StepKind = 'endpoint' | 'try-catch' | 'loop' | 'if-else' | 'mapper' | 'filter' | 'sub-workflow' | 'script';

/** How the request body is configured for a POST / PUT / PATCH step */
export type BodyMode = 'fields' | 'text' | 'form';

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

  /** How body is configured: per-field, raw text/JSON, or via FormView (default: 'fields') */
  bodyMode?: BodyMode;

  /** Raw JSON body string (used when bodyMode === 'text' or 'form') */
  rawBody?: string;

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

export type LoopMode = 'count' | 'for-each';

/** Loop control flow block — repeats body N times OR iterates over an array from a prior step */
export interface LoopBlock {
  id: string;
  kind: 'loop';
  label?: string;
  /** 'count' = repeat N times, 'for-each' = iterate over response array */
  loopMode?: LoopMode;
  loopCount?: number;
  /** (for-each) Step whose response contains the array */
  loopSourceStepId?: string;
  /** (for-each) Dot-notation path to the array inside the response */
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

/** Field mapping: read a value from a source step and write it to a named output field */
export interface FieldMapping {
  /** Output field name in the produced payload (e.g. "contact_name") */
  outputField: string;
  /** Where to read the value from */
  source: PayloadSource;
}

/**
 * Mapper block — transforms a previous step's response into a new payload.
 * Each mapping reads a field from a source step and writes it under a new key.
 * The assembled object is stored as this block's result so later POST/PUT/PATCH
 * steps can reference it via "from-step".
 */
export interface MapperBlock {
  id: string;
  kind: 'mapper';
  label?: string;
  mappings: FieldMapping[];
}

/**
 * Filter block — takes an array from a previous step's response,
 * evaluates a condition on each element's field, and stores the
 * matching elements as the block result.
 */
export interface FilterBlock {
  id: string;
  kind: 'filter';
  label?: string;
  /** Step whose response contains the source array */
  sourceStepId?: string;
  /** Dot-notation path to the array inside the response (empty = root) */
  sourceField?: string;
  /** Field on each element to test */
  filterField?: string;
  /** Comparison operator */
  filterOperator?: '==' | '!=' | '>' | '<' | 'contains';
  /** Value to compare against */
  filterValue?: string;
}

/**
 * Sub-workflow block — calls another workflow, binding inputs from the
 * current execution context and collecting outputs as the block result.
 */
export interface SubWorkflowBlock {
  id: string;
  kind: 'sub-workflow';
  label?: string;
  /** ID of the workflow to call */
  workflowId?: string;
  /** Display name of the target workflow (cached for UI) */
  workflowName?: string;
  /** Map: target workflow input name → PayloadSource in current context */
  inputBindings: Record<string, PayloadSource>;
}

/** Named input binding for a script block */
export interface ScriptBinding {
  /** Variable name accessible inside the script (e.g. "contact") */
  name: string;
  /** Where the value comes from */
  source: PayloadSource;
}

/**
 * Script block — runs user-defined JavaScript code.
 * Input bindings are injected as variables; the script must return a value
 * which becomes the block's result for downstream steps.
 */
export interface ScriptBlock {
  id: string;
  kind: 'script';
  label?: string;
  /** Named input bindings — each becomes a variable in the script scope */
  inputBindings: ScriptBinding[];
  /** JavaScript code to execute. Must return a value. */
  code: string;
}

/** A named input parameter that a workflow accepts */
export interface WorkflowInput {
  name: string;
  /** Optional default value when not provided */
  defaultValue?: string;
}

/** A named output that a workflow returns at end */
export interface WorkflowOutput {
  name: string;
  /** Source: 'from-step' reads from a step's response */
  source: PayloadSource;
}

/** Any top-level canvas node (endpoint step or control-flow block) */
export type WorkflowNode = WorkflowStep | TryCatchBlock | LoopBlock | IfElseBlock | MapperBlock | FilterBlock | SubWorkflowBlock | ScriptBlock;

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
  /** Named input parameters this workflow accepts */
  inputs?: WorkflowInput[];
  /** Named outputs this workflow returns after execution */
  outputs?: WorkflowOutput[];
  steps: WorkflowNode[];
  status: WorkflowStatus;
  /** Optional ISO datetime: scheduler fires the whole workflow at this time */
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastRunLog?: WorkflowRunLog;
}
