import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../services/api.service';
import { MODULES, EndpointDef } from '../../config/endpoints';
import { getEndpointPayload } from '../../config/endpoint-payloads';
import { getEndpointInputSchema } from '../../config/endpoint-schemas';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { firstValueFrom } from 'rxjs';

interface HistoryEntry {
  id: string;
  method: string;
  url: string;
  status: 'success' | 'error';
  statusCode?: number;
  duration: number;
  timestamp: Date;
  response: unknown;
  body?: unknown;
}

@Component({
  selector: 'app-api-tester',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTooltipModule, MatDividerModule,
    MatProgressSpinnerModule, MatTabsModule, MatChipsModule,
    TranslatePipe,
  ],
  template: `
    <div class="tester-shell">
      <!-- ── LEFT: History ── -->
      <div class="history-panel">
        <div class="panel-header">
          <mat-icon>history</mat-icon>
          <span>{{ 'api-tester.history' | t }}</span>
          @if (history().length > 0) {
            <button mat-icon-button class="clear-btn" (click)="history.set([])" matTooltip="{{ 'api-tester.clear' | t }}">
              <mat-icon>delete_sweep</mat-icon>
            </button>
          }
        </div>
        <div class="history-list">
          @for (entry of history(); track entry.id) {
            <div class="history-item" [class.active]="selectedHistoryId() === entry.id"
                 (click)="loadFromHistory(entry)">
              <span class="method-badge method-{{ entry.method.toLowerCase() }}">{{ entry.method }}</span>
              <div class="history-detail">
                <span class="history-url">{{ entry.url }}</span>
                <span class="history-meta">
                  <span [class]="entry.status === 'success' ? 'status-ok' : 'status-err'">
                    {{ entry.statusCode ?? (entry.status === 'success' ? 200 : 'ERR') }}
                  </span>
                  · {{ entry.duration }}ms
                </span>
              </div>
            </div>
          }
          @if (history().length === 0) {
            <div class="history-empty">
              <mat-icon>send</mat-icon>
              <p>{{ 'api-tester.no-history' | t }}</p>
            </div>
          }
        </div>
      </div>

      <!-- ── CENTER: Request builder ── -->
      <div class="main-panel">
        <!-- URL bar -->
        <div class="url-bar">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="method-select">
            <mat-select [(value)]="method">
              <mat-option value="GET">GET</mat-option>
              <mat-option value="POST">POST</mat-option>
              <mat-option value="PUT">PUT</mat-option>
              <mat-option value="PATCH">PATCH</mat-option>
              <mat-option value="DELETE">DELETE</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="module-select">
            <mat-label>{{ 'api-tester.module' | t }}</mat-label>
            <mat-select [(value)]="selectedModulePrefix" (selectionChange)="onModuleChange()">
              @for (mod of allModules; track mod.id) {
                <mat-option [value]="mod.apiPrefix">{{ mod.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="endpoint-select">
            <mat-label>{{ 'api-tester.endpoint' | t }}</mat-label>
            <mat-select [(value)]="selectedEndpointId" (selectionChange)="onEndpointChange()">
              @for (ep of filteredEndpoints(); track ep.id) {
                <mat-option [value]="ep.id">
                  <span class="method-badge method-{{ ep.method.toLowerCase() }}">{{ ep.method }}</span>
                  {{ ep.label }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <button mat-flat-button color="primary" class="send-btn"
                  (click)="sendRequest()" [disabled]="sending()">
            @if (sending()) {
              <mat-spinner diameter="18" />
            } @else {
              <mat-icon>send</mat-icon>
            }
            {{ 'api-tester.send' | t }}
          </button>
        </div>

        <!-- Resolved URL preview -->
        <div class="url-preview">
          <code>{{ resolvedUrl() }}</code>
        </div>

        <!-- Request config tabs -->
        <mat-tab-group class="config-tabs" animationDuration="100ms">
          <!-- Path Params -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>tag</mat-icon> {{ 'api-tester.path-params' | t }}
              @if (pathParamNames().length > 0) {
                <span class="tab-badge">{{ pathParamNames().length }}</span>
              }
            </ng-template>
            <div class="tab-body">
              @if (pathParamNames().length === 0) {
                <p class="tab-empty">{{ 'api-tester.no-path-params' | t }}</p>
              }
              @for (param of pathParamNames(); track param) {
                <div class="param-row">
                  <span class="param-key">:{{ param }}</span>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="param-value">
                    <input matInput [value]="pathParams[param] || ''"
                           (input)="pathParams[param] = $any($event.target).value"
                           placeholder="value" />
                  </mat-form-field>
                </div>
              }
            </div>
          </mat-tab>

          <!-- Query Params -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>filter_list</mat-icon> {{ 'api-tester.query-params' | t }}
              @if (queryParamKeys.length > 0) {
                <span class="tab-badge">{{ queryParamKeys.length }}</span>
              }
            </ng-template>
            <div class="tab-body">
              @for (q of queryParamKeys; track q; let i = $index) {
                <div class="param-row">
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="param-key-input">
                    <input matInput [value]="q"
                           (input)="queryParamKeys[i] = $any($event.target).value"
                           placeholder="key" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="param-value">
                    <input matInput [value]="queryParamValues[i] || ''"
                           (input)="queryParamValues[i] = $any($event.target).value"
                           placeholder="value" />
                  </mat-form-field>
                  <button mat-icon-button (click)="removeQueryParam(i)" color="warn">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              }
              <button mat-stroked-button (click)="addQueryParam()" class="add-param-btn">
                <mat-icon>add</mat-icon> {{ 'api-tester.add-param' | t }}
              </button>
            </div>
          </mat-tab>

          <!-- Body -->
          <mat-tab [disabled]="method === 'GET' || method === 'DELETE'">
            <ng-template mat-tab-label>
              <mat-icon>data_object</mat-icon> {{ 'api-tester.body' | t }}
            </ng-template>
            <div class="tab-body">
              <textarea class="body-editor"
                        [(ngModel)]="bodyText"
                        (input)="onBodyInput($any($event.target))"
                        (keydown)="onBodyAcKeydown($event)"
                        (blur)="closeBodyAc()"
                        rows="12"
                        placeholder='{ "key": "value" }'
                        spellcheck="false"></textarea>
              @if (bodyAcSuggestions().length > 0) {
                <div class="ac-overlay" [ngStyle]="bodyAcStyle()">
                  @for (s of bodyAcSuggestions(); track s.insertText; let i = $index) {
                    <div class="ac-item" [class.ac-active]="i === bodyAcIndex()" (mousedown)="insertBodyAcSuggestion(s, $event)">
                      <mat-icon class="ac-icon">{{ s.icon }}</mat-icon>
                      <span class="ac-label">{{ s.label }}</span>
                      <span class="ac-detail">{{ s.detail }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          </mat-tab>

          <!-- Headers -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>tune</mat-icon> {{ 'api-tester.headers' | t }}
            </ng-template>
            <div class="tab-body">
              <p class="tab-hint">{{ 'api-tester.headers-hint' | t }}</p>
              @for (h of headerKeys; track h; let i = $index) {
                <div class="param-row">
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="param-key-input">
                    <input matInput [value]="h" (input)="headerKeys[i] = $any($event.target).value" placeholder="Header" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="param-value">
                    <input matInput [value]="headerValues[i] || ''" (input)="headerValues[i] = $any($event.target).value" placeholder="Value" />
                  </mat-form-field>
                  <button mat-icon-button (click)="headerKeys.splice(i, 1); headerValues.splice(i, 1)" color="warn">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              }
              <button mat-stroked-button (click)="headerKeys.push(''); headerValues.push('')" class="add-param-btn">
                <mat-icon>add</mat-icon> {{ 'api-tester.add-header' | t }}
              </button>
            </div>
          </mat-tab>
        </mat-tab-group>

        <mat-divider />

        <!-- Response -->
        <div class="response-section">
          <div class="response-header">
            <span class="response-title">{{ 'api-tester.response' | t }}</span>
            @if (lastDuration() !== null) {
              <div class="response-meta">
                <span [class]="lastStatus() === 'success' ? 'status-ok' : 'status-err'">
                  {{ lastStatusCode() ?? (lastStatus() === 'success' ? '200 OK' : 'Error') }}
                </span>
                <span class="duration">{{ lastDuration() }}ms</span>
              </div>
            }
            @if (lastResponse() !== null) {
              <button mat-icon-button (click)="copyResponse()" matTooltip="{{ 'api-tester.copy' | t }}">
                <mat-icon>content_copy</mat-icon>
              </button>
            }
          </div>
          <pre class="response-body" [class.empty]="lastResponse() === null">{{ lastResponse() === null ? ('api-tester.no-response' | t) : formatJson(lastResponse()) }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .tester-shell {
      display: flex; height: 100%; background: #f8fafc;
    }

    /* ── History Panel ── */
    .history-panel {
      width: 280px; min-width: 280px; background: white;
      border-right: 1px solid #e2e8f0;
      display: flex; flex-direction: column; overflow: hidden;
    }
    .panel-header {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; font-weight: 700; font-size: 13px;
      border-bottom: 1px solid #e2e8f0; color: #1e293b;
    }
    .clear-btn { margin-left: auto; width: 28px; height: 28px; line-height: 28px; }
    .clear-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .history-list { flex: 1; overflow-y: auto; padding: 4px 8px; }
    .history-item {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 8px 10px; border-radius: 8px; cursor: pointer;
      margin-bottom: 2px; transition: background .1s;
    }
    .history-item:hover { background: #f1f5f9; }
    .history-item.active { background: #f0fdfa; border: 1px solid #0891b2; }
    .history-detail { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .history-url {
      font-size: 11px; color: #1e293b; font-family: monospace;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .history-meta { font-size: 10px; color: #94a3b8; margin-top: 2px; }
    .history-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 40px 16px; color: #94a3b8; gap: 8px;
    }
    .history-empty mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .history-empty p { font-size: 12px; margin: 0; }

    /* ── Method badges ── */
    .method-badge {
      font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
      letter-spacing: .03em; white-space: nowrap;
    }
    .method-get    { background: #dcfce7; color: #15803d; }
    .method-post   { background: #dbeafe; color: #1d4ed8; }
    .method-put    { background: #fef9c3; color: #ca8a04; }
    .method-patch  { background: #ede9fe; color: #7c3aed; }
    .method-delete { background: #fee2e2; color: #dc2626; }

    /* ── Main Panel ── */
    .main-panel {
      flex: 1; display: flex; flex-direction: column; overflow-y: auto;
      padding: 16px 24px;
    }

    /* ── URL Bar ── */
    .url-bar {
      display: flex; gap: 8px; align-items: flex-start;
    }
    .method-select { width: 110px; }
    .module-select { width: 200px; }
    .endpoint-select { flex: 1; }
    .send-btn { height: 56px; min-width: 100px; }

    .url-preview {
      padding: 6px 12px; margin: 4px 0 12px;
      background: #1e293b; border-radius: 6px;
    }
    .url-preview code {
      color: #22d3ee; font-size: 12px; font-family: 'Cascadia Code', 'Fira Code', monospace;
      word-break: break-all;
    }

    /* ── Tabs ── */
    .config-tabs { margin: 8px 0; }
    .tab-body { padding: 12px 0; }
    .tab-empty { font-size: 12px; color: #94a3b8; font-style: italic; margin: 0; }
    .tab-hint { font-size: 11px; color: #64748b; margin: 0 0 8px; }
    .tab-badge {
      font-size: 9px; background: #0891b2; color: white;
      border-radius: 99px; padding: 1px 6px; margin-left: 4px;
    }

    .param-row {
      display: flex; gap: 8px; align-items: center; margin-bottom: 4px;
    }
    .param-key {
      font-family: monospace; font-size: 12px; font-weight: 700;
      color: #0891b2; min-width: 80px;
    }
    .param-key-input { flex: 0 0 160px; }
    .param-value { flex: 1; }
    .add-param-btn { font-size: 12px; margin-top: 4px; }

    /* ── Body Editor ── */
    .body-editor {
      width: 100%; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 12px 16px; font-family: 'Cascadia Code', 'Fira Code', monospace;
      font-size: 12px; line-height: 1.6; background: #fafbfc;
      resize: vertical; outline: none; color: #1e293b;
    }
    .body-editor:focus { border-color: #0891b2; }

    /* ── Response ── */
    .response-section { margin-top: 12px; flex: 1; display: flex; flex-direction: column; }
    .response-header {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 8px;
    }
    .response-title { font-weight: 700; font-size: 13px; color: #1e293b; }
    .response-meta { display: flex; gap: 8px; align-items: center; font-size: 12px; }
    .status-ok { color: #15803d; font-weight: 700; }
    .status-err { color: #dc2626; font-weight: 700; }
    .duration { color: #64748b; }

    .response-body {
      flex: 1; min-height: 200px; max-height: 500px; overflow: auto;
      background: #1e293b; color: #e2e8f0; border-radius: 8px;
      padding: 16px; margin: 0;
      font-family: 'Cascadia Code', 'Fira Code', monospace;
      font-size: 12px; line-height: 1.5;
      white-space: pre-wrap; word-break: break-all;
    }
    .response-body.empty { color: #64748b; background: #f8fafc; border: 1px dashed #e2e8f0; }
    .ac-overlay {
      position: fixed; z-index: 1000;
      background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12); max-height: 220px; overflow-y: auto;
    }
    .ac-item {
      display: flex; align-items: center; gap: 6px; padding: 6px 12px; cursor: pointer;
      font-size: 13px;
    }
    .ac-item:hover, .ac-item.ac-active { background: #eff6ff; }
    .ac-icon { font-size: 16px; width: 16px; height: 16px; color: #64748b; }
    .ac-label { font-weight: 500; flex-shrink: 0; }
    .ac-detail { color: #94a3b8; margin-left: auto; font-size: 11px; }
  `],
})
export class ApiTesterComponent {
  private readonly api = inject(ApiService);
  readonly allModules = MODULES;

