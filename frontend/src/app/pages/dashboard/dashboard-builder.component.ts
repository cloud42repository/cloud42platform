import { Component, inject, signal, computed, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  CdkDragPlaceholder,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { DashboardService } from '../../services/dashboard.service';
import { ApiService } from '../../services/api.service';
import {
  Dashboard,
  DashboardWidget,
  WidgetKind,
  WidgetDataSource,
  AggregateFunction,
} from '../../config/dashboard.types';
import { MODULES, ModuleDef, EndpointDef } from '../../config/endpoints';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { firstValueFrom } from 'rxjs';

interface WidgetTypeRef {
  kind: WidgetKind;
  label: string;
  icon: string;
  color: string;
}

interface EndpointRef {
  module: ModuleDef;
  endpoint: EndpointDef;
}

@Component({
  selector: 'app-dashboard-builder',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTooltipModule, MatDividerModule, MatProgressSpinnerModule,
    CdkDrag, CdkDropList, CdkDropListGroup, CdkDragPlaceholder, CdkDragHandle,
    TranslatePipe,
  ],
  template: `
    <div class="builder-shell" cdkDropListGroup>
      <!-- ── BROWSER PANEL (left) ── -->
      <div class="browser-panel">
        <div class="browser-header">
          <mat-icon>widgets</mat-icon>
          <span>{{ 'dashboard.widget-browser' | t }}</span>
        </div>

        <div class="browser-section-label">{{ 'dashboard.widget-types' | t }}</div>
        <div class="browser-list"
             cdkDropList
             [id]="'widgetTypeList'"
             [cdkDropListData]="widgetTypes"
             [cdkDropListConnectedTo]="['dashboardCanvas']"
             [cdkDropListSortingDisabled]="true">
          @for (wt of widgetTypes; track wt.kind) {
            <div class="browser-item" cdkDrag [cdkDragData]="wt">
              <mat-icon [style.color]="wt.color">{{ wt.icon }}</mat-icon>
              <span>{{ wt.label }}</span>
              <div *cdkDragPlaceholder class="drag-placeholder"></div>
            </div>
          }
        </div>

        <mat-divider class="browser-divider" />
        <div class="browser-section-label">{{ 'dashboard.search-endpoints' | t }}</div>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="browser-search">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="browserSearch" placeholder="Search…" />
        </mat-form-field>
        <div class="browser-modules">
          @for (group of groupedEndpoints(); track group.module.id) {
            <div class="browser-module-group">
              <div class="browser-module-header" (click)="toggleModule(group.module.id)">
                <mat-icon>{{ expandedModules().has(group.module.id) ? 'expand_more' : 'chevron_right' }}</mat-icon>
                <span>{{ group.module.label }}</span>
                <span class="ep-count">{{ group.endpoints.length }}</span>
              </div>
              @if (expandedModules().has(group.module.id)) {
                @for (ep of group.endpoints; track ep.id) {
                  <div class="browser-endpoint">
                    <span class="method-tag method-{{ ep.method.toLowerCase() }}">{{ ep.method }}</span>
                    <span class="ep-label">{{ ep.label }}</span>
                  </div>
                }
              }
            </div>
          }
        </div>
      </div>

      <!-- ── CANVAS (center) ── -->
      <div class="canvas-panel">
        <div class="canvas-toolbar">
          <a mat-icon-button routerLink="/dashboards" matTooltip="{{ 'dashboard.back-to-dashboards' | t }}">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="name-input">
            <input matInput [value]="dashboardName()" (input)="dashboardName.set($any($event.target).value)"
                   placeholder="{{ 'dashboard.name-placeholder' | t }}" />
          </mat-form-field>
          <span class="spacer"></span>
          <button mat-flat-button color="primary" (click)="save()" [disabled]="saving()">
            @if (saving()) { <mat-spinner diameter="16" /> }
            <mat-icon>save</mat-icon> {{ 'dashboard.save' | t }}
          </button>
          <button mat-stroked-button (click)="preview()" [disabled]="widgets().length === 0">
            <mat-icon>visibility</mat-icon> {{ 'dashboard.preview' | t }}
          </button>
          <button mat-stroked-button (click)="exportPdf()" [disabled]="widgets().length === 0 || exporting()">
            @if (exporting()) { <mat-spinner diameter="16" /> }
            <mat-icon>picture_as_pdf</mat-icon> {{ 'dashboard.export-pdf' | t }}
          </button>
        </div>

        <div class="canvas-area"
             cdkDropList
             [id]="'dashboardCanvas'"
             [cdkDropListData]="widgets()"
             [cdkDropListConnectedTo]="['widgetTypeList']"
             (cdkDropListDropped)="onCanvasDrop($event)">
          @if (widgets().length === 0) {
            <div class="canvas-empty">
              <mat-icon>dashboard_customize</mat-icon>
              <p>{{ 'dashboard.canvas-empty' | t }}</p>
            </div>
          }
          @for (widget of widgets(); track widget.id; let i = $index) {
            <div class="widget-card widget-card--{{ widget.kind }}"
                 cdkDrag [cdkDragData]="widget"
                 [class.selected]="selectedWidgetId() === widget.id"
                 (click)="selectWidget(widget.id)">
              <div class="widget-header">
                <mat-icon class="widget-type-icon">
                  @if (widget.kind === 'line-chart') { show_chart }
                  @else if (widget.kind === 'pie-chart') { pie_chart }
                  @else if (widget.kind === 'badge') { tag }
                  @else { table_chart }
                </mat-icon>
                <span class="widget-title">{{ widget.label || kindLabel(widget.kind) }}</span>
                <span class="widget-badge">{{ kindLabel(widget.kind) }}</span>
                <div class="widget-actions" (click)="$event.stopPropagation()">
                  <button mat-icon-button (click)="selectWidget(widget.id)" matTooltip="{{ 'dashboard.configure' | t }}">
                    <mat-icon>settings</mat-icon>
                  </button>
                  <button mat-icon-button (click)="removeWidget(widget.id)" color="warn" matTooltip="{{ 'dashboard.remove-widget' | t }}">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                  <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                </div>
              </div>
              <div class="widget-preview">
                @if (widget.dataSource) {
                  <span class="data-source-tag">
                    <mat-icon style="font-size:12px;width:12px;height:12px">cloud</mat-icon>
                    {{ widget.dataSource.moduleLabel }} › {{ widget.dataSource.endpointLabel }}
                  </span>
                } @else {
                  <span class="no-source">{{ 'dashboard.no-data-source' | t }}</span>
                }
                @if (!widget.lastData) {
                  @if (widget.kind === 'line-chart' || widget.kind === 'pie-chart') {
                    <div class="binding-preview">
                      @if (widget.bindings['labelField']) {
                        <span class="binding-tag">Label: {{ widget.bindings['labelField'] }}</span>
                      }
                      @if (widget.bindings['valueField']) {
                        <span class="binding-tag">Value: {{ widget.bindings['valueField'] }}</span>
                      }
                    </div>
                  }
                  @if (widget.kind === 'data-table' && widget.bindings['columns']) {
                    <div class="binding-preview">
                      <span class="binding-tag">Columns: {{ widget.bindings['columns'] }}</span>
                    </div>
                  }
                  @if (widget.kind === 'badge') {
                    <div class="binding-preview">
                      <span class="binding-tag">{{ (widget.bindings['aggregation'] || 'count') | uppercase }}</span>
                      @if (widget.bindings['valueField']) {
                        <span class="binding-tag">{{ widget.bindings['valueField'] }}</span>
                      }
                    </div>
                  }
                }

                <!-- ── LIVE DATA VISUALIZATIONS ── -->
                @if (widget.lastData && isArray(widget.lastData)) {

                  <!-- LINE CHART -->
                  @if (widget.kind === 'line-chart') {
                    <div class="chart-container">
                      <svg [attr.viewBox]="'0 0 400 200'" class="line-chart-svg" preserveAspectRatio="xMidYMid meet">
                        <!-- Grid lines -->
                        <line x1="40" y1="10" x2="40" y2="170" stroke="#e2e8f0" stroke-width="1" />
                        <line x1="40" y1="170" x2="390" y2="170" stroke="#e2e8f0" stroke-width="1" />
                        @for (gl of [0.25, 0.5, 0.75]; track gl) {
                          <line [attr.x1]="40" [attr.y1]="170 - 160 * gl" [attr.x2]="390" [attr.y1]="170 - 160 * gl" stroke="#f1f5f9" stroke-width="1" />
                        }
                        <!-- Line path -->
                        <polyline [attr.points]="getLineChartPoints(widget)" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                        <!-- Area fill -->
                        <polygon [attr.points]="getLineChartArea(widget)" fill="rgba(37,99,235,0.08)" />
                        <!-- Dots -->
                        @for (pt of getLineChartDots(widget); track $index) {
                          <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3.5" fill="#2563eb" stroke="white" stroke-width="1.5" />
                          <text [attr.x]="pt.x" [attr.y]="pt.y - 8" text-anchor="middle" class="chart-dot-label">{{ pt.val }}</text>
                        }
                        <!-- X-axis labels -->
                        @for (lbl of getLineChartLabels(widget); track $index) {
                          <text [attr.x]="lbl.x" y="186" text-anchor="middle" class="chart-axis-label">{{ lbl.text }}</text>
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

                  <!-- DATA TABLE -->
                  @if (widget.kind === 'data-table') {
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
                      <div class="table-footer">{{ getTableRows(widget).length }} {{ 'dashboard.rows' | t }}</div>
                    </div>
                  }

                  <!-- BADGE -->
                  @if (widget.kind === 'badge') {
                    <div class="badge-visualization">
                      <div class="badge-value">{{ getBadgeValue(widget) }}</div>
                      <div class="badge-label">{{ (widget.bindings['aggregation'] || 'count') | uppercase }}@if (widget.bindings['valueField']) { &middot; {{ widget.bindings['valueField'] }} }</div>
                      @if (widget.bindings['suffix']) {
                        <div class="badge-suffix">{{ widget.bindings['suffix'] }}</div>
                      }
                    </div>
                  }
                }

                <!-- Badge also works with non-array data (single object) -->
                @if (widget.lastData && !isArray(widget.lastData) && widget.kind === 'badge') {
                  <div class="badge-visualization">
                    <div class="badge-value">{{ getBadgeValue(widget) }}</div>
                    <div class="badge-label">{{ (widget.bindings['aggregation'] || 'count') | uppercase }}@if (widget.bindings['valueField']) { &middot; {{ widget.bindings['valueField'] }} }</div>
                    @if (widget.bindings['suffix']) {
                      <div class="badge-suffix">{{ widget.bindings['suffix'] }}</div>
                    }
                  </div>
                }

                @if (widget.lastData && !isArray(widget.lastData) && widget.kind !== 'badge') {
                  <div class="data-error">
                    <mat-icon style="font-size:14px;width:14px;height:14px;color:#d97706">warning</mat-icon>
                    <span>{{ 'dashboard.data-not-array' | t }}</span>
                  </div>
                }
              </div>
              <div *cdkDragPlaceholder class="widget-drag-placeholder"></div>
            </div>
          }
        </div>
      </div>

      <!-- ── CONFIG PANEL (right) ── -->
      <div class="config-panel" [class.open]="selectedWidget() !== null">
        @if (selectedWidget(); as widget) {
          <div class="config-header">
            <span>{{ 'dashboard.configure-widget' | t }}</span>
            <button mat-icon-button (click)="selectedWidgetId.set(null)">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="config-body">
            <!-- Widget label -->
            <div class="config-section-label">{{ 'dashboard.widget-label' | t }}</div>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
              <mat-label>{{ 'dashboard.label' | t }}</mat-label>
              <input matInput [value]="widget.label" (input)="updateWidget(widget.id, 'label', $any($event.target).value)" />
            </mat-form-field>

            <mat-divider class="section-divider" />

            <!-- Data Source -->
            <div class="config-section-label">{{ 'dashboard.data-source' | t }}</div>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
              <mat-label>{{ 'dashboard.select-module' | t }}</mat-label>
              <mat-select [value]="widget.dataSource?.moduleApiPrefix ?? ''"
                          (selectionChange)="setDataSourceModule(widget.id, $event.value)">
                @for (mod of allModules; track mod.id) {
                  <mat-option [value]="mod.apiPrefix">{{ mod.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            @if (selectedModuleEndpoints().length > 0) {
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'dashboard.select-endpoint' | t }}</mat-label>
                <mat-select [value]="widget.dataSource?.pathTemplate ?? ''"
                            (selectionChange)="setDataSourceEndpoint(widget.id, $event.value)">
                  @for (ep of selectedModuleEndpoints(); track ep.id) {
                    <mat-option [value]="ep.pathTemplate">
                      <span class="method-tag method-{{ ep.method.toLowerCase() }}">{{ ep.method }}</span>
                      {{ ep.label }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }

            <!-- Path params -->
            @if (widget.dataSource && getPathParamNames(widget.dataSource.pathTemplate).length > 0) {
              <div class="config-section-label">{{ 'dashboard.path-params' | t }}</div>
              @for (param of getPathParamNames(widget.dataSource.pathTemplate); track param) {
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>:{{ param }}</mat-label>
                  <input matInput [value]="widget.dataSource!.pathParams[param] || ''"
                         (input)="updatePathParam(widget.id, param, $any($event.target).value)"
                         placeholder="{{ 'dashboard.token-hint' | t }}" />
                </mat-form-field>
              }
            }

            <!-- Query params -->
            @if (widget.dataSource) {
              <div class="config-section-label">{{ 'dashboard.query-params' | t }}</div>
              <div class="kv-rows">
                @for (key of getQueryParamKeys(widget); track key) {
                  <div class="kv-row">
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="kv-key">
                      <input matInput [value]="key" (input)="renameQueryParam(widget.id, key, $any($event.target).value)" placeholder="key" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="kv-value">
                      <input matInput [value]="widget.dataSource!.queryParams[key]"
                             (input)="updateQueryParam(widget.id, key, $any($event.target).value)"
                             placeholder="{{ 'dashboard.token-hint' | t }}" />
                    </mat-form-field>
                    <button mat-icon-button (click)="removeQueryParam(widget.id, key)"><mat-icon>close</mat-icon></button>
                  </div>
                }
              </div>
              <button mat-stroked-button (click)="addQueryParam(widget.id)" class="add-param-btn">
                <mat-icon>add</mat-icon> {{ 'dashboard.add-query-param' | t }}
              </button>
            }

            <mat-divider class="section-divider" />

            <!-- Data Path -->
            <div class="config-section-label">{{ 'dashboard.data-path' | t }}</div>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
              <mat-label>{{ 'dashboard.data-path-hint' | t }}</mat-label>
              <input matInput [value]="widget.dataPath ?? ''"
                     (input)="updateWidget(widget.id, 'dataPath', $any($event.target).value)"
                     placeholder="data" />
            </mat-form-field>

            <mat-divider class="section-divider" />

            <!-- Binding fields (depends on widget kind) -->
            <div class="config-section-label">{{ 'dashboard.data-bindings' | t }}</div>

            @if (widget.kind === 'line-chart' || widget.kind === 'pie-chart') {
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'dashboard.label-field' | t }}</mat-label>
                <input matInput [value]="widget.bindings['labelField'] || ''"
                       (input)="updateBinding(widget.id, 'labelField', $any($event.target).value)"
                       placeholder="{{ 'dashboard.binding-hint' | t }}" />
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'dashboard.value-field' | t }}</mat-label>
                <input matInput [value]="widget.bindings['valueField'] || ''"
                       (input)="updateBinding(widget.id, 'valueField', $any($event.target).value)"
                       placeholder="{{ 'dashboard.binding-hint' | t }}" />
              </mat-form-field>
            }

            @if (widget.kind === 'data-table') {
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'dashboard.columns' | t }}</mat-label>
                <input matInput [value]="widget.bindings['columns'] || ''"
                       (input)="updateBinding(widget.id, 'columns', $any($event.target).value)"
                       placeholder="{{ 'dashboard.columns-hint' | t }}" />
              </mat-form-field>
            }

            @if (widget.kind === 'badge') {
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'dashboard.aggregation' | t }}</mat-label>
                <mat-select [value]="widget.bindings['aggregation'] || 'count'"
                            (selectionChange)="updateBinding(widget.id, 'aggregation', $event.value)">
                  @for (agg of aggregationOptions; track agg.value) {
                    <mat-option [value]="agg.value">{{ agg.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              @if (widget.bindings['aggregation'] !== 'count') {
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>{{ 'dashboard.value-field' | t }}</mat-label>
                  <input matInput [value]="widget.bindings['valueField'] || ''"
                         (input)="updateBinding(widget.id, 'valueField', $any($event.target).value)"
                         placeholder="{{ 'dashboard.badge-field-hint' | t }}" />
                </mat-form-field>
              }
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'dashboard.badge-suffix' | t }}</mat-label>
                <input matInput [value]="widget.bindings['suffix'] || ''"
                       (input)="updateBinding(widget.id, 'suffix', $any($event.target).value)"
                       placeholder="{{ 'dashboard.badge-suffix-hint' | t }}" />
              </mat-form-field>
            }

            <mat-divider class="section-divider" />

            <!-- Size -->
            <div class="config-section-label">{{ 'dashboard.size' | t }}</div>
            <div class="size-row">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="size-field">
                <mat-label>{{ 'dashboard.width' | t }}</mat-label>
                <mat-select [value]="widget.width" (selectionChange)="updateWidget(widget.id, 'width', $event.value)">
                  @for (n of widthOptions; track n) {
                    <mat-option [value]="n">{{ n }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="size-field">
                <mat-label>{{ 'dashboard.height' | t }}</mat-label>
                <mat-select [value]="widget.height" (selectionChange)="updateWidget(widget.id, 'height', $event.value)">
                  @for (n of heightOptions; track n) {
                    <mat-option [value]="n">{{ n }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <mat-divider class="section-divider" />

            <!-- Fetch test -->
            <button mat-flat-button color="accent" class="full-width" (click)="fetchWidgetData(widget)" [disabled]="!widget.dataSource || fetching()">
              @if (fetching()) { <mat-spinner diameter="16" /> }
              <mat-icon>cloud_download</mat-icon> {{ 'dashboard.fetch-data' | t }}
            </button>

            @if (widget.lastData !== undefined) {
              <div class="config-section-label" style="margin-top:12px">{{ 'dashboard.fetched-data' | t }}</div>
              <pre class="data-preview">{{ widget.lastData | json }}</pre>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .builder-shell {
      display: flex; height: 100%; gap: 0;
      background: #f8fafc;
    }

    /* ── Browser Panel ── */
    .browser-panel {
      width: 260px; min-width: 260px; background: white;
      border-right: 1px solid #e2e8f0; display: flex; flex-direction: column;
      overflow-y: auto;
    }
    .browser-header {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; font-weight: 700; font-size: 13px;
      border-bottom: 1px solid #e2e8f0; color: #1e293b;
    }
    .browser-section-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      color: #94a3b8; letter-spacing: .06em; padding: 12px 16px 4px;
    }
    .browser-list { padding: 0 8px; }
    .browser-item {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-radius: 8px; font-size: 12px; cursor: grab;
      border: 1px solid #e2e8f0; margin-bottom: 4px; background: white;
      transition: box-shadow .15s;
    }
    .browser-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .browser-divider { margin: 8px 0; }
    .browser-search { width: calc(100% - 32px); margin: 0 16px; }

    .browser-modules { flex: 1; overflow-y: auto; padding: 0 8px; }
    .browser-module-group { margin-bottom: 2px; }
    .browser-module-header {
      display: flex; align-items: center; gap: 4px;
      padding: 6px 8px; cursor: pointer; font-size: 12px; font-weight: 600; color: #334155;
      border-radius: 6px;
    }
    .browser-module-header:hover { background: #f1f5f9; }
    .ep-count {
      margin-left: auto; font-size: 10px; color: #94a3b8;
      background: #f1f5f9; padding: 1px 6px; border-radius: 99px;
    }
    .browser-endpoint {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 12px 4px 28px; font-size: 11px; color: #475569;
    }
    .method-tag {
      font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px;
      letter-spacing: .03em;
    }
    .method-get    { background: #dcfce7; color: #15803d; }
    .method-post   { background: #dbeafe; color: #1d4ed8; }
    .method-put    { background: #fef9c3; color: #ca8a04; }
    .method-patch  { background: #ede9fe; color: #7c3aed; }
    .method-delete { background: #fee2e2; color: #dc2626; }

    .drag-placeholder {
      background: #e2e8f0; border: 2px dashed #94a3b8;
      border-radius: 8px; height: 40px;
    }

    /* ── Canvas ── */
    .canvas-panel { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
    .canvas-toolbar {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px; background: white; border-bottom: 1px solid #e2e8f0;
    }
    .name-input { flex: 0 1 300px; }
    .spacer { flex: 1; }

    .canvas-area {
      flex: 1; padding: 20px;
      display: flex; flex-direction: column; gap: 12px;
      min-height: 200px;
    }
    .canvas-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; flex: 1; color: #94a3b8; gap: 8px;
    }
    .canvas-empty mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .canvas-empty p { font-size: 13px; }

    /* ── Widget Cards ── */
    .widget-card {
      border: 1px solid #e2e8f0; border-radius: 12px;
      background: white; padding: 12px 16px;
      cursor: pointer; transition: all .15s;
    }
    .widget-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
    .widget-card.selected { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,.2); }
    .widget-card--line-chart { border-left: 4px solid #2563eb; }
    .widget-card--pie-chart  { border-left: 4px solid #d97706; }
    .widget-card--data-table { border-left: 4px solid #16a34a; }
    .widget-card--badge      { border-left: 4px solid #7c3aed; }

    /* Badge visualization */
    .badge-visualization {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      flex: 1; padding: 16px 8px; text-align: center;
    }
    .badge-value {
      font-size: 2.8rem; font-weight: 700; line-height: 1.1; color: #1e293b;
    }
    .badge-label {
      font-size: .75rem; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: .05em;
    }
    .badge-suffix {
      font-size: .85rem; color: #94a3b8; margin-top: 2px;
    }

    .widget-header {
      display: flex; align-items: center; gap: 8px;
    }
    .widget-type-icon { font-size: 18px; width: 18px; height: 18px; color: #64748b; }
    .widget-title { font-weight: 700; font-size: 13px; color: #1e293b; }
    .widget-badge {
      font-size: 9px; padding: 2px 8px; border-radius: 99px;
      background: #f1f5f9; color: #64748b; font-weight: 600; margin-left: auto;
    }
    .widget-actions { display: flex; align-items: center; margin-left: 4px; }
    .widget-actions button { width: 28px; height: 28px; line-height: 28px; }
    .widget-actions mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .drag-handle { cursor: grab; color: #94a3b8; font-size: 18px; width: 18px; height: 18px; }

    .widget-preview { margin-top: 8px; }
    .data-source-tag {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; color: #0284c7; background: #f0f9ff;
      padding: 2px 8px; border-radius: 6px;
    }
    .no-source { font-size: 11px; color: #94a3b8; font-style: italic; }
    .binding-preview { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
    .binding-tag {
      font-size: 10px; padding: 2px 6px; border-radius: 4px;
      background: #ede9fe; color: #7c3aed; font-family: monospace;
    }

    .widget-drag-placeholder {
      background: #ede9fe; border: 2px dashed #a78bfa;
      border-radius: 12px; min-height: 60px;
    }

    /* ── Config Panel ── */
    .config-panel {
      width: 0; overflow: hidden; background: white;
      border-left: 1px solid #e2e8f0; transition: width .2s;
      display: flex; flex-direction: column;
    }
    .config-panel.open { width: 360px; min-width: 360px; }
    .config-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; font-weight: 700; font-size: 13px;
      border-bottom: 1px solid #e2e8f0; color: #1e293b;
    }
    .config-body {
      flex: 1; overflow-y: auto; padding: 12px 16px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .config-section-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      color: #94a3b8; letter-spacing: .06em; margin-top: 4px;
    }
    .section-divider { margin: 8px 0; }
    .full-width { width: 100%; }
    .size-row { display: flex; gap: 8px; }
    .size-field { flex: 1; }

    .kv-rows { display: flex; flex-direction: column; gap: 4px; }
    .kv-row { display: flex; gap: 4px; align-items: center; }
    .kv-key { flex: 1; }
    .kv-value { flex: 1; }
    .add-param-btn { margin-top: 4px; }

    .data-preview {
      font-size: 10px; background: #f1f5f9; padding: 8px;
      border-radius: 6px; max-height: 200px; overflow: auto;
      white-space: pre-wrap; word-break: break-all;
      font-family: 'Cascadia Code', 'Fira Code', monospace;
    }

    .ep-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* ── Chart visualizations ── */
    .chart-container { margin-top: 10px; }
    .line-chart-svg { width: 100%; height: auto; max-height: 200px; }
    .chart-dot-label { font-size: 9px; fill: #475569; font-weight: 600; }
    .chart-axis-label { font-size: 8px; fill: #94a3b8; }

    .pie-container { display: flex; align-items: flex-start; gap: 12px; }
    .pie-chart-svg { width: 140px; min-width: 140px; height: auto; }
    .pie-legend { flex: 1; display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
    .pie-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; }
    .pie-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .pie-label-text { color: #475569; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pie-value-text { color: #1e293b; font-weight: 600; font-size: 10px; }

    /* ── Data table ── */
    .table-container { margin-top: 10px; overflow-x: auto; max-height: 240px; overflow-y: auto; }
    .data-table {
      width: 100%; border-collapse: collapse; font-size: 11px;
    }
    .data-table th {
      text-align: left; padding: 6px 8px; font-weight: 700; color: #475569;
      border-bottom: 2px solid #e2e8f0; background: #f8fafc;
      position: sticky; top: 0; z-index: 1;
    }
    .data-table td {
      padding: 5px 8px; border-bottom: 1px solid #f1f5f9; color: #1e293b;
      max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .data-table tbody tr:hover td { background: #f0f9ff; }
    .table-footer {
      font-size: 10px; color: #94a3b8; padding: 6px 8px;
      border-top: 1px solid #e2e8f0;
    }

    .data-error {
      display: flex; align-items: center; gap: 6px;
      margin-top: 8px; font-size: 11px; color: #d97706;
      background: #fffbeb; padding: 4px 8px; border-radius: 6px;
    }

    .preview-active .widget-card { cursor: default; }
  `]
})
export class DashboardBuilderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(DashboardService);
  private readonly api = inject(ApiService);

  readonly allModules = MODULES;
  readonly widthOptions = [3, 4, 6, 8, 12];
  readonly heightOptions = [1, 2, 3, 4, 5, 6];

  readonly widgetTypes: WidgetTypeRef[] = [
    { kind: 'line-chart',  label: 'Line Chart',  icon: 'show_chart',  color: '#2563eb' },
    { kind: 'pie-chart',   label: 'Pie Chart',   icon: 'pie_chart',   color: '#d97706' },
    { kind: 'data-table',  label: 'Data Table',  icon: 'table_chart', color: '#16a34a' },
    { kind: 'badge',        label: 'Badge',        icon: 'tag',         color: '#7c3aed' },
  ];

  readonly aggregationOptions: { value: AggregateFunction; label: string }[] = [
    { value: 'count', label: 'Count' },
    { value: 'sum',   label: 'Sum' },
    { value: 'avg',   label: 'Average' },
    { value: 'max',   label: 'Max' },
    { value: 'min',   label: 'Min' },
  ];

  // ── State ─────────────────────────────────────────────────────────────────

  readonly dashboardId = signal<string>('');
  readonly dashboardName = signal<string>('');
  readonly widgets = signal<DashboardWidget[]>([]);
  readonly selectedWidgetId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly fetching = signal(false);

  readonly selectedWidget = computed<DashboardWidget | null>(() => {
    const id = this.selectedWidgetId();
    return id ? this.widgets().find(w => w.id === id) ?? null : null;
  });

  readonly selectedModuleEndpoints = computed<EndpointDef[]>(() => {
    const widget = this.selectedWidget();
    if (!widget?.dataSource?.moduleApiPrefix) return [];
    const mod = MODULES.find(m => m.apiPrefix === widget.dataSource!.moduleApiPrefix);
    return mod?.endpoints ?? [];
  });

  // ── Browser state ─────────────────────────────────────────────────────────
  browserSearch = '';
  readonly expandedModules = signal<Set<string>>(new Set(MODULES.slice(0, 2).map(m => m.id)));

  readonly groupedEndpoints = computed(() => {
    const q = this.browserSearch.toLowerCase();
    return MODULES
      .map(mod => ({
        module: mod,
        endpoints: mod.endpoints.filter(ep =>
          !q || ep.label.toLowerCase().includes(q) || ep.method.toLowerCase().includes(q)
        ),
      }))
      .filter(g => g.endpoints.length > 0);
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.svc.getById(id);
      if (existing) {
        this.dashboardId.set(existing.id);
        this.dashboardName.set(existing.name);
        this.widgets.set([...existing.widgets]);
      } else {
        this.router.navigate(['/dashboards']);
      }
    } else {
      this.dashboardId.set(`db-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
    }
  }

  // ── Browser helpers ───────────────────────────────────────────────────────

  toggleModule(id: string) {
    this.expandedModules.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // ── Canvas drag & drop ────────────────────────────────────────────────────

  onCanvasDrop(event: CdkDragDrop<DashboardWidget[]>) {
    if (event.previousContainer === event.container) {
      // Reorder
      this.widgets.update(ws => {
        const arr = [...ws];
        const [item] = arr.splice(event.previousIndex, 1);
        arr.splice(event.currentIndex, 0, item);
        return arr;
      });
    } else {
      // New widget from browser
      const data = event.item.data as WidgetTypeRef;
      const newWidget: DashboardWidget = {
        id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        kind: data.kind,
        label: '',
        x: 0,
        y: 0,
        width: data.kind === 'data-table' ? 12 : data.kind === 'badge' ? 3 : 6,
        height: data.kind === 'badge' ? 2 : data.kind === 'data-table' ? 4 : 3,
        bindings: {},
      };
      this.widgets.update(ws => {
        const arr = [...ws];
        arr.splice(event.currentIndex, 0, newWidget);
        return arr;
      });
      this.selectedWidgetId.set(newWidget.id);
    }
  }

  // ── Widget CRUD ───────────────────────────────────────────────────────────

  selectWidget(id: string) {
    this.selectedWidgetId.set(this.selectedWidgetId() === id ? null : id);
  }

  removeWidget(id: string) {
    this.widgets.update(ws => ws.filter(w => w.id !== id));
    if (this.selectedWidgetId() === id) this.selectedWidgetId.set(null);
  }

  updateWidget(id: string, field: string, value: unknown) {
    this.widgets.update(ws => ws.map(w =>
      w.id === id ? { ...w, [field]: value } : w
    ));
  }

  updateBinding(id: string, key: string, value: string) {
    this.widgets.update(ws => ws.map(w => {
      if (w.id !== id) return w;
      return { ...w, bindings: { ...w.bindings, [key]: value } };
    }));
  }

  // ── Data source configuration ─────────────────────────────────────────────

  setDataSourceModule(widgetId: string, moduleApiPrefix: string) {
    const mod = MODULES.find(m => m.apiPrefix === moduleApiPrefix);
    if (!mod) return;
    this.widgets.update(ws => ws.map(w => {
      if (w.id !== widgetId) return w;
      return {
        ...w,
        dataSource: {
          moduleApiPrefix: mod.apiPrefix,
          moduleLabel: mod.label,
          pathTemplate: '',
          endpointLabel: '',
          method: 'GET',
          pathParams: {},
          queryParams: {},
        },
      };
    }));
  }

  setDataSourceEndpoint(widgetId: string, pathTemplate: string) {
    const widget = this.widgets().find(w => w.id === widgetId);
    if (!widget?.dataSource) return;
    const mod = MODULES.find(m => m.apiPrefix === widget.dataSource!.moduleApiPrefix);
    const ep = mod?.endpoints.find(e => e.pathTemplate === pathTemplate);
    if (!ep) return;
    this.widgets.update(ws => ws.map(w => {
      if (w.id !== widgetId) return w;
      return {
        ...w,
        dataSource: {
          ...w.dataSource!,
          pathTemplate: ep.pathTemplate,
          endpointLabel: ep.label,
          method: ep.method,
          pathParams: {},
        },
      };
    }));
  }

  getPathParamNames(pathTemplate: string): string[] {
    const matches = pathTemplate.match(/:(\w+)/g);
    return matches ? matches.map(m => m.slice(1)) : [];
  }

  updatePathParam(widgetId: string, param: string, value: string) {
    this.widgets.update(ws => ws.map(w => {
      if (w.id !== widgetId || !w.dataSource) return w;
      return {
        ...w,
        dataSource: {
          ...w.dataSource,
          pathParams: { ...w.dataSource.pathParams, [param]: value },
        },
      };
    }));
  }

  // ── Query params ──────────────────────────────────────────────────────────

  getQueryParamKeys(widget: DashboardWidget): string[] {
    return Object.keys(widget.dataSource?.queryParams ?? {});
  }

  addQueryParam(widgetId: string) {
    this.widgets.update(ws => ws.map(w => {
      if (w.id !== widgetId || !w.dataSource) return w;
      const key = `param${Object.keys(w.dataSource.queryParams).length + 1}`;
      return {
        ...w,
        dataSource: {
          ...w.dataSource,
          queryParams: { ...w.dataSource.queryParams, [key]: '' },
        },
      };
    }));
  }

  removeQueryParam(widgetId: string, key: string) {
    this.widgets.update(ws => ws.map(w => {
      if (w.id !== widgetId || !w.dataSource) return w;
      const qp = { ...w.dataSource.queryParams };
      delete qp[key];
      return { ...w, dataSource: { ...w.dataSource, queryParams: qp } };
    }));
  }

  updateQueryParam(widgetId: string, key: string, value: string) {
    this.widgets.update(ws => ws.map(w => {
      if (w.id !== widgetId || !w.dataSource) return w;
      return {
        ...w,
        dataSource: {
          ...w.dataSource,
          queryParams: { ...w.dataSource.queryParams, [key]: value },
        },
      };
    }));
  }

  renameQueryParam(widgetId: string, oldKey: string, newKey: string) {
    if (!newKey || oldKey === newKey) return;
    this.widgets.update(ws => ws.map(w => {
      if (w.id !== widgetId || !w.dataSource) return w;
      const qp = { ...w.dataSource.queryParams };
      const val = qp[oldKey];
      delete qp[oldKey];
      qp[newKey] = val;
      return { ...w, dataSource: { ...w.dataSource, queryParams: qp } };
    }));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  kindLabel(kind: WidgetKind): string {
    return this.widgetTypes.find(wt => wt.kind === kind)?.label ?? kind;
  }

  isArray(data: unknown): boolean {
    return Array.isArray(data);
  }

  /** Extract a field value from an item using dot-notation */
  private extractField(item: unknown, field: string): unknown {
    return this.svc.getPath(item, field);
  }

  /** Get array items from widget lastData */
  private getItems(widget: DashboardWidget): Record<string, unknown>[] {
    if (!Array.isArray(widget.lastData)) return [];
    return widget.lastData as Record<string, unknown>[];
  }

  // ── LINE CHART helpers ──────────────────────────────────────────────────

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
    // Show max ~12 dots to avoid clutter
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

  // ── PIE CHART helpers ──────────────────────────────────────────────────

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

    // Aggregate: group by label, sum values
    const map = new Map<string, number>();
    for (const item of items) {
      const label = labelField ? String(this.extractField(item, labelField) ?? 'Unknown') : `Item`;
      const val = Number(this.extractField(item, valueField)) || 0;
      map.set(label, (map.get(label) ?? 0) + val);
    }

    // Take top 10 entries
    const entries = [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
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

  // ── DATA TABLE helpers ──────────────────────────────────────────────────

  getTableColumns(widget: DashboardWidget): string[] {
    const cols = widget.bindings['columns'];
    if (!cols) {
      // Auto-detect from first item
      const items = this.getItems(widget);
      if (items.length > 0) {
        return Object.keys(items[0]).slice(0, 8);
      }
      return [];
    }
    return cols.split(',').map(c => c.trim()).filter(Boolean);
  }

  getTableRows(widget: DashboardWidget): Record<string, string>[] {
    const items = this.getItems(widget);
    const columns = this.getTableColumns(widget);
    // Max 50 rows for table display
    return items.slice(0, 50).map(item => {
      const row: Record<string, string> = {};
      for (const col of columns) {
        const val = this.extractField(item, col);
        row[col] = val == null ? '' : String(val);
      }
      return row;
    });
  }

  // ── BADGE helpers ────────────────────────────────────────────────────

  getBadgeValue(widget: DashboardWidget): string {
    const agg = (widget.bindings['aggregation'] || 'count') as AggregateFunction;
    const field = widget.bindings['valueField'];
    const data = widget.lastData;

    // Handle single object (non-array)
    if (data && !Array.isArray(data)) {
      if (agg === 'count') return '1';
      if (field) {
        const v = this.extractField(data, field);
        return v != null ? this.formatNum(Number(v)) : '–';
      }
      return '–';
    }

    const items = this.getItems(widget);
    if (items.length === 0) return '–';

    if (agg === 'count') return String(items.length);

    if (!field) return '–';
    const nums = items.map(it => Number(this.extractField(it, field))).filter(n => !isNaN(n));
    if (nums.length === 0) return '–';

    switch (agg) {
      case 'sum': return this.formatNum(nums.reduce((a, b) => a + b, 0));
      case 'avg': return this.formatNum(nums.reduce((a, b) => a + b, 0) / nums.length);
      case 'max': return this.formatNum(Math.max(...nums));
      case 'min': return this.formatNum(Math.min(...nums));
      default: return '–';
    }
  }

  // ── Formatting helpers ──────────────────────────────────────────────────

  private formatNum(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n % 1 !== 0 ? n.toFixed(2) : String(n);
  }

  private truncate(s: string, max: number): string {
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  // ── Fetch widget data (test) ──────────────────────────────────────────────

  async fetchWidgetData(widget: DashboardWidget) {
    if (!widget.dataSource) return;
    this.fetching.set(true);
    try {
      const ds = widget.dataSource;
      const pathParams: Record<string, string> = {};
      for (const [k, v] of Object.entries(ds.pathParams)) {
        pathParams[k] = v;
      }
      const queryParams: Record<string, string> = {};
      for (const [k, v] of Object.entries(ds.queryParams)) {
        queryParams[k] = v;
      }
      const res = await firstValueFrom(
        this.api.get(ds.moduleApiPrefix, ds.pathTemplate, pathParams, queryParams)
      );
      // Apply dataPath, then auto-detect wrapped arrays
      let data: unknown = res;
      if (widget.dataPath) {
        data = this.svc.getPath(res, widget.dataPath);
      }
      // Auto-detect wrapped arrays (e.g. { data: [...] })
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj['data'])) {
          data = obj['data'];
        } else {
          const firstArr = Object.values(obj).find(v => Array.isArray(v));
          if (firstArr) data = firstArr;
        }
      }
      this.widgets.update(ws => ws.map(w =>
        w.id === widget.id ? { ...w, lastData: data } : w
      ));
    } catch (err) {
      console.error('Failed to fetch widget data', err);
      this.widgets.update(ws => ws.map(w =>
        w.id === widget.id ? { ...w, lastData: { error: String(err) } } : w
      ));
    } finally {
      this.fetching.set(false);
    }
  }

  // ── Save & Preview ────────────────────────────────────────────────────────

  save() {
    this.saving.set(true);
    const dashboard: Dashboard = {
      id: this.dashboardId(),
      name: this.dashboardName() || 'Untitled Dashboard',
      widgets: this.widgets().map(w => ({ ...w, lastData: undefined })),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const existing = this.svc.getById(dashboard.id);
    if (existing) {
      dashboard.createdAt = existing.createdAt;
    }
    this.svc.upsert(dashboard);
    this.saving.set(false);
    this.router.navigate(['/dashboards']);
  }

  readonly previewMode = signal(false);

  async preview() {
    this.previewMode.set(true);
    this.selectedWidgetId.set(null);
    const promises = this.widgets()
      .filter(w => w.dataSource)
      .map(w => this.fetchWidgetData(w));
    await Promise.all(promises);
  }

  // ── Export PDF ───────────────────────────────────────────────────────────

  private readonly el = inject(ElementRef);
  readonly exporting = signal(false);

  async exportPdf() {
    const canvasArea = (this.el.nativeElement as HTMLElement).querySelector('.canvas-area') as HTMLElement;
    if (!canvasArea) return;

    // Ensure data is loaded first
    if (!this.previewMode()) {
      await this.preview();
    }

    this.exporting.set(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(canvasArea, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // A4 landscape for dashboards
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth / 2, imgHeight / 2 + 40],
      });

      // Title
      pdf.setFontSize(16);
      pdf.text(this.dashboardName() || 'Dashboard', 20, 25);

      pdf.addImage(imgData, 'PNG', 0, 35, imgWidth / 2, imgHeight / 2);
      pdf.save((this.dashboardName() || 'dashboard') + '.pdf');
    } finally {
      this.exporting.set(false);
    }
  }
}
