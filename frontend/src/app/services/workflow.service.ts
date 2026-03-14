import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import {
  Workflow, WorkflowNode, WorkflowStep, WorkflowStatus,
  TryCatchBlock, LoopBlock, IfElseBlock,
  WorkflowRunLog, WorkflowRunStepLog, PayloadSource,
} from '../config/workflow.types';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private readonly api = inject(ApiService);
  private readonly STORAGE_KEY = 'cloud42_workflows';

  private readonly _workflows = signal<Workflow[]>(this.loadFromStorage());
  readonly workflows = this._workflows.asReadonly();

  constructor() {
    // Poll every 30 seconds to fire scheduled workflows
    setInterval(() => this.checkScheduled(), 30_000);
  }

  // ── Persistence ─────────────────────────────────────────────────────────────

  private loadFromStorage(): Workflow[] {
    try {
      const raw = JSON.parse(localStorage.getItem(this.STORAGE_KEY) ?? '[]') as Workflow[];
      if (raw.length > 0) {
        // Migrate legacy steps that lack a kind field
        return raw.map(wf => ({
          ...wf,
          steps: wf.steps.map(s => ({
            ...s,
            kind: (s as WorkflowNode).kind ?? 'endpoint',
          })) as WorkflowNode[],
        }));
      }
      // Seed demo workflows when storage is empty
      return this.seedDemoWorkflows();
    } catch {
      return [];
    }
  }

  private seedDemoWorkflows(): Workflow[] {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    // Helper: ISO string for a date in local time
    const localISO = (d: Date) => d.toISOString();

    // Schedule one workflow 2 days from now at 10:00 local
    const d1 = new Date(y, m, now.getDate() + 2, 10, 0, 0, 0);
    // Schedule one workflow 5 days from now at 14:30 local
    const d2 = new Date(y, m, now.getDate() + 5, 14, 30, 0, 0);
    // Schedule one today at end of day
    const d3 = new Date(y, m, now.getDate(), 17, 0, 0, 0);

    const makeStep = (id: string, label: string, method: string): WorkflowStep => ({
      id,
      kind: 'endpoint',
      moduleId: 'zoho-crm',
      moduleLabel: 'Zoho CRM',
      moduleApiPrefix: '/zoho-crm',
      endpointId: 'list-contacts',
      endpointLabel: label,
      method,
      pathTemplate: '/contacts',
      pathParamNames: [],
      hasBody: false,
      paramSources: {},
      bodyKeys: [],
      bodySources: {},
    });

    const demos: Workflow[] = [
      {
        id: 'demo-wf-1',
        name: 'Daily CRM Sync',
        steps: [makeStep('s1', 'List Contacts', 'GET'), makeStep('s2', 'List Accounts', 'GET')],
        status: 'scheduled',
        scheduledAt: localISO(d1),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'demo-wf-2',
        name: 'Weekly Report Run',
        steps: [makeStep('s3', 'List Contacts', 'GET')],
        status: 'scheduled',
        scheduledAt: localISO(d2),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'demo-wf-3',
        name: 'End-of-Day Cleanup',
        steps: [makeStep('s4', 'List Contacts', 'GET'), makeStep('s5', 'List Accounts', 'GET'), makeStep('s6', 'List Deals', 'GET')],
        status: 'scheduled',
        scheduledAt: localISO(d3),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(demos));
    return demos;
  }

  private persist(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._workflows()));
  }

  upsert(workflow: Workflow): void {
    this._workflows.update(ws => {
      const idx = ws.findIndex(w => w.id === workflow.id);
      return idx >= 0
        ? ws.map(w => w.id === workflow.id ? workflow : w)
        : [...ws, workflow];
    });
    this.persist();
  }

  remove(id: string): void {
    this._workflows.update(ws => ws.filter(w => w.id !== id));
    this.persist();
  }

  getById(id: string): Workflow | undefined {
    return this._workflows().find(w => w.id === id);
  }

  // ── Execution ────────────────────────────────────────────────────────────────

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
    this.persist();

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
        const count = block.loopCount ?? 1;
        for (let i = 0; i < count; i++) {
          const iterLog: WorkflowRunLog = { startedAt: new Date().toISOString(), steps: [], success: false };
          const ok = await this.executeNodes(block.bodySteps, stepResults, iterLog);
          log.steps.push(...iterLog.steps);
          if (!ok) return false;
        }

      } else if (kind === 'if-else') {
        const block = node as IfElseBlock;
        const condMet = this.evaluateCondition(block, stepResults);
        const branch = condMet ? block.thenSteps : block.elseSteps;
        const branchLog: WorkflowRunLog = { startedAt: new Date().toISOString(), steps: [], success: false };
        const ok = await this.executeNodes(branch, stepResults, branchLog);
        log.steps.push(...branchLog.steps);
        if (!ok) return false;
      }
    }
    return true;
  }

  private async executeEndpoint(
    step: WorkflowStep,
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
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
        // Raw JSON body (from Text mode or Form mode)
        try {
          body = JSON.parse(step.rawBody);
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
    this.persist();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

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

  /** Generate a simple unique ID */
  static newId(): string {
    return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}