  // ── Request state ──
  method = 'GET';
  selectedModulePrefix = '';
  selectedEndpointId = '';
  selectedPathTemplate = '';
  pathParams: Record<string, string> = {};
  queryParamKeys: string[] = [];
  queryParamValues: string[] = [];
  headerKeys: string[] = [];
  headerValues: string[] = [];
  bodyText = '{}';

  // ── Body autocomplete state ──
  readonly bodyAcSuggestions = signal<{ label: string; insertText: string; detail: string; icon: string }[]>([]);
  readonly bodyAcIndex = signal(0);
  readonly bodyAcStyle = signal<{ [key: string]: string }>({});
  private bodyAcTextarea: HTMLTextAreaElement | null = null;
  // ── Response state ──
  readonly sending = signal(false);
  readonly lastResponse = signal<unknown>(null);
  readonly lastStatus = signal<'success' | 'error' | null>(null);
  readonly lastStatusCode = signal<number | null>(null);
  readonly lastDuration = signal<number | null>(null);
  readonly selectedHistoryId = signal<string | null>(null);
  readonly history = signal<HistoryEntry[]>([]);

  readonly filteredEndpoints = signal<EndpointDef[]>([]);
  readonly pathParamNames = signal<string[]>([]);
  readonly resolvedUrl = signal('');

