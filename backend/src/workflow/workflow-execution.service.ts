import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { WorkflowEntity } from './workflow.entity';
import { MODULES, extractPathParams } from './workflow.endpoints';
import type {
  WorkflowNode, WorkflowStep, TryCatchBlock, LoopBlock, IfElseBlock,
  MapperBlock, FilterBlock, SubWorkflowBlock, ScriptBlock,
  WorkflowRunLog, WorkflowRunStepLog, PayloadSource,
  WorkflowInput, WorkflowOutput,
} from './workflow.types';

@Injectable()
export class WorkflowExecutionService {
  private readonly logger = new Logger(WorkflowExecutionService.name);
  private readonly baseUrl: string;
  private executingSteps: WorkflowNode[] = [];

  constructor(
    @InjectRepository(WorkflowEntity)
    private readonly repo: Repository<WorkflowEntity>,
    private readonly config: ConfigService,
  ) {
    const port = this.config.get<string>('PORT', '3000');
    this.baseUrl = `http://localhost:${port}/api`;
  }

  // ── Public execute entry point ──────────────────────────────────────────────

  async execute(
    workflowId: string,
    inputValues?: Record<string, string>,
  ): Promise<WorkflowRunLog> {
    const wf = await this.repo.findOneBy({ id: workflowId });
    if (!wf) throw new NotFoundException(`Workflow ${workflowId} not found`);

    const steps = (wf.steps ?? []) as WorkflowNode[];
    const inputs = (wf.inputs ?? []) as WorkflowInput[];
    const outputs = (wf.outputs ?? []) as WorkflowOutput[];

    // Mark running
    wf.status = 'running';
    await this.repo.save(wf);

    const log: WorkflowRunLog = {
      startedAt: new Date().toISOString(),
      steps: [],
      success: false,
    };

    const stepResults = new Map<string, unknown>();

    // Seed inputs
    const resolvedInputs: Record<string, string> = {};
    for (const inp of inputs) {
      resolvedInputs[inp.name] = inputValues?.[inp.name] ?? inp.defaultValue ?? '';
    }
    stepResults.set('__input__', resolvedInputs);

    this.executingSteps = steps;
    const success = await this.executeNodes(steps, stepResults, log);

    log.success = success;
    log.finishedAt = new Date().toISOString();

    // Build workflow outputs
    const outputData: Record<string, unknown> = {};
    for (const out of outputs) {
      outputData[out.name] = this.resolveRaw(out.source, stepResults);
    }
    log.outputs = outputData;

    // Persist log + update status
    wf.status = success ? 'completed' : 'failed';
    wf.lastRunLog = log as unknown;
    await this.repo.save(wf);

    return log;
  }

  // ── Scheduled-workflow checker ──────────────────────────────────────────────

  async checkScheduled(): Promise<void> {
    const now = new Date();
    const due = await this.repo
      .createQueryBuilder('w')
      .where('w.status = :status', { status: 'scheduled' })
      .andWhere('w.scheduledAt <= :now', { now })
      .getMany();

    for (const wf of due) {
      this.logger.log(`Executing scheduled workflow: ${wf.name} (${wf.id})`);
      this.execute(wf.id).catch(err =>
        this.logger.error(`Scheduled workflow ${wf.id} failed`, err),
      );
    }
  }

  // ── Node execution engine ─────────────────────────────────────────────────

  private async executeNodes(
    nodes: WorkflowNode[],
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
  ): Promise<boolean> {
    for (const node of nodes) {
      const kind = (node as { kind?: string }).kind ?? 'endpoint';
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
        return this.executeTryCatch(node as TryCatchBlock, stepResults, log);
      case 'loop':
        return this.executeLoop(node as LoopBlock, stepResults, log);
      case 'if-else':
        return this.executeIfElse(node as IfElseBlock, stepResults, log);
      case 'mapper':
        return this.executeMapper(node as MapperBlock, stepResults, log);
      case 'filter':
        return this.executeFilter(node as FilterBlock, stepResults, log);
      case 'sub-workflow':
        return this.executeSubWorkflow(node as SubWorkflowBlock, stepResults, log);
      case 'script':
        return this.executeScript(node as ScriptBlock, stepResults, log);
      default:
        return true;
    }
  }

