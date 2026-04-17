import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { UserManagementService } from './user-management.service';
import {
  Workflow, WorkflowNode, WorkflowStep, WorkflowStatus,
  TryCatchBlock, LoopBlock, IfElseBlock, MapperBlock, FilterBlock,
  SubWorkflowBlock, WorkflowInput, WorkflowOutput,
  WorkflowRunLog, WorkflowRunStepLog, PayloadSource,
} from '../config/workflow.types';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private readonly api = inject(ApiService);
  private readonly userMgmt = inject(UserManagementService);
  private readonly STORAGE_KEY = 'cloud42_workflows';
  private readonly API_PREFIX = '/workflows';

  private readonly _workflows = signal<Workflow[]>([]);
  readonly workflows = this._workflows.asReadonly();

  constructor() {
    // Load workflows from backend API outside constructor to satisfy async rules
    queueMicrotask(() => this.loadFromApi());
    // Poll every 30 seconds to fire scheduled workflows
    setInterval(() => this.checkScheduled(), 30_000);
  }

  // ── Backend API ─────────────────────────────────────────────────────────────

  /** Fetch all workflows for the current user from the backend */
  async loadFromApi(): Promise<void> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    try {
      const res = await firstValueFrom(
        this.api.get(this.API_PREFIX, '', {}, { userEmail: email })
      );
      const apiWorkflows = (res as Record<string, unknown>[]).map(w => this.mapFromApi(w));
      if (apiWorkflows.length > 0) {
        this._workflows.set(apiWorkflows);
      }
    } catch (err) {
      console.warn('Failed to load workflows from API, using local cache', err);
    }
  }

  /** Create a workflow on the backend */
  private async createOnApi(workflow: Workflow): Promise<void> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    try {
      await firstValueFrom(
        this.api.post(this.API_PREFIX, '', {}, {
          id: workflow.id,
          userEmail: email,
          name: workflow.name,
          description: workflow.description ?? '',
          steps: workflow.steps,
          inputs: workflow.inputs ?? [],
          outputs: workflow.outputs ?? [],
          status: workflow.status,
          scheduledAt: workflow.scheduledAt,
        })
      );
    } catch (err) {
      console.warn('Failed to create workflow on API', err);
    }
  }

  /** Update a workflow on the backend */
  private async updateOnApi(workflow: Workflow): Promise<void> {
    try {
      await firstValueFrom(
        this.api.put(this.API_PREFIX, '/:id', { id: workflow.id }, {
          name: workflow.name,
          description: workflow.description ?? '',
          steps: workflow.steps,
          inputs: workflow.inputs ?? [],
          outputs: workflow.outputs ?? [],
          status: workflow.status,
          scheduledAt: workflow.scheduledAt,
          lastRunLog: workflow.lastRunLog,
        })
      );
    } catch (err) {
      console.warn('Failed to update workflow on API', err);
    }
  }

  /** Delete a workflow on the backend */
  private async deleteFromApi(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.api.delete(this.API_PREFIX, '/:id', { id })
      );
    } catch (err) {
      console.warn('Failed to delete workflow from API', err);
    }
  }

  /** Map a backend response DTO to the frontend Workflow type */
  private mapFromApi(dto: Record<string, unknown>): Workflow {
    return {
      id: dto['id'] as string,
      name: dto['name'] as string,
      description: (dto['description'] as string) || undefined,
      steps: (dto['steps'] ?? []) as WorkflowNode[],
      status: (dto['status'] as WorkflowStatus) ?? 'draft',
      scheduledAt: (dto['scheduledAt'] as string) ?? null,
      inputs: (dto['inputs'] as WorkflowInput[]) ?? [],
      outputs: (dto['outputs'] as WorkflowOutput[]) ?? [],
      createdAt: dto['createdAt'] as string,
      updatedAt: dto['updatedAt'] as string,
      lastRunLog: (dto['lastRunLog'] as WorkflowRunLog) ?? undefined,
    };
  }

  upsert(workflow: Workflow): void {
    const isNew = !this._workflows().some(w => w.id === workflow.id);
    this._workflows.update(ws => {
      const idx = ws.findIndex(w => w.id === workflow.id);
      return idx >= 0
        ? ws.map(w => w.id === workflow.id ? workflow : w)
        : [...ws, workflow];
    });
    if (isNew) { this.createOnApi(workflow); } else { this.updateOnApi(workflow); }
  }

  remove(id: string): void {
    this._workflows.update(ws => ws.filter(w => w.id !== id));
    this.deleteFromApi(id);
  }

  getById(id: string): Workflow | undefined {
    return this._workflows().find(w => w.id === id);
  }

  // ── Execution ────────────────────────────────────────────────────────────────

  /** Top-level steps of the currently executing workflow — used for step-index → step-id mapping */
  private executingSteps: WorkflowNode[] = [];

  async execute(workflowId: string, inputValues?: Record<string, string>): Promise<WorkflowRunLog> {
    const workflow = this.getById(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    // Mark running
    this.patchStatus(workflowId, 'running');

    const log: WorkflowRunLog = {
      startedAt: new Date().toISOString(),
      steps: [],
      success: false,
    };

    const stepResults = new Map<string, unknown>();

    // Seed step results with workflow inputs (accessible via special __input__ key)
    const resolvedInputs: Record<string, string> = {};
    for (const inp of workflow.inputs ?? []) {
      resolvedInputs[inp.name] = inputValues?.[inp.name] ?? inp.defaultValue ?? '';
    }
    stepResults.set('__input__', resolvedInputs);

    this.executingSteps = workflow.steps;
    const success = await this.executeNodes(workflow.steps, stepResults, log);

    log.success = success;
    log.finishedAt = new Date().toISOString();

    // Build workflow outputs
    const outputs: Record<string, unknown> = {};
    for (const out of workflow.outputs ?? []) {
      outputs[out.name] = this.resolveRaw(out.source, stepResults);
    }
    stepResults.set('__output__', outputs);
    (log as WorkflowRunLog & { outputs?: unknown }).outputs = outputs;

    // Persist log + update status
    this._workflows.update(ws => ws.map(w => {
      if (w.id !== workflowId) return w;
      return {
        ...w,
        status: (log.success ? 'completed' : 'failed') as WorkflowStatus,
        lastRunLog: log,
        updatedAt: new Date().toISOString(),
      };
    }));
    const updatedWf = this.getById(workflowId);
    if (updatedWf) this.updateOnApi(updatedWf);

    return log;
  }

  /** Recursively execute a list of WorkflowNodes, writing step logs and storing results. */
  private async executeNodes(
    nodes: WorkflowNode[],
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
  ): Promise<boolean> {
    for (const node of nodes) {
      const kind = node.kind ?? 'endpoint';
      const ok = await this.executeNodeByKind(kind, node, stepResults, log);
      if (!ok) return false;
    }
    return true;
  }

  private async executeNodeByKind(
    kind: string,
    node: WorkflowNode,
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
  ): Promise<boolean> {
    switch (kind) {
      case 'endpoint':
        return this.executeEndpoint(node as WorkflowStep, stepResults, log);
      case 'try-catch':
        return this.executeTryCatchNode(node as TryCatchBlock, stepResults, log);
      case 'loop':
        return this.executeLoopNode(node as LoopBlock, stepResults, log);
      case 'if-else':
        return this.executeIfElseNode(node as IfElseBlock, stepResults, log);
      case 'mapper':
        return this.executeMapperNode(node as MapperBlock, stepResults, log);
      case 'filter':
        return this.executeFilterNode(node as FilterBlock, stepResults, log);
      case 'sub-workflow':
        return this.executeSubWorkflowNode(node as SubWorkflowBlock, stepResults, log);
      default:
        return true;
    }
  }

  private async executeTryCatchNode(
    block: TryCatchBlock,
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
  ): Promise<boolean> {
    const tryLog: WorkflowRunLog = { startedAt: new Date().toISOString(), steps: [], success: false };
    const tryOk = await this.executeNodes(block.trySteps, stepResults, tryLog);
    log.steps.push(...tryLog.steps);
    if (!tryOk) {
      const catchLog: WorkflowRunLog = { startedAt: new Date().toISOString(), steps: [], success: false };
      await this.executeNodes(block.catchSteps, stepResults, catchLog);
      log.steps.push(...catchLog.steps);
    }
    return true;
  }

  private async executeLoopNode(
    block: LoopBlock,
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
  ): Promise<boolean> {
    const mode = block.loopMode ?? 'count';

    if (mode === 'for-each' && block.loopSourceStepId) {
      return this.executeForEachLoop(block, stepResults, log);
    }

    // count mode — repeat N times
    const count = block.loopCount ?? 1;
    for (let i = 0; i < count; i++) {
      const iterLog: WorkflowRunLog = { startedAt: new Date().toISOString(), steps: [], success: false };
      const ok = await this.executeNodes(block.bodySteps, stepResults, iterLog);
      log.steps.push(...iterLog.steps);
      if (!ok) return false;
    }
    return true;
  }

  private async executeForEachLoop(
    block: LoopBlock,
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
  ): Promise<boolean> {
    const srcResult = stepResults.get(block.loopSourceStepId!);
    const items = this.resolveArray(srcResult, block.loopSourceField);

    log.steps.push({
      stepId: block.id,
      label: block.label || 'Loop (for-each)',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      resolvedParams: { sourceStepId: block.loopSourceStepId!, sourceField: block.loopSourceField ?? '(root)', itemCount: String(items.length) },
      response: items,
      success: true,
    });

    for (const item of items) {
      stepResults.set(block.id, item);
      const iterLog: WorkflowRunLog = { startedAt: new Date().toISOString(), steps: [], success: false };
      const ok = await this.executeNodes(block.bodySteps, stepResults, iterLog);
      log.steps.push(...iterLog.steps);
      if (!ok) return false;
    }
    stepResults.set(block.id, items);
    return true;
  }

  private async executeIfElseNode(
    block: IfElseBlock,
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
  ): Promise<boolean> {
    const condMet = this.evaluateCondition(block, stepResults);
    const branch = condMet ? block.thenSteps : block.elseSteps;
    const branchLog: WorkflowRunLog = { startedAt: new Date().toISOString(), steps: [], success: false };
    const ok = await this.executeNodes(branch, stepResults, branchLog);
    log.steps.push(...branchLog.steps);
    return ok;
  }

  private executeMapperNode(
    block: MapperBlock,
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
  ): boolean {
    const result: Record<string, unknown> = {};
    for (const mapping of block.mappings) {
      if (mapping.source.type === 'from-step') {
        const srcResult = stepResults.get(mapping.source.stepId);
        result[mapping.outputField] = srcResult == null
          ? ''
          : this.getPath(srcResult, mapping.source.field);
      } else {
        result[mapping.outputField] = mapping.source.value;
      }
    }
    stepResults.set(block.id, result);
    log.steps.push({
      stepId: block.id,
      label: block.label || 'Mapper',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      resolvedParams: {},
      response: result,
      success: true,
    });
    return true;
  }

  private executeFilterNode(
    block: FilterBlock,
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
  ): boolean {
    let items: unknown[] = [];
    if (block.sourceStepId) {
      const srcResult = stepResults.get(block.sourceStepId);
      items = this.resolveArray(srcResult, block.sourceField);
    }
    const field = block.filterField ?? '';
    const op = block.filterOperator ?? '==';
    const expected = block.filterValue ?? '';
    const filtered = field
      ? items.filter(item => {
          const actual = this.getPath(item, field);
          switch (op) {
            case '==': return actual === expected;
            case '!=': return actual !== expected;
            case '>':  return Number(actual) > Number(expected);
            case '<':  return Number(actual) < Number(expected);
            case 'contains': return actual.includes(expected);
            default: return true;
          }
        })
      : items;
    stepResults.set(block.id, filtered);
    log.steps.push({
      stepId: block.id,
      label: block.label || 'Filter',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      resolvedParams: {},
      response: filtered,
      success: true,
    });
    return true;
  }

  private async executeSubWorkflowNode(
    block: SubWorkflowBlock,
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
  ): Promise<boolean> {
    if (!block.workflowId) {
      log.steps.push({
        stepId: block.id,
        label: block.label || 'Sub-Workflow',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        resolvedParams: {},
        error: 'No workflow selected',
        success: false,
      });
      return false;
    }
    const inputValues: Record<string, string> = {};
    for (const [inputName, source] of Object.entries(block.inputBindings)) {
      const raw = this.resolveRaw(source, stepResults);
      inputValues[inputName] = typeof raw === 'string' ? raw : JSON.stringify(raw);
    }
    try {
      const subLog = await this.execute(block.workflowId, inputValues);
      const subOutputs = (subLog as WorkflowRunLog & { outputs?: unknown }).outputs ?? {};
      stepResults.set(block.id, subOutputs);
      log.steps.push({
        stepId: block.id,
        label: block.label || block.workflowName || 'Sub-Workflow',
        startedAt: subLog.startedAt,
        finishedAt: subLog.finishedAt,
        resolvedParams: inputValues,
        response: subOutputs,
        success: subLog.success,
        error: subLog.error,
      });
      return subLog.success;
    } catch (err: unknown) {
      log.steps.push({
        stepId: block.id,
        label: block.label || block.workflowName || 'Sub-Workflow',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        resolvedParams: inputValues,
        error: this.extractErrorMessage(err),
        success: false,
      });
      return false;
    }
  }

  private async executeEndpoint(
    step: WorkflowStep,
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
    allSteps?: WorkflowNode[],
  ): Promise<boolean> {
    const stepLog: WorkflowRunStepLog = {
      stepId: step.id,
      label: step.endpointLabel,
      startedAt: new Date().toISOString(),
      resolvedParams: {},
      success: false,
    };

    try {
      const pathParams = this.resolvePathParams(step, stepResults, allSteps);
      stepLog.resolvedParams = pathParams;

      const body = this.resolveStepBody(step, stepResults, allSteps);
      stepLog.resolvedBody = body;

      const response = await this.callApi(step, pathParams, body);
      stepLog.response = response;
      stepLog.success = true;
      stepResults.set(step.id, response);
    } catch (err: unknown) {
      stepLog.error = this.extractErrorMessage(err);
      stepLog.success = false;
    }

    stepLog.finishedAt = new Date().toISOString();
    log.steps.push(stepLog);

    if (!stepLog.success) {
      log.error = `Step "${stepLog.label}" failed: ${stepLog.error}`;
    }
    return stepLog.success;
  }

  private resolvePathParams(
    step: WorkflowStep,
    stepResults: Map<string, unknown>,
    allSteps?: WorkflowNode[],
  ): Record<string, string> {
    const pathParams: Record<string, string> = {};
    for (const paramName of step.pathParamNames) {
      const src = step.paramSources[paramName] ?? { type: 'hardcoded', value: '' };
      pathParams[paramName] = this.resolve(src, stepResults, allSteps);
    }
    return pathParams;
  }

  private resolveStepBody(
    step: WorkflowStep,
    stepResults: Map<string, unknown>,
    allSteps?: WorkflowNode[],
  ): Record<string, unknown> | undefined {
    const bodyMode = step.bodyMode ?? 'fields';
    if (step.hasBody && (bodyMode === 'text' || bodyMode === 'form') && step.rawBody) {
      try {
        const interpolated = this.interpolateStepRefs(step.rawBody, allSteps ?? this.executingSteps, stepResults);
        return JSON.parse(interpolated);
      } catch {
        return {};
      }
    }
    if (step.hasBody && step.bodyKeys.length > 0) {
      const body: Record<string, unknown> = {};
      for (const key of step.bodyKeys) {
        const src = step.bodySources[key] ?? { type: 'hardcoded', value: '' };
        body[key] = this.resolve(src, stepResults, allSteps);
      }
      return body;
    }
    return undefined;
  }

  private async callApi(
    step: WorkflowStep,
    pathParams: Record<string, string>,
    body?: Record<string, unknown>,
  ): Promise<unknown> {
    const method = step.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
    if (method === 'get' || method === 'delete') {
      return firstValueFrom(
        this.api[method](step.moduleApiPrefix, step.pathTemplate, pathParams)
      );
    }
    const apiCallMap: Record<string, typeof this.api.post> = {
      post: this.api.post,
      put: this.api.put,
      patch: this.api.patch,
    };
    const call = apiCallMap[method] ?? this.api.post;
    return firstValueFrom(
      call.call(this.api, step.moduleApiPrefix, step.pathTemplate, pathParams, body ?? {})
    );
  }

  private evaluateCondition(
    block: IfElseBlock,
    stepResults: Map<string, unknown>,
  ): boolean {
    if (!block.conditionStepId || !block.conditionField) return true;
    const result = stepResults.get(block.conditionStepId);
    const actual = this.getPath(result, block.conditionField);
    const expected = block.conditionValue ?? '';
    const op = block.conditionOperator ?? '==';
    switch (op) {
      case '==': return actual === expected;
      case '!=': return actual !== expected;
      case '>':  return Number(actual) > Number(expected);
      case '<':  return Number(actual) < Number(expected);
      case 'contains': return actual.includes(expected);
      default: return true;
    }
  }

  // ── Scheduling ───────────────────────────────────────────────────────────────

  private checkScheduled(): void {
    const now = new Date();
    const due = this._workflows().filter(w =>
      w.status === 'scheduled' &&
      !!w.scheduledAt && new Date(w.scheduledAt) <= now
    );
    for (const w of due) {
      this.execute(w.id).catch(console.error);
    }
  }

  private patchStatus(id: string, status: WorkflowStatus): void {
    this._workflows.update(ws =>
      ws.map(w => w.id === id ? { ...w, status, updatedAt: new Date().toISOString() } : w)
    );
    const wf = this.getById(id);
    if (wf) this.updateOnApi(wf);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      const detail = typeof body === 'string' ? body
        : body?.message ?? body?.error ?? JSON.stringify(body);
      return `${err.status} ${err.statusText}: ${detail}`;
    }
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return JSON.stringify(err);
  }

  /**
   * Replace {{steps.N.path}} and {{input.name}} tokens in a raw body string with resolved values.
   * N is 1-based step index. Path uses dot-notation (e.g. data.id).
   */
  private interpolateStepRefs(
    raw: string,
    allSteps: WorkflowNode[],
    stepResults: Map<string, unknown>,
  ): string {
    // Match all {{...}} tokens
    return raw.replaceAll(/\{\{([^}]+)\}\}/g, (_match, tokenBody: string) => {
      const token = tokenBody.trim();

      const stepResolved = this.resolveStepToken(token, allSteps, stepResults);
      if (stepResolved !== undefined) return stepResolved;

      const inputResolved = this.resolveInputToken(token, stepResults);
      if (inputResolved !== undefined) return inputResolved;

      // Unrecognised token — leave as-is
      return _match;
    });
  }

  private resolveStepToken(
    token: string,
    allSteps: WorkflowNode[],
    stepResults: Map<string, unknown>,
  ): string | undefined {
    const stepMatch = /^steps\.(\d+)((?:[.[])[\s\S]*)?$/.exec(token);
    if (!stepMatch) return undefined;
    const idx = Number(stepMatch[1]) - 1;
    const step = allSteps[idx];
    if (!step) return '';
    const result = stepResults.get(step.id);
    if (result == null) return '';
    const path = stepMatch[2]
      ? stepMatch[2].replaceAll(/\[(\d+)\]/g, '.$1').replace(/^\./, '')
      : '';
    if (!path) return this.safeStringify(result);
    const resolved = this.getPathRaw(result, path);
    if (resolved == null) return '';
    return this.safeStringify(resolved);
  }

  private resolveInputToken(
    token: string,
    stepResults: Map<string, unknown>,
  ): string | undefined {
    const inputMatch = /^input\.(.+)$/.exec(token);
    if (!inputMatch) return undefined;
    const inputData = stepResults.get('__input__');
    if (inputData == null) return '';
    const resolved = this.getPathRaw(inputData, inputMatch[1]);
    if (resolved == null) return '';
    return this.safeStringify(resolved);
  }

  private safeStringify(val: unknown): string {
    if (val == null) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return `${val}`;
    if (typeof val === 'object') return JSON.stringify(val);
    return JSON.stringify(val);
  }

  private resolve(source: PayloadSource, stepResults: Map<string, unknown>, allSteps?: WorkflowNode[]): string {
    if (source.type === 'hardcoded') {
      // Interpolate any {{steps.N.path}} or {{input.name}} tokens in the hardcoded value
      if (source.value.includes('{{')) {
        return this.interpolateStepRefs(source.value, allSteps ?? this.executingSteps, stepResults);
      }
      return source.value;
    }
    const result = stepResults.get(source.stepId);
    if (result == null) return '';
    return this.getPath(result, source.field);
  }

  /** Like resolve() but preserves objects/arrays instead of stringifying them */
  private resolveRaw(source: PayloadSource, stepResults: Map<string, unknown>): unknown {
    if (source.type === 'hardcoded') {
      if (source.value.includes('{{')) {
        return this.interpolateStepRefs(source.value, this.executingSteps, stepResults);
      }
      return source.value;
    }
    const result = stepResults.get(source.stepId);
    if (result == null) return '';
    return this.getPathRaw(result, source.field) ?? '';
  }

  getPath(obj: unknown, path: string): string {
    if (!path) return obj == null ? '' : this.safeStringify(obj);
    const parts = path.replaceAll(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let cur: unknown = obj;
    for (const part of parts) {
      if (cur == null || typeof cur !== 'object') return '';
      cur = (cur as Record<string, unknown>)[part];
    }
    return cur == null ? '' : this.safeStringify(cur);
  }

  /** Like getPath but returns the raw value (not stringified) — useful for arrays/objects */
  private getPathRaw(obj: unknown, path: string): unknown {
    if (!path) return obj;
    const parts = path.replaceAll(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let cur: unknown = obj;
    for (const part of parts) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = (cur as Record<string, unknown>)[part];
    }
    return cur;
  }

  /** Generate a simple unique ID */
  static newId(): string {
    return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  /**
   * Extract an array from a step result.
   * If `field` is provided, resolve that path.
   * Otherwise, if the result is already an array, use it directly.
   * If it's an object, auto-detect common wrapper patterns (e.g. { data: [...] }).
   */
  private resolveArray(srcResult: unknown, field?: string): unknown[] {
    if (field) {
      const resolved = this.getPathRaw(srcResult, field);
      return Array.isArray(resolved) ? resolved : [];
    }
    if (Array.isArray(srcResult)) return srcResult;
    // Auto-detect: object with an array property (try 'data', then first array value)
    if (srcResult && typeof srcResult === 'object') {
      const obj = srcResult as Record<string, unknown>;
      if (Array.isArray(obj['data'])) return obj['data'] as unknown[];
      for (const val of Object.values(obj)) {
        if (Array.isArray(val)) return val;
      }
    }
    return [];
  }
}