  private refreshUrl() {
    if (!this.selectedModulePrefix || !this.selectedPathTemplate) { this.resolvedUrl.set(''); return; }
    let path = this.selectedPathTemplate;
    for (const [key, value] of Object.entries(this.pathParams)) {
      if (value) path = path.replace(`:${key}`, value);
    }
    const qp = this.queryParamKeys
      .map((k, i) => k && this.queryParamValues[i] ? `${k}=${this.queryParamValues[i]}` : '')
      .filter(Boolean)
      .join('&');
    this.resolvedUrl.set(`${this.method} /api${this.selectedModulePrefix}${path}${qp ? '?' + qp : ''}`);
  }

  onModuleChange() {
    const mod = MODULES.find(m => m.apiPrefix === this.selectedModulePrefix);
    this.filteredEndpoints.set(mod?.endpoints ?? []);
    this.selectedEndpointId = '';
    this.selectedPathTemplate = '';
    this.pathParams = {};
    this.pathParamNames.set([]);
    this.refreshUrl();
  }

  onEndpointChange() {
    const ep = this.filteredEndpoints().find(e => e.id === this.selectedEndpointId);
    if (ep) {
      this.method = ep.method;
      this.selectedPathTemplate = ep.pathTemplate;
      const matches = this.selectedPathTemplate.match(/:(\w+)/g);
      const names = matches ? matches.map(m => m.slice(1)) : [];
      this.pathParamNames.set(names);
      this.pathParams = {};
      for (const name of names) {
        this.pathParams[name] = '';
      }
      // Auto-generate body from payload template
      if (ep.hasBody) {
        const mod = MODULES.find(m => m.apiPrefix === this.selectedModulePrefix);
        const payload = mod ? getEndpointPayload(mod.id, ep.id) : null;
        this.bodyText = payload ? JSON.stringify(payload, null, 2) : '{\n  \n}';
      }
    }
    this.refreshUrl();
  }