  // ── Endpoint step ──────────────────────────────────────────────────────────

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
      const pathParams = this.resolvePathParams(step, stepResults);
      stepLog.resolvedParams = pathParams;

      const body = this.resolveStepBody(step, stepResults);
      stepLog.resolvedBody = body;

      const response = await this.callApi(step.method, step.moduleApiPrefix, step.pathTemplate, pathParams, body);
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

  // ── Try-Catch ──────────────────────────────────────────────────────────────

  private async executeTryCatch(
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

  // ── Loop ────────────────────────────────────────────────────────────────────

  private async executeLoop(
    block: LoopBlock,
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
  ): Promise<boolean> {
    const mode = block.loopMode ?? 'count';

    if (mode === 'for-each' && block.loopSourceStepId) {
      return this.executeForEachLoop(block, stepResults, log);
    }

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
      resolvedParams: {
        sourceStepId: block.loopSourceStepId!,
        sourceField: block.loopSourceField ?? '(root)',
        itemCount: String(items.length),
      },
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

  // ── If-Else ─────────────────────────────────────────────────────────────────

  private async executeIfElse(
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

  private evaluateCondition(block: IfElseBlock, stepResults: Map<string, unknown>): boolean {
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

  // ── Mapper ──────────────────────────────────────────────────────────────────

  private executeMapper(
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

  // ── Filter ──────────────────────────────────────────────────────────────────

  private executeFilter(
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

  // ── Sub-Workflow ────────────────────────────────────────────────────────────

  private async executeSubWorkflow(
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
    const inputVals: Record<string, string> = {};
    for (const [inputName, source] of Object.entries(block.inputBindings)) {
      const raw = this.resolveRaw(source, stepResults);
      inputVals[inputName] = typeof raw === 'string' ? raw : JSON.stringify(raw);
    }
    try {
      const subLog = await this.execute(block.workflowId, inputVals);
      stepResults.set(block.id, subLog.outputs ?? {});
      log.steps.push({
        stepId: block.id,
        label: block.label || block.workflowName || 'Sub-Workflow',
        startedAt: subLog.startedAt,
        finishedAt: subLog.finishedAt,
        resolvedParams: inputVals,
        response: subLog.outputs,
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
        resolvedParams: inputVals,
        error: this.extractErrorMessage(err),
        success: false,
      });
      return false;
    }
  }

  // ── Script ──────────────────────────────────────────────────────────────────

  private async executeScript(
    block: ScriptBlock,
    stepResults: Map<string, unknown>,
    log: WorkflowRunLog,
  ): Promise<boolean> {
    const stepLog: WorkflowRunStepLog = {
      stepId: block.id,
      label: block.label || 'Script',
      startedAt: new Date().toISOString(),
      resolvedParams: {},
      success: false,
    };

    try {
      // Resolve input bindings
      const args: Record<string, unknown> = {};
      for (const binding of block.inputBindings) {
        if (!binding.name) continue;
        if (binding.source.type === 'from-step') {
          const srcResult = stepResults.get(binding.source.stepId);
          args[binding.name] = srcResult == null
            ? undefined
            : binding.source.field
              ? this.getPathRaw(srcResult, binding.source.field)
              : srcResult;
        } else {
          args[binding.name] = binding.source.value;
        }
      }

      // Inject API proxy objects
      const apiProxies = this.buildScriptApiProxies();
      for (const [name, proxy] of Object.entries(apiProxies)) {
        args[name] = proxy;
      }

      stepLog.resolvedParams = Object.fromEntries(
        Object.entries(args)
          .filter(([k]) => !apiProxies[k])
          .map(([k, v]) => [k, this.safeStringify(v)]),
      );

      // Build async function from user code
      const argNames = Object.keys(args);
      const argValues = argNames.map(n => args[n]);
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const fn = new AsyncFunction(...argNames, block.code);
      const result = await fn(...argValues);

      stepLog.response = result;
      stepLog.success = true;
      stepResults.set(block.id, result);
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

  // ── API proxy builder for scripts ──────────────────────────────────────────

  private buildScriptApiProxies(): Record<string, Record<string, (...a: unknown[]) => Promise<unknown>>> {
    const proxies: Record<string, Record<string, (...a: unknown[]) => Promise<unknown>>> = {};

    for (const mod of MODULES) {
      const proxyName = mod.label.split(/\s+/).join('');
      const obj: Record<string, (...a: unknown[]) => Promise<unknown>> = {};

      for (const ep of mod.endpoints) {
        const methodName = ep.label.split(/\s+/).join('');
        const httpMethod = ep.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
        const paramNames = extractPathParams(ep.pathTemplate);
        const hasParams = paramNames.length > 0;
        const hasBody = ep.hasBody ?? false;

        obj[methodName] = async (...args: unknown[]): Promise<unknown> => {
          const pathParams: Record<string, string> = {};
          let body: Record<string, unknown> | undefined;

          if (hasParams && args[0] && typeof args[0] === 'object') {
            for (const [k, v] of Object.entries(args[0] as Record<string, unknown>)) {
              pathParams[k] = v == null ? '' : typeof v === 'string' ? v : JSON.stringify(v);
            }
          }
          if (hasBody) {
            const bodyArg = hasParams ? args[1] : args[0];
            if (bodyArg && typeof bodyArg === 'object') {
              body = bodyArg as Record<string, unknown>;
            }
          }

          return this.callApi(httpMethod, mod.apiPrefix, ep.pathTemplate, pathParams, body);
        };
      }

      proxies[proxyName] = obj;
    }

    return proxies;
  }

  // ── HTTP caller ─────────────────────────────────────────────────────────────

  private async callApi(
    method: string,
    modulePrefix: string,
    pathTemplate: string,
    pathParams: Record<string, string>,
    body?: Record<string, unknown>,
  ): Promise<unknown> {
    // Build URL: replace :param with values
    let path = pathTemplate;
    for (const [key, value] of Object.entries(pathParams)) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    }
    const url = `${this.baseUrl}${modulePrefix}${path}`;

    const httpMethod = method.toLowerCase();
    let res;
    switch (httpMethod) {
      case 'get':
        res = await axios.get(url);
        break;
      case 'delete':
        res = await axios.delete(url);
        break;
      case 'post':
        res = await axios.post(url, body ?? {});
        break;
      case 'put':
        res = await axios.put(url, body ?? {});
        break;
      case 'patch':
        res = await axios.patch(url, body ?? {});
        break;
      default:
        res = await axios.get(url);
    }
    return res.data;
  }

  // ── Path param & body resolution ───────────────────────────────────────────

  private resolvePathParams(
    step: WorkflowStep,
    stepResults: Map<string, unknown>,
  ): Record<string, string> {
    const pathParams: Record<string, string> = {};
    for (const paramName of step.pathParamNames) {
      const src = step.paramSources[paramName] ?? { type: 'hardcoded', value: '' };
      pathParams[paramName] = this.resolve(src, stepResults);
    }
    return pathParams;
  }

  private resolveStepBody(
    step: WorkflowStep,
    stepResults: Map<string, unknown>,
  ): Record<string, unknown> | undefined {
    const bodyMode = step.bodyMode ?? 'fields';
    if (step.hasBody && (bodyMode === 'text' || bodyMode === 'form') && step.rawBody) {
      try {
        const interpolated = this.interpolateStepRefs(step.rawBody, this.executingSteps, stepResults);
        return JSON.parse(interpolated);
      } catch {
        return {};
      }
    }
    if (step.hasBody && step.bodyKeys.length > 0) {
      const body: Record<string, unknown> = {};
      for (const key of step.bodyKeys) {
        const src = step.bodySources[key] ?? { type: 'hardcoded', value: '' };
        body[key] = this.resolve(src, stepResults);
      }
      return body;
    }
    return undefined;
  }

  // ── Value resolution helpers ───────────────────────────────────────────────

  private resolve(source: PayloadSource, stepResults: Map<string, unknown>): string {
    if (source.type === 'hardcoded') {
      if (source.value.includes('{{')) {
        return this.interpolateStepRefs(source.value, this.executingSteps, stepResults);
      }
      return source.value;
    }
    const result = stepResults.get(source.stepId);
    if (result == null) return '';
    return this.getPath(result, source.field);
  }

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

  private interpolateStepRefs(
    raw: string,
    allSteps: WorkflowNode[],
    stepResults: Map<string, unknown>,
  ): string {
    return raw.replace(/\{\{([^}]+)\}\}/g, (_match, tokenBody: string) => {
      const token = tokenBody.trim();

      // steps.N.path
      const stepMatch = /^steps\.(\d+)((?:[.[])[\s\S]*)?$/.exec(token);
      if (stepMatch) {
        const idx = Number(stepMatch[1]) - 1;
        const step = allSteps[idx];
        if (!step) return '';
        const result = stepResults.get(step.id);
        if (result == null) return '';
        const path = stepMatch[2]
          ? stepMatch[2].replace(/\[(\d+)\]/g, '.$1').replace(/^\./, '')
          : '';
        if (!path) return this.safeStringify(result);
        const resolved = this.getPathRaw(result, path);
        return resolved == null ? '' : this.safeStringify(resolved);
      }

      // input.name
      const inputMatch = /^input\.(.+)$/.exec(token);
      if (inputMatch) {
        const inputData = stepResults.get('__input__');
        if (inputData == null) return '';
        const resolved = this.getPathRaw(inputData, inputMatch[1]);
        return resolved == null ? '' : this.safeStringify(resolved);
      }

      return _match;
    });
  }

  // ── Path resolution helpers ────────────────────────────────────────────────

  private getPath(obj: unknown, path: string): string {
    if (!path) return obj == null ? '' : this.safeStringify(obj);
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let cur: unknown = obj;
    for (const part of parts) {
      if (cur == null || typeof cur !== 'object') return '';
      cur = (cur as Record<string, unknown>)[part];
    }
    return cur == null ? '' : this.safeStringify(cur);
  }

  private getPathRaw(obj: unknown, path: string): unknown {
    if (!path) return obj;
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let cur: unknown = obj;
    for (const part of parts) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = (cur as Record<string, unknown>)[part];
    }
    return cur;
  }

  private resolveArray(srcResult: unknown, field?: string): unknown[] {
    if (field) {
      const resolved = this.getPathRaw(srcResult, field);
      return Array.isArray(resolved) ? resolved : [];
    }
    if (Array.isArray(srcResult)) return srcResult;
    if (srcResult && typeof srcResult === 'object') {
      const obj = srcResult as Record<string, unknown>;
      if (Array.isArray(obj['data'])) return obj['data'] as unknown[];
      for (const val of Object.values(obj)) {
        if (Array.isArray(val)) return val;
      }
    }
    return [];
  }

  private safeStringify(val: unknown): string {
    if (val == null) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return `${val}`;
    return JSON.stringify(val);
  }

  private extractErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data;
      const detail = typeof data === 'string' ? data
        : data?.message ?? data?.error ?? JSON.stringify(data);
      return `${err.response?.status ?? 'ERR'}: ${detail}`;
    }
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return JSON.stringify(err);
  }
}
