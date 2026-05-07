import { Component, inject, signal, computed, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ApplicationService } from '../../services/application.service';
import { ApplicationDefinition, AppPage, AppNavigation } from '../../config/application.types';
import { ShareService } from '../../services/share.service';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { FormService } from '../../services/form.service';
import { DashboardService } from '../../services/dashboard.service';
import { WorkflowService } from '../../services/workflow.service';

@Component({
  selector: 'app-application-viewer',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule,
    MatDividerModule, MatTabsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSlideToggleModule, MatSidenavModule,
  ],
  template: `
    @if (loading()) {
      <div class="app-loading">
        <mat-spinner diameter="48" />
        <p>Loading application...</p>
      </div>
    } @else if (error()) {
      <div class="app-error">
        <mat-icon>error_outline</mat-icon>
        <h2>Application not found</h2>
        <p>{{ error() }}</p>
      </div>
    } @else if (app()) {
      <div class="app-shell" [class.nav-sidebar]="navStyle() === 'sidebar'" [class.nav-tabs]="navStyle() === 'tabs'" [class.nav-topbar]="navStyle() === 'top-bar'">

        <!-- ═══ SIDEBAR NAV ═══ -->
        @if (navStyle() === 'sidebar') {
          <div class="app-sidebar">
            <div class="app-sidebar-header">
              <mat-icon>apps</mat-icon>
              <span class="app-sidebar-title">{{ app()!.name }}</span>
            </div>
            <div class="app-sidebar-nav">
              @for (page of app()!.pages; track page.id) {
                <button class="sidebar-nav-item"
                        [class.active]="activePageId() === page.id"
                        (click)="navigateTo(page.id)">
                  <mat-icon>{{ page.icon || 'article' }}</mat-icon>
                  <span>{{ page.label }}</span>
                </button>
              }
            </div>
          </div>
        }

        <div class="app-main">
          <!-- ═══ TOP BAR NAV ═══ -->
          @if (navStyle() === 'top-bar') {
            <div class="app-topbar">
              <mat-icon class="topbar-logo">apps</mat-icon>
              <span class="topbar-title">{{ app()!.name }}</span>
              <div class="topbar-nav">
                @for (page of app()!.pages; track page.id) {
                  <button class="topbar-nav-item"
                          [class.active]="activePageId() === page.id"
                          (click)="navigateTo(page.id)">
                    <mat-icon>{{ page.icon || 'article' }}</mat-icon>
                    {{ page.label }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- ═══ TABS NAV ═══ -->
          @if (navStyle() === 'tabs') {
            <div class="app-tabs-bar">
              <span class="tabs-title">{{ app()!.name }}</span>
              <div class="tabs-row">
                @for (page of app()!.pages; track page.id) {
                  <button class="tab-item"
                          [class.active]="activePageId() === page.id"
                          (click)="navigateTo(page.id)">
                    <mat-icon>{{ page.icon || 'article' }}</mat-icon>
                    {{ page.label }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- ═══ PAGE CONTENT ═══ -->
          <div class="app-page-content">
            @if (pageLoading()) {
              <div class="page-loading">
                <mat-spinner diameter="36" />
              </div>
            } @else if (activePage(); as page) {
              @if (!pageData()) {
                <div class="page-empty">
                  <mat-icon>cloud_off</mat-icon>
                  <p>No data found for this {{ page.type }}</p>
                </div>
              } @else {
                <!-- ═══ FORM RENDERER ═══ -->
                @if (page.type === 'form') {
                  <div class="form-view">
                    <h2 class="page-view-title">{{ getDataProp('name') }}</h2>
                    @if (getDataProp('description')) {
                      <p class="page-view-desc">{{ getDataProp('description') }}</p>
                    }
                    <div class="form-fields-grid">
                      @for (field of getFormFields(); track field['id']) {
                        <div class="form-field-item"
                             [style.grid-column]="'span ' + (field['width'] || 6)">
                          <label class="form-field-label">{{ field['label'] || field['id'] }}</label>
                          @if (field['kind'] === 'label') {
                            <div class="form-field-value">{{ fieldValues()[field['id']] || '—' }}</div>
                          } @else if (field['kind'] === 'boolean') {
                            <mat-slide-toggle
                              [checked]="fieldValues()[field['id']] === true || fieldValues()[field['id']] === 'true'"
                              (change)="setFieldValue(field['id'], $event.checked)">
                            </mat-slide-toggle>
                          } @else if (field['kind'] === 'select') {
                            <mat-form-field appearance="outline" class="full-width">
                              <mat-select [value]="fieldValues()[field['id']] || ''"
                                          (selectionChange)="setFieldValue(field['id'], $event.value)">
                                @for (opt of getSelectOptions(field); track opt.value) {
                                  <mat-option [value]="opt.value">{{ opt.display }}</mat-option>
                                }
                              </mat-select>
                            </mat-form-field>
                          } @else if (field['kind'] === 'datatable') {
                            <div class="mini-table">
                              <p style="color:#94a3b8;font-size:12px">Data table</p>
                            </div>
                          } @else {
                            <mat-form-field appearance="outline" class="full-width">
                              <input matInput
                                     [type]="field['kind'] === 'number' ? 'number' : field['kind'] === 'date' ? 'date' : 'text'"
                                     [value]="fieldValues()[field['id']] || ''"
                                     (input)="setFieldValue(field['id'], $any($event.target).value)"
                                     [placeholder]="field['placeholder'] || ''" />
                            </mat-form-field>
                          }
                        </div>
                      }
                    </div>
                    @if (getFormActions().length > 0) {
                      <div class="form-actions-bar">
                        @for (action of getFormActions(); track action['id']) {
                          <button mat-flat-button color="primary" (click)="executeFormAction(action)">
                            {{ action['label'] || 'Submit' }}
                          </button>
                        }
                      </div>
                    }
                  </div>
                }

                <!-- ═══ DASHBOARD RENDERER ═══ -->
                @if (page.type === 'dashboard') {
                  <div class="dashboard-view">
                    <h2 class="page-view-title">{{ getDataProp('name') }}</h2>
                    <div class="widget-grid">
                      @for (widget of getDashboardWidgets(); track widget['id']) {
                        <div class="widget-card"
                             [style.grid-column]="'span ' + (widget['width'] || 4)"
                             [style.grid-row]="'span ' + (widget['height'] || 2)">
                          <div class="widget-header">
                            <mat-icon>
                              @if (widget['kind'] === 'line-chart') { show_chart }
                              @else if (widget['kind'] === 'bar-chart') { bar_chart }
                              @else if (widget['kind'] === 'pie-chart') { pie_chart }
                              @else if (widget['kind'] === 'badge') { tag }
                              @else { table_chart }
                            </mat-icon>
                            <span>{{ widget['label'] || widget['kind'] }}</span>
                          </div>
                          <div class="widget-body">
                            @if (widget['kind'] === 'badge') {
                              <div class="badge-value">—</div>
                            } @else {
                              <div class="widget-placeholder">
                                <mat-icon style="font-size:32px;width:32px;height:32px;color:#cbd5e1">
                                  @if (widget['kind'] === 'data-table') { table_chart }
                                  @else { insights }
                                </mat-icon>
                              </div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- ═══ WORKFLOW RENDERER ═══ -->
                @if (page.type === 'workflow') {
                  <div class="workflow-view">
                    <h2 class="page-view-title">{{ getDataProp('name') }}</h2>
                    @if (getDataProp('description')) {
                      <p class="page-view-desc">{{ getDataProp('description') }}</p>
                    }
                    <div class="workflow-info">
                      <mat-icon>account_tree</mat-icon>
                      <span>{{ getWorkflowSteps().length }} step{{ getWorkflowSteps().length === 1 ? '' : 's' }}</span>
                      <span class="workflow-status">{{ getDataProp('status') }}</span>
                    </div>
                    @if (getWorkflowInputs().length > 0) {
                      <div class="workflow-inputs">
                        <h3>Inputs</h3>
                        @for (input of getWorkflowInputs(); track input['name']) {
                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>{{ input['name'] }}</mat-label>
                            <input matInput
                                   [value]="workflowInputValues()[input['name']] || input['defaultValue'] || ''"
                                   (input)="setWorkflowInput(input['name'], $any($event.target).value)" />
                          </mat-form-field>
                        }
                      </div>
                    }
                    <button mat-flat-button color="primary" (click)="runWorkflow()" [disabled]="workflowRunning()">
                      <mat-icon>{{ workflowRunning() ? 'hourglass_empty' : 'play_arrow' }}</mat-icon>
                      {{ workflowRunning() ? 'Running...' : 'Run Workflow' }}
                    </button>
                  </div>
                }
              }
            } @else {
              <div class="page-empty">
                <mat-icon>apps</mat-icon>
                <p>Select a page from the navigation</p>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; height: 100%; }

    /* Loading / Error */
    .app-loading, .app-error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #64748b; }
    .app-error mat-icon { font-size: 48px; width: 48px; height: 48px; color: #f87171; }
    .app-error h2 { margin: 12px 0 4px; }

    /* Shell */
    .app-shell { display: flex; height: 100%; }
    .app-shell.nav-sidebar { flex-direction: row; }
    .app-shell.nav-tabs, .app-shell.nav-topbar { flex-direction: column; }

    /* Sidebar nav */
    .app-sidebar {
      width: 240px; flex-shrink: 0; background: #1e293b; color: #e2e8f0;
      display: flex; flex-direction: column;
    }
    .app-sidebar-header {
      display: flex; align-items: center; gap: 10px; padding: 16px;
      font-weight: 600; font-size: 15px; border-bottom: 1px solid #334155;
    }
    .app-sidebar-header mat-icon { color: #818cf8; }
    .app-sidebar-nav { flex: 1; overflow-y: auto; padding: 8px; }
    .sidebar-nav-item {
      display: flex; align-items: center; gap: 10px; width: 100%;
      padding: 10px 14px; border: none; background: transparent;
      color: #94a3b8; font-size: 13px; cursor: pointer; border-radius: 8px;
      transition: background 0.1s, color 0.1s; text-align: left;
    }
    .sidebar-nav-item:hover { background: #334155; color: #e2e8f0; }
    .sidebar-nav-item.active { background: #4f46e5; color: #fff; }
    .sidebar-nav-item mat-icon { font-size: 20px; width: 20px; height: 20px; }

    /* Top bar nav */
    .app-topbar {
      display: flex; align-items: center; gap: 12px; padding: 0 20px;
      height: 52px; background: #1e293b; color: #e2e8f0; flex-shrink: 0;
    }
    .topbar-logo { color: #818cf8; }
    .topbar-title { font-weight: 600; font-size: 15px; margin-right: 24px; }
    .topbar-nav { display: flex; gap: 4px; }
    .topbar-nav-item {
      display: flex; align-items: center; gap: 6px; padding: 8px 14px;
      border: none; background: transparent; color: #94a3b8; font-size: 13px;
      cursor: pointer; border-radius: 6px; transition: background 0.1s;
    }
    .topbar-nav-item:hover { background: #334155; color: #e2e8f0; }
    .topbar-nav-item.active { background: #4f46e5; color: #fff; }
    .topbar-nav-item mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* Tabs nav */
    .app-tabs-bar {
      display: flex; flex-direction: column; background: #fff;
      border-bottom: 1px solid #e2e8f0; flex-shrink: 0;
    }
    .tabs-title { padding: 12px 20px 0; font-weight: 600; font-size: 15px; color: #1e293b; }
    .tabs-row { display: flex; padding: 0 16px; gap: 0; }
    .tab-item {
      display: flex; align-items: center; gap: 6px; padding: 10px 16px;
      border: none; background: transparent; color: #64748b; font-size: 13px;
      cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.1s;
    }
    .tab-item:hover { color: #1e293b; }
    .tab-item.active { color: #4f46e5; border-bottom-color: #4f46e5; }
    .tab-item mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* Main content */
    .app-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
    .app-page-content { flex: 1; overflow-y: auto; padding: 24px; }

    /* Page states */
    .page-loading { display: flex; align-items: center; justify-content: center; height: 200px; }
    .page-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: #94a3b8; }
    .page-empty mat-icon { font-size: 48px; width: 48px; height: 48px; color: #cbd5e1; }

    /* Common page view */
    .page-view-title { margin: 0 0 4px; font-size: 20px; font-weight: 600; color: #1e293b; }
    .page-view-desc { margin: 0 0 16px; color: #64748b; font-size: 13px; }
    .full-width { width: 100%; }

    /* Form view */
    .form-view { max-width: 900px; }
    .form-fields-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 12px 16px; margin-top: 16px; }
    .form-field-item { display: flex; flex-direction: column; }
    .form-field-label { font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px; }
    .form-field-value { font-size: 14px; color: #1e293b; padding: 8px 0; }
    .form-actions-bar { display: flex; gap: 8px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0; }

    /* Dashboard view */
    .dashboard-view { }
    .widget-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; margin-top: 16px; }
    .widget-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
      display: flex; flex-direction: column; overflow: hidden;
    }
    .widget-header {
      display: flex; align-items: center; gap: 8px; padding: 10px 14px;
      font-size: 13px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;
    }
    .widget-header mat-icon { font-size: 18px; width: 18px; height: 18px; color: #6366f1; }
    .widget-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .widget-placeholder { text-align: center; }
    .badge-value { font-size: 28px; font-weight: 700; color: #6366f1; }

    /* Workflow view */
    .workflow-view { max-width: 700px; }
    .workflow-info {
      display: flex; align-items: center; gap: 8px; padding: 12px 0; font-size: 13px; color: #64748b;
    }
    .workflow-info mat-icon { color: #6366f1; }
    .workflow-status { padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; background: #f1f5f9; text-transform: uppercase; }
    .workflow-inputs { margin: 12px 0; }
    .workflow-inputs h3 { font-size: 13px; font-weight: 600; color: #475569; margin: 0 0 8px; }

    /* Dark mode */
    :host-context(.dark-mode) .app-tabs-bar { background: #1e293b; border-color: #334155; }
    :host-context(.dark-mode) .tabs-title { color: #e2e8f0; }
    :host-context(.dark-mode) .tab-item { color: #94a3b8; }
    :host-context(.dark-mode) .tab-item:hover { color: #e2e8f0; }
    :host-context(.dark-mode) .tab-item.active { color: #818cf8; border-bottom-color: #818cf8; }
    :host-context(.dark-mode) .page-view-title { color: #e2e8f0; }
    :host-context(.dark-mode) .widget-card { background: #1e293b; border-color: #334155; }
    :host-context(.dark-mode) .widget-header { color: #e2e8f0; border-color: #334155; }
    :host-context(.dark-mode) .form-field-label { color: #94a3b8; }
    :host-context(.dark-mode) .form-field-value { color: #e2e8f0; }
  `],
})
export class ApplicationViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appSvc = inject(ApplicationService);
  private readonly formSvc = inject(FormService);
  private readonly dashSvc = inject(DashboardService);
  private readonly wfSvc = inject(WorkflowService);
  private readonly shareSvc = inject(ShareService);
  private readonly api = inject(ApiService);

  /** When set externally, the viewer skips route-param loading and uses this definition directly. */
  @Input() appDefinition?: ApplicationDefinition;

  loading = signal(true);
  error = signal('');
  app = signal<ApplicationDefinition | null>(null);
  activePageId = signal<string | null>(null);
  pageLoading = signal(false);
  pageData = signal<Record<string, unknown> | null>(null);

  // Form state
  fieldValues = signal<Record<string, unknown>>({});

  // Workflow state
  workflowInputValues = signal<Record<string, string>>({});
  workflowRunning = signal(false);

  /** Whether this is a shared/public view (loaded via share token) */
  private isSharedView = false;

  navStyle = computed(() => this.app()?.navigation?.style ?? 'sidebar');

  activePage = computed(() => {
    const id = this.activePageId();
    return id ? this.app()?.pages.find(p => p.id === id) ?? null : null;
  });

  ngOnInit() {
    // If an appDefinition was passed via @Input, use it directly
    if (this.appDefinition) {
      this.app.set(this.appDefinition);
      this.loading.set(false);
      this.navigateToHome();
      return;
    }

    const token = this.route.snapshot.paramMap.get('token');
    const id = this.route.snapshot.paramMap.get('id');

    if (token) {
      // Loaded via shared link
      this.isSharedView = true;
      this.loadFromShareToken(token);
    } else if (id) {
      // Loaded directly (authenticated)
      this.loadFromService(id);
    } else {
      this.loading.set(false);
      this.error.set('No application ID provided');
    }
  }

  private loadFromService(id: string) {
    const existing = this.appSvc.getById(id);
    if (existing) {
      this.app.set(existing);
      this.loading.set(false);
      this.navigateToHome();
    } else {
      this.loading.set(false);
      this.error.set('Application not found');
    }
  }

  private async loadFromShareToken(token: string) {
    try {
      const shared = await this.shareSvc.resolvePublic(token);
      if (shared.itemType !== 'application') {
        this.error.set('This share link is not for an application');
        return;
      }
      const data = shared.data as Record<string, unknown>;
      const appDef: ApplicationDefinition = {
        id: data['id'] as string,
        name: data['name'] as string,
        description: data['description'] as string,
        pages: (data['pages'] ?? []) as AppPage[],
        navigation: (data['navigation'] ?? { style: 'sidebar' }) as AppNavigation,
        status: (data['status'] as 'draft' | 'published') ?? 'published',
      };
      this.app.set(appDef);
      this.navigateToHome();
    } catch {
      this.error.set('Application not found or link expired');
    } finally {
      this.loading.set(false);
    }
  }

  private navigateToHome() {
    const appDef = this.app();
    if (!appDef || appDef.pages.length === 0) return;
    const homeId = appDef.navigation?.homePage ?? appDef.pages[0].id;
    this.navigateTo(homeId);
  }

  async navigateTo(pageId: string) {
    this.activePageId.set(pageId);
    const page = this.app()?.pages.find(p => p.id === pageId);
    if (!page?.itemId) {
      this.pageData.set(null);
      return;
    }

    this.pageLoading.set(true);
    try {
      let data: Record<string, unknown> | null = null;

      // Check pre-resolved data first (available in shared/public views)
      const resolved = this.app()?.resolvedPages?.[page.itemId];
      if (resolved) {
        data = resolved;
      } else if (page.type === 'form') {
        const form = this.formSvc.getById(page.itemId);
        if (form) {
          data = form as unknown as Record<string, unknown>;
        } else {
          const res = await firstValueFrom(this.api.get('/forms', '/:id', { id: page.itemId }));
          data = res as Record<string, unknown>;
        }
      } else if (page.type === 'dashboard') {
        const dash = this.dashSvc.dashboards().find(d => d.id === page.itemId);
        if (dash) {
          data = dash as unknown as Record<string, unknown>;
        } else {
          const res = await firstValueFrom(this.api.get('/dashboards', '/:id', { id: page.itemId }));
          data = res as Record<string, unknown>;
        }
      } else if (page.type === 'workflow') {
        const wf = this.wfSvc.workflows().find(w => w.id === page.itemId);
        if (wf) {
          data = wf as unknown as Record<string, unknown>;
        } else {
          const res = await firstValueFrom(this.api.get('/workflows', '/:id', { id: page.itemId }));
          data = res as Record<string, unknown>;
        }
      }

      // Init form field values
      if (data && page.type === 'form') {
        const fields = (data['fields'] ?? []) as Record<string, unknown>[];
        const vals: Record<string, unknown> = {};
        for (const f of fields) {
          vals[f['id'] as string] = '';
        }
        this.fieldValues.set(vals);
      }

      // Init workflow input values
      if (data && page.type === 'workflow') {
        const inputs = (data['inputs'] ?? []) as Record<string, unknown>[];
        const vals: Record<string, string> = {};
        for (const inp of inputs) {
          vals[inp['name'] as string] = (inp['defaultValue'] as string) ?? '';
        }
        this.workflowInputValues.set(vals);
      }

      this.pageData.set(data);
    } catch (err) {
      console.error('Failed to load page data', err);
      this.pageData.set(null);
    } finally {
      this.pageLoading.set(false);
    }
  }

  // ── Data accessors ──────────────────────────────────────────────────────────

  getDataProp(key: string): string {
    return (this.pageData()?.[key] as string) ?? '';
  }

  getFormFields(): Record<string, any>[] {
    return ((this.pageData()?.['fields'] ?? []) as Record<string, any>[])
      .sort((a, b) => ((a['y'] as number) ?? 0) - ((b['y'] as number) ?? 0) || ((a['x'] as number) ?? 0) - ((b['x'] as number) ?? 0));
  }

  getFormActions(): Record<string, any>[] {
    return (this.pageData()?.['submitActions'] ?? []) as Record<string, any>[];
  }

  getSelectOptions(field: Record<string, any>): { display: string; value: string }[] {
    if (field['options']) {
      return (field['options'] as string).split(',').map(o => ({ display: o.trim(), value: o.trim() }));
    }
    return [];
  }

  getDashboardWidgets(): Record<string, any>[] {
    return (this.pageData()?.['widgets'] ?? []) as Record<string, any>[];
  }

  getWorkflowSteps(): Record<string, any>[] {
    return (this.pageData()?.['steps'] ?? []) as Record<string, any>[];
  }

  getWorkflowInputs(): Record<string, any>[] {
    return (this.pageData()?.['inputs'] ?? []) as Record<string, any>[];
  }

  // ── Form interactions ───────────────────────────────────────────────────────

  setFieldValue(fieldId: string, value: unknown) {
    this.fieldValues.update(fv => ({ ...fv, [fieldId]: value }));
  }

  async executeFormAction(action: Record<string, any>) {
    // Placeholder: in a real app, this would call the API or run a script
    console.log('Executing form action:', action['label'], this.fieldValues());
  }

  // ── Workflow interactions ───────────────────────────────────────────────────

  setWorkflowInput(name: string, value: string) {
    this.workflowInputValues.update(iv => ({ ...iv, [name]: value }));
  }

  async runWorkflow() {
    this.workflowRunning.set(true);
    try {
      const page = this.activePage();
      if (!page) return;
      // Execute via API
      await firstValueFrom(
        this.api.post('/workflows', '/:id/execute', { id: page.itemId }, {
          inputValues: this.workflowInputValues(),
        })
      );
    } catch (err) {
      console.error('Workflow execution failed', err);
    } finally {
      this.workflowRunning.set(false);
    }
  }
}
