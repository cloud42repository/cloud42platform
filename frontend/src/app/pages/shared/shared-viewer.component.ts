import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ShareService, SharedItemData } from '../../services/share.service';
import { WorkflowService } from '../../services/workflow.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { ApiService } from '../../services/api.service';
import type { Dashboard, DashboardWidget } from '../../config/dashboard.types';
import type { WorkflowNode, WorkflowStep, TryCatchBlock, LoopBlock, IfElseBlock, MapperBlock, FilterBlock, SubWorkflowBlock, WorkflowRunLog, WorkflowInput, WorkflowOutput } from '../../config/workflow.types';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDividerModule, MatTooltipModule,
    MatFormFieldModule, MatSelectModule,
    TranslatePipe,
  ],
  template: `
    @if (loading()) {
      <div class="shared-loading">
        <mat-spinner diameter="48" />
        <p>{{ 'shared.loading' | t }}</p>
      </div>
    } @else if (error()) {
      <div class="shared-error">
        <mat-icon>link_off</mat-icon>
        <h2>{{ 'shared.not-found' | t }}</h2>
        <p>{{ error() }}</p>
      </div>
    } @else if (data()) {
      <div class="shared-shell">
        <div class="shared-toolbar">
          <mat-icon class="shared-icon">
            @if (data()!.itemType === 'dashboard') { dashboard }
            @else if (data()!.itemType === 'form') { edit_note }
            @else { account_tree }
          </mat-icon>
          <span class="shared-title">{{ itemName() }}</span>
          <span class="shared-badge">{{ data()!.itemType | uppercase }}</span>
          <span class="shared-badge shared-badge--readonly">{{ 'shared.read-only' | t }}</span>
          <span class="spacer"></span>
        </div>

        <!-- ═══ DASHBOARD ═══ -->
        @if (data()!.itemType === 'dashboard') {
          <div class="dashboard-preview">
            <div class="canvas-area">
              @for (widget of dashboardWidgets(); track widget.id) {
                <div class="widget-card"
                     [style.grid-column]="'span ' + widget.width"
                     [style.grid-row]="'span ' + widget.height">
                  <div class="widget-header">
                    <mat-icon class="widget-type-icon">
                      @if (widget.kind === 'search-text') { search }
                      @else if (widget.kind === 'line-chart') { show_chart }
                      @else if (widget.kind === 'bar-chart') { bar_chart }
                      @else if (widget.kind === 'pie-chart') { pie_chart }
                      @else if (widget.kind === 'badge') { tag }
                      @else { table_chart }
                    </mat-icon>
                    <span class="widget-title">{{ widget.label || widget.kind }}</span>
                    @if (widget.dataSource && widget.kind !== 'search-text') {
                      <button mat-icon-button class="widget-refresh-btn" (click)="refreshWidget(widget)" matTooltip="Refresh data">
                        <mat-icon>refresh</mat-icon>
                      </button>
                    }
                  </div>
                  <div class="widget-body">
                    @if (widget.kind === 'search-text') {
                      <div class="search-widget">
                        <mat-icon>search</mat-icon>
                        <input class="search-input" type="text"
                               [value]="searchFilter()"
                               (input)="searchFilter.set($any($event.target).value)"
                               placeholder="{{ widget.label || 'Search...' }}" />
                        @if (searchFilter()) {
                          <button class="search-clear" (click)="searchFilter.set('')">
                            <mat-icon>close</mat-icon>
                          </button>
                        }
                      </div>
                    } @else if (!widget.dataSource) {
                      <div class="no-data"><mat-icon>cloud_off</mat-icon> {{ 'shared.no-data-source' | t }}</div>
                    } @else if (widget.kind === 'badge') {
                      <div class="badge-vis">
                        <div class="badge-value">{{ getBadgeValue(widget) }}</div>
                        <div class="badge-label">{{ (widget.bindings['aggregation'] || 'count') | uppercase }}@if (widget.bindings['valueField']) { · {{ widget.bindings['valueField'] }} }</div>
                      </div>
                    } @else if (widget.kind === 'data-table' && widget.lastData) {
                      <div class="table-container">
                        <table class="data-table">
                          <thead>
                            <tr>
                              @for (col of getTableColumns(widget); track col) {
                                <th>{{ col }}</th>
                              }
                            </tr>
                          </thead>
                          <tbody>
                            @for (row of getTableRows(widget); track $index) {
                              <tr>
                                @for (col of getTableColumns(widget); track col) {
                                  <td>{{ row[col] }}</td>
                                }
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    } @else if ((widget.kind === 'line-chart' || widget.kind === 'bar-chart' || widget.kind === 'pie-chart') && widget.lastData) {

                      <!-- LINE CHART -->
                      @if (widget.kind === 'line-chart') {
                        <div class="chart-container">
                          <svg [attr.viewBox]="'0 0 400 200'" class="line-chart-svg" preserveAspectRatio="xMidYMid meet">
                            <line x1="40" y1="10" x2="40" y2="170" stroke="#e2e8f0" stroke-width="1" />
                            <line x1="40" y1="170" x2="390" y2="170" stroke="#e2e8f0" stroke-width="1" />
                            @for (gl of [0.25, 0.5, 0.75]; track gl) {
                              <line [attr.x1]="40" [attr.y1]="170 - 160 * gl" [attr.x2]="390" [attr.y2]="170 - 160 * gl" stroke="#f1f5f9" stroke-width="1" />
                            }
                            <polyline [attr.points]="getLineChartPoints(widget)" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                            <polygon [attr.points]="getLineChartArea(widget)" fill="rgba(37,99,235,0.08)" />
                            @for (pt of getLineChartDots(widget); track $index) {
                              <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3.5" fill="#2563eb" stroke="white" stroke-width="1.5" />
                              <text [attr.x]="pt.x" [attr.y]="pt.y - 8" text-anchor="middle" class="chart-dot-label">{{ pt.val }}</text>
                            }
                            @for (lbl of getLineChartLabels(widget); track $index) {
                              <text [attr.x]="lbl.x" y="186" text-anchor="middle" class="chart-axis-label">{{ lbl.text }}</text>
                            }
                          </svg>
                        </div>
                      }

                      <!-- BAR CHART -->
                      @if (widget.kind === 'bar-chart') {
                        <div class="chart-container">
                          <svg [attr.viewBox]="'0 0 400 220'" class="bar-chart-svg" preserveAspectRatio="xMidYMid meet">
                            <line x1="40" y1="10" x2="40" y2="180" stroke="#e2e8f0" stroke-width="1" />
                            <line x1="40" y1="180" x2="390" y2="180" stroke="#e2e8f0" stroke-width="1" />
                            @for (gl of [0.25, 0.5, 0.75]; track gl) {
                              <line [attr.x1]="40" [attr.y1]="180 - 170 * gl" [attr.x2]="390" [attr.y2]="180 - 170 * gl" stroke="#f1f5f9" stroke-width="1" />
                            }
                            @for (bar of getBarChartBars(widget); track $index) {
                              <rect [attr.x]="bar.x" [attr.y]="bar.y" [attr.width]="bar.width" [attr.height]="bar.height" [attr.fill]="bar.color" rx="3" />
                              <text [attr.x]="bar.x + bar.width / 2" [attr.y]="bar.y - 5" text-anchor="middle" class="chart-dot-label">{{ bar.val }}</text>
                            }
                            @for (lbl of getBarChartLabels(widget); track $index) {
                              <text [attr.x]="lbl.x" y="196" text-anchor="middle" class="chart-axis-label">{{ lbl.text }}</text>
                            }
                          </svg>
                        </div>
                      }

                      <!-- PIE CHART -->
                      @if (widget.kind === 'pie-chart') {
                        <div class="chart-container pie-container">
                          <svg viewBox="0 0 300 220" class="pie-chart-svg" preserveAspectRatio="xMidYMid meet">
                            @for (slice of getPieSlices(widget); track $index) {
                              <path [attr.d]="slice.d" [attr.fill]="slice.color" stroke="white" stroke-width="2" />
                            }
                          </svg>
                          <div class="pie-legend">
                            @for (slice of getPieSlices(widget); track $index) {
                              <div class="pie-legend-item">
                                <span class="pie-dot" [style.background]="slice.color"></span>
                                <span class="pie-label-text">{{ slice.label }}</span>
                                <span class="pie-value-text">{{ slice.value }}</span>
                              </div>
                            }
                          </div>
                        </div>
                      }
                    } @else {
                      <div class="no-data"><mat-icon>hourglass_empty</mat-icon> {{ 'shared.loading-data' | t }}</div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- ═══ FORM ═══ -->
        @if (data()!.itemType === 'form') {
          <div class="form-preview">
            <div class="canvas-area form-canvas">
              @for (field of formFields(); track field.id) {
                <div class="field-card"
                     [style.grid-column]="'span ' + (field.width || 6)"
                     [style.grid-row]="'span ' + (field.height || 1)">
                  <div class="field-header">
                    <mat-icon class="field-type-icon">
                      @if (field.kind === 'text') { text_fields }
                      @else if (field.kind === 'date') { calendar_today }
                      @else if (field.kind === 'select') { arrow_drop_down_circle }
                      @else { table_chart }
                    </mat-icon>
                    <span class="field-title">{{ field.label || field.kind }}</span>
                    @if (field.required) { <span class="required-mark">*</span> }
                    @if (field.dataSource) {
                      <button mat-icon-button class="widget-refresh-btn" (click)="refreshFieldData(field)" matTooltip="Refresh data">
                        <mat-icon>refresh</mat-icon>
                      </button>
                    }
                  </div>
                  <div class="field-preview">
                    @if (field.kind === 'text') {
                      <input type="text" class="preview-text-input"
                             [placeholder]="field.placeholder || field.label || 'Text input'"
                             [value]="getFieldValue(field.id)"
                             (input)="setFieldValue(field.id, $any($event.target).value)" />
                    }
                    @if (field.kind === 'date') {
                      <input type="date" class="preview-text-input"
                             [value]="getFieldValue(field.id)"
                             (input)="setFieldValue(field.id, $any($event.target).value)" />
                    }
                    @if (field.kind === 'select') {
                      <mat-form-field appearance="outline" class="preview-select-field">
                        <mat-select [value]="getFieldValue(field.id)"
                                    (selectionChange)="setFieldValue(field.id, $event.value)"
                                    [placeholder]="field.placeholder || 'Select…'">
                          @for (opt of getSelectOptions(field); track $index) {
                            <mat-option [value]="opt.value">{{ opt.display }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                      @if (field.dataSource) {
                        <span class="data-source-tag">
                          <mat-icon style="font-size:12px;width:12px;height:12px">cloud</mat-icon>
                          {{ field.dataSource.moduleLabel }} › {{ field.dataSource.endpointLabel }}
                        </span>
                      }
                    }
                    @if (field.kind === 'datatable') {
                      @if (field.dataSource) {
                        <span class="data-source-tag">
                          <mat-icon style="font-size:12px;width:12px;height:12px">cloud</mat-icon>
                          {{ field.dataSource.moduleLabel }} › {{ field.dataSource.endpointLabel }}
                        </span>
                      }
                      @if (field.lastData) {
                        <div class="table-container">
                          <table class="data-table">
                            <thead>
                              <tr>
                                @for (col of getFormTableColumns(field); track col) {
                                  <th>{{ col }}</th>
                                }
                              </tr>
                            </thead>
                            <tbody>
                              @for (row of getFormTableRows(field); track $index) {
                                <tr>
                                  @for (col of getFormTableColumns(field); track col) {
                                    <td>{{ row[col] }}</td>
                                  }
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      } @else if (!field.dataSource) {
                        <div class="no-data"><mat-icon>cloud_off</mat-icon> No data source</div>
                      } @else {
                        <div class="no-data"><mat-icon>hourglass_empty</mat-icon> Loading…</div>
                      }
                    }
                  </div>
                </div>
              }

              <!-- Submit actions -->
              <div class="submit-row" [style.grid-column]="'1 / -1'">
                @if (formActions().length > 0) {
                  @for (action of formActions(); track action.id) {
                    <button mat-flat-button [color]="action.color || 'primary'"
                            (click)="executeFormAction(action)"
                            [disabled]="formExecuting()"
                            class="action-run-btn">
                      @if (formExecuting()) { <mat-spinner diameter="16" /> }
                      @else { <mat-icon>send</mat-icon> }
                      {{ action.label || action.method }}
                    </button>
                  }
                } @else {
                  <button mat-flat-button color="primary"
                          (click)="submitForm()"
                          [disabled]="formExecuting()"
                          class="action-run-btn">
                    @if (formExecuting()) { <mat-spinner diameter="16" /> }
                    @else { <mat-icon>send</mat-icon> }
                    Submit
                  </button>
                }
              </div>

              <!-- Form response -->
              @if (formResponse(); as resp) {
                <div class="response-panel" [style.grid-column]="'1 / -1'"
                     [class.response-success]="resp.status === 'success'"
                     [class.response-error]="resp.status === 'error'">
                  <div class="response-header">
                    <mat-icon>{{ resp.status === 'success' ? 'check_circle' : 'error' }}</mat-icon>
                    <span>{{ resp.status === 'success' ? 'Success' : 'Error' }}</span>
                    <span class="spacer"></span>
                    <button mat-icon-button (click)="formResponse.set(null)">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                  <pre class="response-body">{{ formatJson(resp.data) }}</pre>
                </div>
              }
            </div>
          </div>
        }

        <!-- ═══ WORKFLOW ═══ -->
        @if (data()!.itemType === 'workflow') {
          <div class="workflow-preview">
            <div class="wf-toolbar">
              <button mat-flat-button color="primary"
                      (click)="runWorkflow()"
                      [disabled]="workflowSteps().length === 0 || wfRunning()">
                @if (wfRunning()) { <mat-spinner diameter="16" /> }
                @else { <mat-icon>play_arrow</mat-icon> }
                {{ 'shared.run-workflow' | t }}
              </button>
              @if (wfInputs().length > 0) {
                <span class="wf-info">{{ wfInputs().length }} input(s)</span>
              }
            </div>

            <!-- Workflow inputs -->
            @if (wfInputs().length > 0) {
              <div class="wf-inputs-panel">
                <div class="section-label">{{ 'shared.workflow-inputs' | t }}</div>
                @for (input of wfInputs(); track input.name) {
                  <div class="wf-input-row">
                    <label>{{ input.name }}</label>
                    <input type="text" class="preview-text-input"
                           [placeholder]="input.defaultValue || input.name"
                           [value]="wfInputValues()[input.name] || ''"
                           (input)="setWfInputValue(input.name, $any($event.target).value)" />
                  </div>
                }
              </div>
            }

            <!-- Step list (read-only) -->
            <div class="step-list">
              @for (node of workflowSteps(); track node.id; let i = $index) {
                <div class="step-card"
                     [class.step-card--block]="node.kind !== 'endpoint'">

                  <!-- ENDPOINT -->
                  @if (node.kind === 'endpoint') {
                    @let step = asEndpoint(node);
                    <div class="step-card-inner">
                      <div class="step-num">{{ i + 1 }}</div>
                      <div class="step-info">
                        <div class="step-header-row">
                          <span class="method-badge method-{{ step.method.toLowerCase() }}">{{ step.method }}</span>
                          <span class="step-label">{{ step.endpointLabel }}</span>
                        </div>
                        <div class="step-sub">
                          <span class="step-module">{{ step.moduleLabel }}</span>
                          <code class="step-path">{{ step.pathTemplate }}</code>
                        </div>
                      </div>
                    </div>
                  }

                  <!-- TRY-CATCH -->
                  @if (node.kind === 'try-catch') {
                    @let block = asTryCatch(node);
                    <div class="block-card block-card--try">
                      <div class="block-header">
                        <mat-icon class="block-icon">shield</mat-icon>
                        <span class="block-title">{{ block.label || 'Try / Catch' }}</span>
                        <span class="block-badge">try·catch</span>
                      </div>
                      <div class="block-branches">
                        <div class="branch-col">
                          <div class="branch-col-header"><span class="branch-label">TRY</span><span class="branch-count">{{ block.trySteps.length }}</span></div>
                          @for (s of block.trySteps; track s.id) {
                            <div class="inner-step">
                              <mat-icon class="inner-step-icon">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                              <span class="inner-step-label">{{ getNodeLabel(s) }}</span>
                            </div>
                          }
                        </div>
                        <div class="branch-col">
                          <div class="branch-col-header"><span class="branch-label">CATCH</span><span class="branch-count">{{ block.catchSteps.length }}</span></div>
                          @for (s of block.catchSteps; track s.id) {
                            <div class="inner-step">
                              <mat-icon class="inner-step-icon">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                              <span class="inner-step-label">{{ getNodeLabel(s) }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }

                  <!-- LOOP -->
                  @if (node.kind === 'loop') {
                    @let block = asLoop(node);
                    <div class="block-card block-card--loop">
                      <div class="block-header">
                        <mat-icon class="block-icon">loop</mat-icon>
                        <span class="block-title">{{ block.label || 'Loop' }}</span>
                        <span class="block-badge">{{ (block.loopMode ?? 'count') === 'for-each' ? 'for-each' : 'loop × ' + (block.loopCount ?? 1) }}</span>
                      </div>
                      <div class="block-branches">
                        <div class="branch-col" style="flex:1">
                          <div class="branch-col-header"><span class="branch-label">BODY</span><span class="branch-count">{{ block.bodySteps.length }}</span></div>
                          @for (s of block.bodySteps; track s.id) {
                            <div class="inner-step">
                              <mat-icon class="inner-step-icon">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                              <span class="inner-step-label">{{ getNodeLabel(s) }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }

                  <!-- IF-ELSE -->
                  @if (node.kind === 'if-else') {
                    @let block = asIfElse(node);
                    <div class="block-card block-card--ifelse">
                      <div class="block-header">
                        <mat-icon class="block-icon">call_split</mat-icon>
                        <span class="block-title">{{ block.label || 'If / Else' }}</span>
                        <span class="block-badge">if·else</span>
                      </div>
                      <div class="block-branches">
                        <div class="branch-col">
                          <div class="branch-col-header"><span class="branch-label">THEN</span><span class="branch-count">{{ block.thenSteps.length }}</span></div>
                          @for (s of block.thenSteps; track s.id) {
                            <div class="inner-step">
                              <mat-icon class="inner-step-icon">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                              <span class="inner-step-label">{{ getNodeLabel(s) }}</span>
                            </div>
                          }
                        </div>
                        <div class="branch-col">
                          <div class="branch-col-header"><span class="branch-label">ELSE</span><span class="branch-count">{{ block.elseSteps.length }}</span></div>
                          @for (s of block.elseSteps; track s.id) {
                            <div class="inner-step">
                              <mat-icon class="inner-step-icon">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                              <span class="inner-step-label">{{ getNodeLabel(s) }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }

                  <!-- MAPPER -->
                  @if (node.kind === 'mapper') {
                    @let block = asMapper(node);
                    <div class="block-card block-card--mapper">
                      <div class="block-header">
                        <mat-icon class="block-icon">swap_horiz</mat-icon>
                        <span class="block-title">{{ block.label || 'Mapper' }}</span>
                        <span class="block-badge">{{ block.mappings.length }} mappings</span>
                      </div>
                    </div>
                  }

                  <!-- FILTER -->
                  @if (node.kind === 'filter') {
                    @let block = asFilter(node);
                    <div class="block-card block-card--filter">
                      <div class="block-header">
                        <mat-icon class="block-icon">filter_list</mat-icon>
                        <span class="block-title">{{ block.label || 'Filter' }}</span>
                        <span class="block-badge">{{ block.filterField ? block.filterField + ' ' + (block.filterOperator ?? '==') + ' ' + (block.filterValue ?? '') : 'filter' }}</span>
                      </div>
                    </div>
                  }

                  <!-- SUB-WORKFLOW -->
                  @if (node.kind === 'sub-workflow') {
                    @let block = asSubWorkflow(node);
                    <div class="block-card block-card--sub-workflow">
                      <div class="block-header">
                        <mat-icon class="block-icon">account_tree</mat-icon>
                        <span class="block-title">{{ block.label || block.workflowName || 'Sub-Workflow' }}</span>
                        @if (block.workflowName) {
                          <span class="block-badge">{{ block.workflowName }}</span>
                        }
                      </div>
                    </div>
                  }

                  <!-- Connector -->
                  @if (i < workflowSteps().length - 1) {
                    <div class="connector">
                      <div class="connector-line"></div>
                      <mat-icon class="connector-arrow">arrow_downward</mat-icon>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Run results -->
            @if (wfRunLog(); as log) {
              <mat-divider />
              <div class="wf-results">
                <div class="section-label">
                  <mat-icon [style.color]="log.success ? '#16a34a' : '#dc2626'">{{ log.success ? 'check_circle' : 'error' }}</mat-icon>
                  {{ 'shared.execution-results' | t }}
                </div>
                @for (sl of log.steps; track sl.stepId) {
                  <div class="result-step" [class.result-step--ok]="sl.success" [class.result-step--err]="!sl.success">
                    <mat-icon>{{ sl.success ? 'check' : 'close' }}</mat-icon>
                    <span class="result-label">{{ sl.label }}</span>
                    @if (sl.error) { <span class="result-error">{{ sl.error }}</span> }
                    @if (sl.response) {
                      <pre class="result-data">{{ formatJson(sl.response) }}</pre>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; height: 100%; background: #f1f5f9; }
    .shared-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 16px; color: #64748b; }
    .shared-error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 8px; color: #64748b; }
    .shared-error mat-icon { font-size: 48px; width: 48px; height: 48px; color: #94a3b8; }
    .shared-error h2 { margin: 0; color: #334155; }

    .shared-shell { display: flex; flex-direction: column; height: 100%; }
    .shared-toolbar {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 24px; background: white; border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }
    .shared-icon { color: #64748b; }
    .shared-title { font-size: 16px; font-weight: 700; color: #1e293b; }
    .shared-badge {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      padding: 2px 8px; border-radius: 4px;
      background: #e2e8f0; color: #475569; letter-spacing: .06em;
    }
    .shared-badge--readonly { background: #dbeafe; color: #2563eb; }
    .spacer { flex: 1; }

    /* ── Dashboard ── */
    .dashboard-preview { flex: 1; overflow: auto; padding: 20px; }
    .canvas-area {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-auto-rows: 80px;
      gap: 12px;
    }
    .widget-card {
      background: white; border-radius: 10px; border: 1px solid #e2e8f0;
      display: flex; flex-direction: column; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,.04);
    }
    .widget-header {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 12px; font-size: 12px; font-weight: 600; color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }
    .widget-type-icon { font-size: 16px; width: 16px; height: 16px; color: #64748b; }
    .widget-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .widget-refresh-btn { width: 24px !important; height: 24px !important; line-height: 24px !important; opacity: 0.4; }
    .widget-refresh-btn:hover { opacity: 1; }
    .widget-refresh-btn mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .widget-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 8px 12px; overflow: hidden; min-height: 0; }
    .no-data { display: flex; align-items: center; gap: 6px; color: #94a3b8; font-size: 12px; }
    .badge-vis { text-align: center; }
    .badge-value { font-size: 28px; font-weight: 800; color: #1e293b; }
    .badge-label { font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: .04em; }
    .chart-placeholder { display: flex; flex-direction: column; align-items: center; gap: 4px; color: #64748b; font-size: 12px; }
    .chart-placeholder mat-icon { font-size: 32px; width: 32px; height: 32px; color: #94a3b8; }
    .search-widget { display: flex; align-items: center; gap: 6px; color: #94a3b8; font-size: 13px; padding: 0 4px; width: 100%; }
    .search-widget mat-icon { font-size: 20px; width: 20px; height: 20px; color: #94a3b8; flex-shrink: 0; }
    .search-widget .search-input { flex: 1; border: none; outline: none; background: transparent; font-size: 13px; color: #1e293b; padding: 6px 0; }
    .search-widget .search-input::placeholder { color: #94a3b8; }
    .search-widget .search-clear { display: flex; align-items: center; border: none; background: none; cursor: pointer; color: #94a3b8; padding: 0; }
    .search-widget .search-clear mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .table-container { width: 100%; overflow: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    .data-table th { background: #f8fafc; font-weight: 600; text-align: left; padding: 6px 8px; border-bottom: 2px solid #e2e8f0; }
    .data-table td { padding: 4px 8px; border-bottom: 1px solid #f1f5f9; }

    /* ── Charts ── */
    .chart-container { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .chart-container svg { width: 100%; height: 100%; max-height: 100%; }
    .chart-dot-label { font-size: 9px; fill: #334155; font-weight: 600; }
    .chart-axis-label { font-size: 9px; fill: #94a3b8; }
    .pie-container { flex-direction: row; gap: 8px; }
    .pie-chart-svg { max-width: 180px; flex-shrink: 0; }
    .pie-legend { display: flex; flex-direction: column; gap: 3px; font-size: 11px; overflow: hidden; }
    .pie-legend-item { display: flex; align-items: center; gap: 5px; }
    .pie-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .pie-label-text { color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pie-value-text { color: #64748b; margin-left: auto; flex-shrink: 0; }

    /* ── Form ── */
    .form-preview { flex: 1; overflow: auto; padding: 20px; }
    .form-canvas { max-width: 900px; margin: 0 auto; grid-auto-rows: minmax(80px, auto); }
    .field-card {
      background: white; border-radius: 10px; border: 1px solid #e2e8f0;
      display: flex; flex-direction: column; overflow: hidden; padding: 12px 16px;
    }
    .field-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
    .field-type-icon { font-size: 16px; width: 16px; height: 16px; color: #64748b; }
    .field-title { font-size: 13px; font-weight: 600; color: #334155; }
    .required-mark { color: #dc2626; font-weight: 700; }
    .field-preview { flex: 1; }
    .preview-text-input {
      width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;
      font-size: 13px; outline: none; box-sizing: border-box;
    }
    .preview-text-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,.15); }
    .preview-select-field {
      width: 100%; font-size: 13px;
    }
    .preview-select-field .mat-mdc-form-field-subscript-wrapper { display: none; }
    .data-source-tag {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 10px; color: #64748b; background: #f1f5f9;
      padding: 2px 8px; border-radius: 4px; margin-top: 4px;
    }
    .submit-row { display: flex; gap: 8px; padding: 12px 0; }
    .action-run-btn { min-width: 120px; }
    .response-panel { border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
    .response-header { display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 12px; font-weight: 600; }
    .response-success .response-header { background: #f0fdf4; color: #15803d; }
    .response-error .response-header { background: #fef2f2; color: #dc2626; }
    .response-body { padding: 12px 16px; font-size: 11px; margin: 0; max-height: 300px; overflow: auto; font-family: 'Cascadia Code', monospace; background: #fafbfc; }

    /* ── Workflow ── */
    .workflow-preview { flex: 1; overflow: auto; padding: 20px; max-width: 800px; margin: 0 auto; width: 100%; }
    .wf-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .wf-info { font-size: 12px; color: #64748b; }
    .wf-inputs-panel {
      background: white; border-radius: 10px; border: 1px solid #e2e8f0;
      padding: 16px; margin-bottom: 16px;
    }
    .wf-input-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
    .wf-input-row label { font-size: 12px; font-weight: 600; color: #475569; min-width: 120px; }
    .section-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      color: #64748b; letter-spacing: .06em; margin-bottom: 8px;
    }
    .step-list { display: flex; flex-direction: column; }
    .step-card { margin-bottom: 0; }
    .step-card-inner {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 12px 16px; background: white; border-radius: 10px;
      border: 1px solid #e2e8f0; cursor: default;
    }
    .step-num {
      min-width: 28px; height: 28px; border-radius: 50%;
      background: #e2e8f0; color: #475569;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
    }
    .step-info { flex: 1; min-width: 0; }
    .step-header-row { display: flex; align-items: center; gap: 8px; }
    .method-badge {
      font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
      color: white; letter-spacing: .04em;
    }
    .method-get { background: #16a34a; }
    .method-post { background: #2563eb; }
    .method-put { background: #d97706; }
    .method-patch { background: #0891b2; }
    .method-delete { background: #dc2626; }
    .step-label { font-size: 13px; font-weight: 600; color: #1e293b; }
    .step-sub { display: flex; align-items: center; gap: 6px; margin-top: 2px; font-size: 11px; }
    .step-module { color: #64748b; }
    .step-path { color: #94a3b8; font-size: 10px; }
    .block-card {
      background: white; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden;
    }
    .block-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px; border-bottom: 1px solid #f1f5f9;
    }
    .block-icon { font-size: 18px; width: 18px; height: 18px; }
    .block-card--try .block-icon { color: #f59e0b; }
    .block-card--loop .block-icon { color: #8b5cf6; }
    .block-card--ifelse .block-icon { color: #0284c7; }
    .block-card--mapper .block-icon { color: #059669; }
    .block-card--filter .block-icon { color: #dc2626; }
    .block-card--sub-workflow .block-icon { color: #7c3aed; }
    .block-title { font-size: 13px; font-weight: 600; color: #1e293b; }
    .block-badge {
      font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px;
      background: #f1f5f9; color: #64748b;
    }
    .block-branches { display: flex; gap: 8px; padding: 8px 12px; }
    .branch-col { flex: 1; background: #f8fafc; border-radius: 6px; padding: 6px; min-height: 30px; }
    .branch-col-header { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
    .branch-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; }
    .branch-count { font-size: 10px; color: #94a3b8; }
    .inner-step {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 8px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;
      font-size: 11px; color: #334155; margin-bottom: 4px;
    }
    .inner-step-icon { font-size: 14px; width: 14px; height: 14px; color: #64748b; }
    .inner-step-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .connector { display: flex; flex-direction: column; align-items: center; padding: 4px 0; }
    .connector-line { width: 2px; height: 12px; background: #cbd5e1; }
    .connector-arrow { font-size: 16px; width: 16px; height: 16px; color: #94a3b8; }

    /* ── Results ── */
    .wf-results { padding: 16px 0; }
    .result-step {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 8px 12px; margin-bottom: 4px; border-radius: 6px;
      font-size: 12px;
    }
    .result-step--ok { background: #f0fdf4; }
    .result-step--err { background: #fef2f2; }
    .result-step--ok mat-icon { color: #16a34a; font-size: 16px; width: 16px; height: 16px; }
    .result-step--err mat-icon { color: #dc2626; font-size: 16px; width: 16px; height: 16px; }
    .result-label { font-weight: 600; color: #334155; }
    .result-error { color: #dc2626; font-size: 11px; }
    .result-data {
      width: 100%; margin: 4px 0 0; padding: 8px; font-size: 10px;
      background: #f8fafc; border-radius: 4px; overflow: auto; max-height: 200px;
      font-family: 'Cascadia Code', monospace;
    }
  `],
})
export class SharedViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly shareSvc = inject(ShareService);
  private readonly wfSvc = inject(WorkflowService);
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<SharedItemData | null>(null);
  readonly itemName = signal('');

  // Dashboard
  readonly dashboardWidgets = signal<DashboardWidget[]>([]);
  readonly searchFilter = signal('');

  // Form
  readonly formFields = signal<any[]>([]);
  readonly formActions = signal<any[]>([]);
  readonly fieldValues = signal<Record<string, unknown>>({});
  readonly formExecuting = signal(false);
  readonly formResponse = signal<{ status: string; data: unknown } | null>(null);

  // Workflow
  readonly workflowSteps = signal<WorkflowNode[]>([]);
  readonly wfInputs = signal<WorkflowInput[]>([]);
  readonly wfOutputs = signal<WorkflowOutput[]>([]);
  readonly wfInputValues = signal<Record<string, string>>({});
  readonly wfRunning = signal(false);
  readonly wfRunLog = signal<WorkflowRunLog | null>(null);

  async ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    try {
      const result = await this.shareSvc.resolvePublic(token);
      this.data.set(result);
      const d = result.data as Record<string, any>;
      this.itemName.set(d['name'] || result.itemType);

      if (result.itemType === 'dashboard') {
        const widgets = (d['widgets'] || []) as DashboardWidget[];
        this.dashboardWidgets.set(widgets);
        // Fetch live data only for widgets that don't have snapshotted lastData
        for (const w of widgets) {
          if (w.dataSource && w.lastData == null) this.fetchWidgetData(w);
        }
      } else if (result.itemType === 'form') {
        const fields = (d['fields'] || []) as any[];
        this.formFields.set(fields);
        this.formActions.set(d['submitActions'] || []);
      } else if (result.itemType === 'workflow') {
        this.workflowSteps.set((d['steps'] || []) as WorkflowNode[]);
        this.wfInputs.set((d['inputs'] || []) as WorkflowInput[]);
        this.wfOutputs.set((d['outputs'] || []) as WorkflowOutput[]);
      }
    } catch (e: any) {
      this.error.set(e?.message || 'Share link not found');
    } finally {
      this.loading.set(false);
    }
  }

  // ── Dashboard helpers ──
  refreshWidget(widget: DashboardWidget) {
    this.fetchWidgetData(widget);
  }

  private async fetchWidgetData(widget: DashboardWidget) {
    if (!widget.dataSource) return;
    const ds = widget.dataSource;
    try {
      const res = await this.api.get(
        ds.moduleApiPrefix,
        ds.pathTemplate,
        ds.pathParams || {},
        ds.queryParams || {},
      ).toPromise();
      let data: unknown = res;
      if (widget.dataPath) {
        data = this.getPath(res, widget.dataPath);
      }
      // Auto-detect wrapped arrays (e.g. { data: [...] }, { contacts: [...] })
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj['data'])) {
          data = obj['data'];
        } else {
          const firstArr = Object.values(obj).find(v => Array.isArray(v));
          if (firstArr) data = firstArr;
        }
      }
      // Create new widget object so Angular detects the change
      this.dashboardWidgets.update(ws =>
        ws.map(w => w.id === widget.id ? { ...w, lastData: data } : w)
      );
    } catch { /* ignore fetch errors in shared view */ }
  }

  private getPath(obj: unknown, path: string): unknown {
    return path.split('.').reduce((o: any, k) => o?.[k], obj);
  }

  private getItems(widget: DashboardWidget): Record<string, unknown>[] {
    if (!Array.isArray(widget.lastData)) return [];
    const items = widget.lastData as Record<string, unknown>[];
    const q = this.searchFilter().toLowerCase().trim();
    if (!q) return items;
    return items.filter(item =>
      Object.values(item).some(v =>
        v != null && String(v).toLowerCase().includes(q)
      )
    );
  }

  private extractField(item: unknown, field: string): unknown {
    return this.getPath(item, field);
  }

  private formatNum(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  }

  private truncate(s: string, max: number): string {
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  // ── LINE CHART helpers ──

  getLineChartPoints(widget: DashboardWidget): string {
    const items = this.getItems(widget);
    const valueField = widget.bindings['valueField'];
    if (!valueField || items.length === 0) return '';
    const values = items.map(item => Number(this.extractField(item, valueField)) || 0);
    const max = Math.max(...values, 1);
    const step = 350 / Math.max(items.length - 1, 1);
    return values.map((v, i) => `${40 + i * step},${170 - (v / max) * 160}`).join(' ');
  }

  getLineChartArea(widget: DashboardWidget): string {
    const items = this.getItems(widget);
    const valueField = widget.bindings['valueField'];
    if (!valueField || items.length === 0) return '';
    const values = items.map(item => Number(this.extractField(item, valueField)) || 0);
    const max = Math.max(...values, 1);
    const step = 350 / Math.max(items.length - 1, 1);
    const pts = values.map((v, i) => `${40 + i * step},${170 - (v / max) * 160}`);
    const lastX = 40 + (items.length - 1) * step;
    return pts.join(' ') + ` ${lastX},170 40,170`;
  }

  getLineChartDots(widget: DashboardWidget): { x: number; y: number; val: string }[] {
    const items = this.getItems(widget);
    const valueField = widget.bindings['valueField'];
    if (!valueField || items.length === 0) return [];
    const values = items.map(item => Number(this.extractField(item, valueField)) || 0);
    const max = Math.max(...values, 1);
    const step = 350 / Math.max(items.length - 1, 1);
    const skip = Math.max(1, Math.floor(items.length / 12));
    return values
      .map((v, i) => ({ x: 40 + i * step, y: 170 - (v / max) * 160, val: this.formatNum(v) }))
      .filter((_, i) => i % skip === 0 || i === items.length - 1);
  }

  getLineChartLabels(widget: DashboardWidget): { x: number; text: string }[] {
    const items = this.getItems(widget);
    const labelField = widget.bindings['labelField'];
    if (!labelField || items.length === 0) return [];
    const step = 350 / Math.max(items.length - 1, 1);
    const skip = Math.max(1, Math.floor(items.length / 8));
    return items
      .map((item, i) => ({
        x: 40 + i * step,
        text: this.truncate(String(this.extractField(item, labelField) ?? ''), 10),
      }))
      .filter((_, i) => i % skip === 0 || i === items.length - 1);
  }

  // ── BAR CHART helpers ──

  private readonly BAR_COLORS = [
    '#0891b2', '#0e7490', '#155e75', '#164e63', '#083344',
    '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe',
  ];

  getBarChartBars(widget: DashboardWidget): { x: number; y: number; width: number; height: number; color: string; val: string }[] {
    const items = this.getItems(widget);
    const valueField = widget.bindings['valueField'];
    if (!valueField || items.length === 0) return [];
    const values = items.map(item => Number(this.extractField(item, valueField)) || 0);
    const max = Math.max(...values, 1);
    const count = values.length;
    const chartWidth = 350;
    const gap = Math.max(2, Math.min(6, 60 / count));
    const barWidth = Math.max(4, (chartWidth - gap * count) / count);
    const totalWidth = count * barWidth + (count - 1) * gap;
    const offsetX = 40 + (chartWidth - totalWidth) / 2;
    const skip = Math.max(1, Math.ceil(count / 30));
    return values
      .map((v, i) => {
        const h = (v / max) * 170;
        return {
          x: offsetX + i * (barWidth + gap),
          y: 180 - h,
          width: barWidth,
          height: h,
          color: this.BAR_COLORS[i % this.BAR_COLORS.length],
          val: this.formatNum(v),
        };
      })
      .filter((_, i) => i % skip === 0);
  }

  getBarChartLabels(widget: DashboardWidget): { x: number; text: string }[] {
    const items = this.getItems(widget);
    const labelField = widget.bindings['labelField'];
    const valueField = widget.bindings['valueField'];
    if (!labelField || !valueField || items.length === 0) return [];
    const count = items.length;
    const chartWidth = 350;
    const gap = Math.max(2, Math.min(6, 60 / count));
    const barWidth = Math.max(4, (chartWidth - gap * count) / count);
    const totalWidth = count * barWidth + (count - 1) * gap;
    const offsetX = 40 + (chartWidth - totalWidth) / 2;
    const skip = Math.max(1, Math.ceil(count / 10));
    return items
      .map((item, i) => ({
        x: offsetX + i * (barWidth + gap) + barWidth / 2,
        text: this.truncate(String(this.extractField(item, labelField) ?? ''), 8),
      }))
      .filter((_, i) => i % skip === 0);
  }

  // ── PIE CHART helpers ──

  private readonly PIE_COLORS = [
    '#2563eb', '#d97706', '#16a34a', '#dc2626', '#7c3aed',
    '#0891b2', '#ea580c', '#4f46e5', '#059669', '#be185d',
    '#65a30d', '#0284c7', '#9333ea', '#e11d48', '#ca8a04',
  ];

  getPieSlices(widget: DashboardWidget): { d: string; color: string; label: string; value: string }[] {
    const items = this.getItems(widget);
    const labelField = widget.bindings['labelField'];
    const valueField = widget.bindings['valueField'];
    if (!valueField || items.length === 0) return [];
    const map = new Map<string, number>();
    for (const item of items) {
      const label = labelField ? String(this.extractField(item, labelField) ?? 'Unknown') : 'Item';
      const val = Number(this.extractField(item, valueField)) || 0;
      map.set(label, (map.get(label) ?? 0) + val);
    }
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    const cx = 100, cy = 100, r = 85;
    let startAngle = -Math.PI / 2;
    return entries.map(([label, value], i) => {
      const angle = (value / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      const largeArc = angle > Math.PI ? 1 : 0;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const d = entries.length === 1
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      startAngle = endAngle;
      return {
        d,
        color: this.PIE_COLORS[i % this.PIE_COLORS.length],
        label: this.truncate(label, 18),
        value: this.formatNum(value),
      };
    });
  }

  getTableColumns(widget: DashboardWidget): string[] {
    const cols = widget.bindings['columns'];
    if (!cols) {
      const items = this.getItems(widget);
      return items.length > 0 ? Object.keys(items[0]).slice(0, 8) : [];
    }
    return cols.split(',').map(c => c.trim()).filter(Boolean);
  }

  getTableRows(widget: DashboardWidget): Record<string, string>[] {
    const items = this.getItems(widget);
    const columns = this.getTableColumns(widget);
    const filter = this.searchFilter().toLowerCase();
    return items
      .filter(item => {
        if (!filter) return true;
        return columns.some(col => {
          const val = this.getPath(item, col);
          return val != null && String(val).toLowerCase().includes(filter);
        });
      })
      .slice(0, 50)
      .map(item => {
        const row: Record<string, string> = {};
        for (const col of columns) {
          const val = this.getPath(item, col);
          row[col] = val == null ? '' : String(val);
        }
        return row;
      });
  }

  getBadgeValue(widget: DashboardWidget): string {
    const agg = widget.bindings['aggregation'] || 'count';
    const field = widget.bindings['valueField'];
    const items = this.getItems(widget);
    if (items.length === 0) return '–';
    if (agg === 'count') return String(items.length);
    if (!field) return '–';
    const nums = items.map(it => Number(this.getPath(it, field))).filter(n => !isNaN(n));
    if (nums.length === 0) return '–';
    switch (agg) {
      case 'sum': return String(Math.round(nums.reduce((a, b) => a + b, 0)));
      case 'avg': return String(Math.round(nums.reduce((a, b) => a + b, 0) / nums.length));
      case 'max': return String(Math.max(...nums));
      case 'min': return String(Math.min(...nums));
      default: return '–';
    }
  }

  getChartSummary(widget: DashboardWidget): string {
    const items = this.getItems(widget);
    return `${items.length} data points`;
  }

  // ── Form helpers ──
  refreshFieldData(field: any) {
    this.fetchFieldData(field);
  }

  private async fetchFieldData(field: any) {
    if (!field.dataSource) return;
    const ds = field.dataSource;
    try {
      const res = await this.api.get(
        ds.moduleApiPrefix,
        ds.pathTemplate,
        ds.pathParams || {},
        ds.queryParams || {},
      ).toPromise();
      let data: unknown = res;
      if (ds.dataPath) {
        data = this.getPath(res, ds.dataPath);
      }
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj['data'])) {
          data = obj['data'];
        } else {
          const firstArr = Object.values(obj).find(v => Array.isArray(v));
          if (firstArr) data = firstArr;
        }
      }
      this.formFields.update(fs =>
        fs.map(f => f.id === field.id ? { ...f, lastData: data } : f)
      );
    } catch { /* ignore fetch errors in shared view */ }
  }

  getFieldValue(fieldId: string): string {
    return String(this.fieldValues()[fieldId] ?? '');
  }

  setFieldValue(fieldId: string, value: unknown) {
    this.fieldValues.update(v => ({ ...v, [fieldId]: value }));
  }

  getSelectOptions(field: any): { display: string; value: string }[] {
    const items = Array.isArray(field.lastData) ? field.lastData as Record<string, unknown>[] : [];
    if (items.length > 0) {
      const displayField = field.displayField || '';
      const valueField = field.valueField || '';
      return items.slice(0, 50).map((item: Record<string, unknown>) => ({
        display: displayField ? String(this.getPath(item, displayField) ?? '') : JSON.stringify(item).slice(0, 60),
        value: valueField ? String(this.getPath(item, valueField) ?? '') : '',
      }));
    }
    if (field.options) {
      return (field.options as string).split(',').map((o: string) => ({ display: o.trim(), value: o.trim() }));
    }
    return [];
  }

  getFormTableColumns(field: any): string[] {
    if (field.columns) {
      return field.columns.split(',').map((c: string) => c.trim()).filter(Boolean);
    }
    const items = Array.isArray(field.lastData) ? field.lastData as Record<string, unknown>[] : [];
    if (items.length > 0) return Object.keys(items[0]).slice(0, 8);
    return [];
  }

  getFormTableRows(field: any): Record<string, string>[] {
    const items = Array.isArray(field.lastData) ? field.lastData as Record<string, unknown>[] : [];
    const columns = this.getFormTableColumns(field);
    return items.slice(0, 50).map((item: Record<string, unknown>) => {
      const row: Record<string, string> = {};
      for (const col of columns) {
        const val = this.getPath(item, col);
        row[col] = val == null ? '' : String(val);
      }
      return row;
    });
  }

  async executeFormAction(action: any) {
    if (!action.moduleApiPrefix || !action.pathTemplate) return;
    this.formExecuting.set(true);
    this.formResponse.set(null);
    try {
      const body = this.buildFormRequestBody(action);
      const method = (action.method || 'POST').toUpperCase();
      let result: unknown;
      if (method === 'DELETE') {
        result = await this.api.delete(action.moduleApiPrefix, action.pathTemplate, action.pathParams || {}).toPromise();
      } else if (method === 'PUT') {
        result = await this.api.put(action.moduleApiPrefix, action.pathTemplate, action.pathParams || {}, body).toPromise();
      } else if (method === 'PATCH') {
        result = await this.api.patch(action.moduleApiPrefix, action.pathTemplate, action.pathParams || {}, body).toPromise();
      } else {
        result = await this.api.post(action.moduleApiPrefix, action.pathTemplate, action.pathParams || {}, body).toPromise();
      }
      this.formResponse.set({ status: 'success', data: result });
    } catch (e: any) {
      this.formResponse.set({ status: 'error', data: e?.error || e?.message || 'Error' });
    } finally {
      this.formExecuting.set(false);
    }
  }

  submitForm() {
    this.formExecuting.set(true);
    this.formResponse.set(null);
    try {
      const values = this.fieldValues();
      const body: Record<string, unknown> = {};
      for (const field of this.formFields()) {
        const val = values[field.id];
        if (val !== undefined && val !== '') {
          body[field.label || field.id] = val;
        }
      }
      this.formResponse.set({ status: 'success', data: body });
    } catch (e: any) {
      this.formResponse.set({ status: 'error', data: e?.message || 'Error' });
    } finally {
      this.formExecuting.set(false);
    }
  }

  private buildFormRequestBody(action: any): unknown {
    const mode = action.bodyMode ?? 'fields';
    const values = this.fieldValues();
    const hasKeys = action.bodyKeys && action.bodyKeys.length > 0;

    if (mode === 'fields' || (!hasKeys && (action.rawBody ?? '{}').trim() === '{}')) {
      const body: Record<string, unknown> = {};
      if (hasKeys) {
        for (const key of action.bodyKeys) {
          const src = action.bodySources?.[key];
          if (!src || src.type === 'hardcoded') {
            const raw = src?.type === 'hardcoded' ? src.value : '';
            body[key] = this.resolveFieldRefs(raw, values);
          } else {
            body[key] = values[src.fieldId] ?? '';
          }
        }
      } else {
        for (const field of this.formFields()) {
          const val = values[field.id];
          if (val !== undefined && val !== '') {
            body[field.label || field.id] = val;
          }
        }
      }
      return body;
    }

    // text or form mode — resolve {{field.xxx}} references
    const raw = action.rawBody ?? '{}';
    const resolved = this.resolveFieldRefs(raw, values);
    try {
      return JSON.parse(resolved);
    } catch {
      try {
        const fixed = resolved.replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g, '$1"$2":');
        return JSON.parse(fixed);
      } catch {
        return {};
      }
    }
  }

  private resolveFieldRefs(template: string, values: Record<string, unknown>): string {
    return template.replace(/\{\{field\.([^}]+)\}\}/g, (_match: string, fieldId: string) => {
      return String(values[fieldId] ?? '');
    });
  }

  // ── Workflow helpers ──
  async runWorkflow() {
    const d = this.data()?.data as Record<string, any>;
    const wfId = d?.['id'];
    if (!wfId) return;
    this.wfRunning.set(true);
    this.wfRunLog.set(null);
    try {
      const inputValues = this.wfInputs().length > 0 ? this.wfInputValues() : undefined;
      const log = await this.wfSvc.execute(wfId, inputValues);
      this.wfRunLog.set(log);
    } catch (e: any) {
      this.wfRunLog.set({
        startedAt: new Date().toISOString(),
        steps: [],
        success: false,
        error: e?.message || 'Execution failed',
      });
    } finally {
      this.wfRunning.set(false);
    }
  }

  setWfInputValue(name: string, value: string) {
    this.wfInputValues.update(v => ({ ...v, [name]: value }));
  }

  // ── Node type casts ──
  asEndpoint(n: WorkflowNode): WorkflowStep { return n as WorkflowStep; }
  asTryCatch(n: WorkflowNode): TryCatchBlock { return n as TryCatchBlock; }
  asLoop(n: WorkflowNode): LoopBlock { return n as LoopBlock; }
  asIfElse(n: WorkflowNode): IfElseBlock { return n as IfElseBlock; }
  asMapper(n: WorkflowNode): MapperBlock { return n as MapperBlock; }
  asFilter(n: WorkflowNode): FilterBlock { return n as FilterBlock; }
  asSubWorkflow(n: WorkflowNode): SubWorkflowBlock { return n as SubWorkflowBlock; }

  getNodeLabel(n: WorkflowNode): string {
    if (n.kind === 'endpoint') return (n as WorkflowStep).endpointLabel;
    return (n as any).label || n.kind;
  }

  formatJson(data: unknown): string {
    try { return JSON.stringify(data, null, 2); } catch { return String(data); }
  }
}
