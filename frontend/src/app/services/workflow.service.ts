import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { UserManagementService } from './user-management.service';
import {
  Workflow, WorkflowNode, WorkflowStep, WorkflowStatus,
  TryCatchBlock, LoopBlock, IfElseBlock, MapperBlock,
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
    // Load workflows from backend API (replaces localStorage when available)
    this.loadFromApi();
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

  async execute(workflowId: string): Promise<WorkflowRunLog> {
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
    this.executingSteps = workflow.steps;
    const success = await this.executeNodes(workflow.steps, stepResults, log);

    log.success = success;
    log.finishedAt = new Date().toISOString();

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

      if (kind === 'endpoint') {
        const step = node as WorkflowStep;
        const ok = await this.executeEndpoint(step, stepResults, log);
        if (!ok) return false;

      } else if (kind === 'try-catch') {
        const block = node as TryCatchBlock;
        const tryLog: WorkflowRunLog = { startedAt: new Date().toISOString(), steps: [], success: false };
        const tryOk = await this.executeNodes(block.trySteps, stepResults, tryLog);
        log.steps.push(...tryLog.steps);
        if (!tryOk) {
          const catchLog: WorkflowRunLog = { startedAt: new Date().toISOString(), steps: [], success: false };
          await this.executeNodes(block.catchSteps, stepResults, catchLog);
          log.steps.push(...catchLog.steps);
        }

      } else if (kind === 'loop') {
        const block = node as LoopBlock;
        const mode = block.loopMode ?? 'count';

        if (mode === 'for-each' && block.loopSourceStepId) {
          // Resolve the source array from a previous step's response
          const srcResult = stepResults.get(block.loopSourceStepId);
          let items: unknown[];
          if (block.loopSourceField) {
            const resolved = this.getPathRaw(srcResult, block.loopSourceField);
            items = Array.isArray(resolved) ? resolved : [];
          } else {
            items = Array.isArray(srcResult) ? srcResult : [];
          }

          for (let i = 0; i < items.length; i++) {
            // Store current element so body steps can reference it via "from-step" → this loop block's id
            stepResults.set(block.id, items[i]);
            const iterLog: WorkflowRunLog = { startedAt: new Date().toISOString(), steps: [], success: false };
            const ok = await this.executeNodes(block.bodySteps, stepResults, iterLog);
            log.steps.push(...iterLog.steps);
            if (!ok) return false;
          }
          // After iteration, store the full array as the block result
          stepResults.set(block.id, items);
        } else {
          // count mode — repeat N times
          const count = block.loopCount ?? 1;
          for (let i = 0; i < count; i++) {
            const iterLog: WorkflowRunLog = { startedAt: new Date().toISOString(), steps: [], success: false };
            const ok = await this.executeNodes(block.bodySteps, stepResults, iterLog);
            log.steps.push(...iterLog.steps);
            if (!ok) return false;
          }
        }

      } else if (kind === 'if-else') {
        const block = node as IfElseBlock;
        const condMet = this.evaluateCondition(block, stepResults);
        const branch = condMet ? block.thenSteps : block.elseSteps;
        const branchLog: WorkflowRunLog = { startedAt: new Date().toISOString(), steps: [], success: false };
        const ok = await this.executeNodes(branch, stepResults, branchLog);
        log.steps.push(...branchLog.steps);
        if (!ok) return false;

      } else if (kind === 'mapper') {
        const block = node as MapperBlock;
        const result: Record<string, unknown> = {};
        for (const mapping of block.mappings) {
          if (mapping.source.type === 'from-step') {
            const srcResult = stepResults.get(mapping.source.stepId);
            result[mapping.outputField] = srcResult != null
              ? this.getPath(srcResult, mapping.source.field)
              : '';
          } else {
            result[mapping.outputField] = mapping.source.value;
          }
        }
        stepResults.set(node.id, result);
        log.steps.push({
          stepId: node.id,
          label: block.label || 'Mapper',
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          resolvedParams: {},
          response: result,
          success: true,
        });
      }
    }
    return true;
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
      // Resolve path params
      const pathParams: Record<string, string> = {};
      for (const paramName of step.pathParamNames) {
        const src = step.paramSources[paramName] ?? { type: 'hardcoded', value: '' };
        pathParams[paramName] = this.resolve(src, stepResults);
      }
      stepLog.resolvedParams = pathParams;

      // Resolve body
      let body: Record<string, unknown> | undefined;
      const bodyMode = step.bodyMode ?? 'fields';
      if (step.hasBody && (bodyMode === 'text' || bodyMode === 'form') && step.rawBody) {
        // Raw JSON body — interpolate {{steps.N.path}} tokens first
        try {
          const interpolated = this.interpolateStepRefs(step.rawBody, allSteps ?? this.executingSteps, stepResults);
          body = JSON.parse(interpolated);
        } catch {
          body = {};
        }
      } else if (step.hasBody && step.bodyKeys.length > 0) {
        body = {};
        for (const key of step.bodyKeys) {
          const src = step.bodySources[key] ?? { type: 'hardcoded', value: '' };
          body[key] = this.resolve(src, stepResults);
        }
      }
      stepLog.resolvedBody = body;

      // Call the API
      const method = step.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
      let response: unknown;

      if (method === 'get' || method === 'delete') {
        response = await firstValueFrom(
          this.api[method](step.moduleApiPrefix, step.pathTemplate, pathParams)
        );
      } else if (method === 'post') {
        response = await firstValueFrom(
          this.api.post(step.moduleApiPrefix, step.pathTemplate, pathParams, body ?? {})
        );
      } else if (method === 'put') {
        response = await firstValueFrom(
          this.api.put(step.moduleApiPrefix, step.pathTemplate, pathParams, body ?? {})
        );
      } else {
        response = await firstValueFrom(
          this.api.patch(step.moduleApiPrefix, step.pathTemplate, pathParams, body ?? {})
        );
      }

      stepLog.response = response;
      stepLog.success = true;
      stepResults.set(step.id, response);
    } catch (err: unknown) {
      stepLog.error = err instanceof Error ? err.message : String(err);
      stepLog.success = false;
    }

    stepLog.finishedAt = new Date().toISOString();
    log.steps.push(stepLog);

    if (!stepLog.success) {
      log.error = `Step "${stepLog.label}" failed: ${stepLog.error}`;
    }
    return stepLog.success;
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

  /**
   * Replace {{steps.N.path}} tokens in a raw body string with resolved values.
   * N is 1-based step index. Path uses dot-notation (e.g. data.id).
   */
  private interpolateStepRefs(
    raw: string,
    allSteps: WorkflowNode[],
    stepResults: Map<string, unknown>,
  ): string {
    return raw.replace(/\{\{steps\.(\d+)(?:\.([^}]+))?\}\}/g, (_match, idxStr, path) => {
      const idx = Number(idxStr) - 1; // Convert to 0-based
      const step = allSteps[idx];
      if (!step) return '';
      const result = stepResults.get(step.id);
      if (result == null) return '';
      if (!path) {
        const val = typeof result === 'object' ? JSON.stringify(result) : String(result);
        return val;
      }
      const resolved = this.getPathRaw(result, path);
      if (resolved == null) return '';
      // If inside a JSON string, return the raw value; if object/array, stringify
      return typeof resolved === 'object' ? JSON.stringify(resolved) : String(resolved);
    });
  }

  private resolve(source: PayloadSource, stepResults: Map<string, unknown>): string {
    if (source.type === 'hardcoded') return source.value;
    const result = stepResults.get(source.stepId);
    if (result == null) return '';
    return this.getPath(result, source.field);
  }

  getPath(obj: unknown, path: string): string {
    if (!path) return obj != null ? String(obj) : '';
    const parts = path.split('.');
    let cur: unknown = obj;
    for (const part of parts) {
      if (cur == null || typeof cur !== 'object') return '';
      const arrMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrMatch) {
        cur = (cur as Record<string, unknown>)[arrMatch[1]];
        if (Array.isArray(cur)) cur = cur[Number(arrMatch[2])];
        else return '';
      } else {
        cur = (cur as Record<string, unknown>)[part];
      }
    }
    return cur != null ? String(cur) : '';
  }

  /** Like getPath but returns the raw value (not stringified) — useful for arrays/objects */
  private getPathRaw(obj: unknown, path: string): unknown {
    if (!path) return obj;
    const parts = path.split('.');
    let cur: unknown = obj;
    for (const part of parts) {
      if (cur == null || typeof cur !== 'object') return undefined;
      const arrMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrMatch) {
        cur = (cur as Record<string, unknown>)[arrMatch[1]];
        if (Array.isArray(cur)) cur = cur[Number(arrMatch[2])];
        else return undefined;
      } else {
        cur = (cur as Record<string, unknown>)[part];
      }
    }
    return cur;
  }

  /** Generate a simple unique ID */
  static newId(): string {
    return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}