  addQueryParam() {
    this.queryParamKeys.push('');
    this.queryParamValues.push('');
  }

  removeQueryParam(i: number) {
    this.queryParamKeys.splice(i, 1);
    this.queryParamValues.splice(i, 1);
  }

  async sendRequest() {
    if (!this.selectedModulePrefix || !this.selectedPathTemplate) return;

    this.sending.set(true);
    const start = performance.now();

    const qp: Record<string, string> = {};
    this.queryParamKeys.forEach((k, i) => {
      if (k && this.queryParamValues[i]) qp[k] = this.queryParamValues[i];
    });

    try {
      let res: unknown;
      const m = this.method;
      if (m === 'GET') {
        res = await firstValueFrom(
          this.api.get(this.selectedModulePrefix, this.selectedPathTemplate, this.pathParams, qp)
        );
      } else if (m === 'DELETE') {
        res = await firstValueFrom(
          this.api.delete(this.selectedModulePrefix, this.selectedPathTemplate, this.pathParams, qp)
        );
      } else {
        let body: unknown;
        try { body = JSON.parse(this.bodyText); } catch { body = this.bodyText; }
        const apiCallMap: Record<string, typeof this.api.post> = {
          PUT: this.api.put,
          PATCH: this.api.patch,
          POST: this.api.post,
        };
        const call = apiCallMap[m] ?? this.api.post;
        res = await firstValueFrom(
          call.call(this.api, this.selectedModulePrefix, this.selectedPathTemplate, this.pathParams, body)
        );
      }

      const duration = Math.round(performance.now() - start);
      this.lastResponse.set(res);
      this.lastStatus.set('success');
      this.lastStatusCode.set(200);
      this.lastDuration.set(duration);
      this.addToHistory('success', 200, duration, res);
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      const errorData = (err && typeof err === 'object' && 'error' in err)
        ? (err as { error: unknown }).error : err;
      const statusCode = (err && typeof err === 'object' && 'status' in err)
        ? (err as { status: number }).status : undefined;
      this.lastResponse.set(errorData);
      this.lastStatus.set('error');
      this.lastStatusCode.set(statusCode ?? null);
      this.lastDuration.set(duration);
      this.addToHistory('error', statusCode, duration, errorData);
    } finally {
      this.sending.set(false);
    }
  }

  private addToHistory(status: 'success' | 'error', statusCode: number | undefined, duration: number, response: unknown) {
    const entry: HistoryEntry = {
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      method: this.method,
      url: `${this.selectedModulePrefix}${this.selectedPathTemplate}`,
      status,
      statusCode,
      duration,
      timestamp: new Date(),
      response,
    };
    this.history.update(h => [entry, ...h].slice(0, 50));
    this.selectedHistoryId.set(entry.id);
  }

  loadFromHistory(entry: HistoryEntry) {
    this.selectedHistoryId.set(entry.id);
    this.lastResponse.set(entry.response);
    this.lastStatus.set(entry.status);
    this.lastStatusCode.set(entry.statusCode ?? null);
    this.lastDuration.set(entry.duration);
  }

  copyResponse() {
    const text = this.formatJson(this.lastResponse());
    navigator.clipboard.writeText(text);
  }

  // ── Body textarea autocomplete ──────────────────────────────────────────

  onBodyInput(textarea: HTMLTextAreaElement) {
    this.bodyAcTextarea = textarea;
    const cursorPos = textarea.selectionStart ?? 0;
    const textBefore = textarea.value.substring(0, cursorPos);
    const lineStart = textBefore.lastIndexOf('\n') + 1;
    const line = textBefore.substring(lineStart).trimStart();

    // Only suggest when user is typing a JSON key (starts with " but no : yet)
    if (line.startsWith('"') && !line.includes(':')) {
      const partial = line.substring(1).replace(/"$/, '');
      const suggestions = this.buildBodySuggestions(partial);
      if (suggestions.length > 0) {
        this.bodyAcSuggestions.set(suggestions);
        this.bodyAcIndex.set(0);
        const rect = textarea.getBoundingClientRect();
        const lineNumber = textBefore.split('\n').length;
        const lineHeight = Number.parseFloat(getComputedStyle(textarea).lineHeight) || 18;
        const paddingTop = Number.parseFloat(getComputedStyle(textarea).paddingTop) || 8;
        let top = rect.top + paddingTop + lineNumber * lineHeight + 4;
        const maxTop = window.innerHeight - 240;
        if (top > maxTop) top = maxTop;
        this.bodyAcStyle.set({
          top: top + 'px',
          left: rect.left + 'px',
          width: Math.max(rect.width, 260) + 'px',
        });
        return;
      }
    }

    this.bodyAcSuggestions.set([]);
  }

  private buildBodySuggestions(filter: string): { label: string; insertText: string; detail: string; icon: string }[] {
    const mod = MODULES.find(m => m.apiPrefix === this.selectedModulePrefix);
    const ep = this.filteredEndpoints().find(e => e.id === this.selectedEndpointId);
    if (!mod || !ep) return [];

    const inputSchema = getEndpointInputSchema(mod.id, ep.id);
    const entries = inputSchema ? Object.entries(inputSchema) : [];
    if (entries.length === 0) {
      const payload = getEndpointPayload(mod.id, ep.id) as Record<string, unknown> | null;
      if (payload) entries.push(...Object.entries(payload));
    }

    return entries
      .filter(([key]) => !filter || key.toLowerCase().includes(filter.toLowerCase()))
      .map(([key, val]) => ({
        label: key,
        insertText: `"${key}": ${this.jsonDefaultValue(val)}`,
        detail: this.jsonTypeName(val),
        icon: 'data_object',
      }))
      .slice(0, 20);
  }

  private jsonTypeName(val: unknown): string {
    if (Array.isArray(val)) return 'array';
    if (typeof val === 'object' && val !== null) return 'object';
    if (typeof val === 'number') return 'number';
    if (typeof val === 'boolean') return 'boolean';
    return 'string';
  }

  private jsonDefaultValue(val: unknown): string {
    if (val === null) return 'null';
    if (typeof val === 'string') return '""';
    if (typeof val === 'number') return '0';
    if (typeof val === 'boolean') return 'false';
    return JSON.stringify(val, null, 2);
  }

  onBodyAcKeydown(event: KeyboardEvent) {
    const list = this.bodyAcSuggestions();
    if (list.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.bodyAcIndex.update(i => Math.min(i + 1, list.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.bodyAcIndex.update(i => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      this.insertBodyAcSuggestion(list[this.bodyAcIndex()]);
    } else if (event.key === 'Escape') {
      this.bodyAcSuggestions.set([]);
    }
  }

  insertBodyAcSuggestion(suggestion: { insertText: string }, event?: MouseEvent) {
    if (event) event.preventDefault();
    const ta = this.bodyAcTextarea;
    if (!ta) { this.bodyAcSuggestions.set([]); return; }

    const pos = ta.selectionStart ?? 0;
    const text = ta.value;
    const before = text.substring(0, pos);
    const lineStart = before.lastIndexOf('\n') + 1;
    const indent = /^(\s*)/.exec(before.substring(lineStart))?.[1] ?? '';
    const after = text.substring(pos);

    // Replace current line content from the opening quote
    const quoteStart = before.lastIndexOf('"', pos - 1);
    const lineEnd = after.indexOf('\n');
    const replaceEnd = lineEnd >= 0 ? pos + lineEnd : text.length;

    const newText = text.substring(0, quoteStart >= lineStart ? quoteStart : lineStart + indent.length) +
      suggestion.insertText +
      text.substring(replaceEnd);
    ta.value = newText;
    this.bodyText = newText;

    const cursorPos = (quoteStart >= lineStart ? quoteStart : lineStart + indent.length) + suggestion.insertText.length;
    ta.setSelectionRange(cursorPos, cursorPos);
    this.bodyAcSuggestions.set([]);
    ta.focus();
  }

  closeBodyAc() {
    setTimeout(() => { this.bodyAcSuggestions.set([]); this.bodyAcTextarea = null; }, 150);
  }

  formatJson(data: unknown): string {
    if (data == null) return '';
    if (typeof data === 'string') return data;
    try { return JSON.stringify(data, null, 2); } catch { return '[unserializable]'; }
  }
}
