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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  CdkDragPlaceholder,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { DashboardService } from '../../services/dashboard.service';
import { ShareService } from '../../services/share.service';
import { UserManagementService } from '../../services/user-management.service';
import { ApiService } from '../../services/api.service';
import {
  Dashboard,
  DashboardWidget,
  WidgetKind,
  AggregateFunction,
  DataSourceMode,
} from '../../config/dashboard.types';
import { MODULES, ModuleDef, EndpointDef, extractPathParams } from '../../config/endpoints';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { ScriptEditorDialogComponent, ScriptEditorDialogData } from '../../shared/script-editor-dialog.component';
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
    MatSelectModule, MatTooltipModule, MatDividerModule, MatProgressSpinnerModule, MatCheckboxModule, MatDialogModule,
    CdkDrag, CdkDropList, CdkDropListGroup, CdkDragPlaceholder, CdkDragHandle,
    TranslatePipe,
  ],
  template: `
    <div class="builder-shell" cdkDropListGroup>
      <!-- ── BROWSER PANEL (left) ── -->
      @if (!previewMode()) {
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
      }

      <!-- ── CANVAS (center) ── -->
      <div class="canvas-panel">
        <div class="canvas-toolbar">
          <a mat-icon-button routerLink="/dashboards" matTooltip="{{ 'dashboard.back-to-dashboards' | t }}">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="name-input">
            <input matInput [value]="dashboardName()" (input)="dashboardName.set($any($event.target).value)"
                   placeholder="{{ 'dashboard.name-placeholder' | t }}" [readonly]="previewMode()" />
          </mat-form-field>
          <span class="spacer"></span>
          @if (!previewMode()) {
          <button mat-flat-button color="primary" (click)="save()" [disabled]="saving()">
            @if (saving()) { <mat-spinner diameter="16" /> }
            <mat-icon>save</mat-icon> {{ 'dashboard.save' | t }}
          </button>
          }
          @if (previewMode()) {
          <button mat-stroked-button (click)="previewMode.set(false)">
            <mat-icon>edit</mat-icon> {{ 'dashboard.exit-preview' | t }}
          </button>
          } @else {
          <button mat-stroked-button (click)="preview()" [disabled]="widgets().length === 0">
            <mat-icon>visibility</mat-icon> {{ 'dashboard.preview' | t }}
          </button>
          }
          <button mat-stroked-button (click)="exportPdf()" [disabled]="widgets().length === 0 || exporting()">
            @if (exporting()) { <mat-spinner diameter="16" /> }
            <mat-icon>picture_as_pdf</mat-icon> {{ 'dashboard.export-pdf' | t }}
          </button>
          <button mat-stroked-button (click)="exportExcel()" [disabled]="widgets().length === 0 || exportingExcel()">
            @if (exportingExcel()) { <mat-spinner diameter="16" /> }
            <mat-icon>table_view</mat-icon> {{ 'dashboard.export-excel' | t }}
          </button>
          <button mat-stroked-button (click)="toggleSharePanel()" [disabled]="!dashboardId()">
            <mat-icon>{{ shareUrl() ? 'link' : 'share' }}</mat-icon> {{ 'dashboard.share' | t }}
          </button>
          @if (shareCopied()) {
            <span class="share-copied-badge"><mat-icon>check</mat-icon> Copied!</span>
          }
        </div>

        <!-- Share panel overlay -->
        @if (sharePanelOpen()) {
          <div class="share-panel-backdrop" (click)="sharePanelOpen.set(false)"></div>
          <div class="share-panel">
            <div class="share-panel-header">
              <mat-icon>group</mat-icon>
              <span>Share with users</span>
              <span class="spacer"></span>
              <button mat-icon-button (click)="sharePanelOpen.set(false)"><mat-icon>close</mat-icon></button>
            </div>
            <div class="share-panel-body">
              @for (user of shareableUsers(); track user.email) {
                <label class="share-user-row">
                  <mat-checkbox [checked]="isUserSelected(user.email)" (change)="toggleShareUser(user.email)"></mat-checkbox>
                  <span class="share-user-name">{{ user.name || user.email }}</span>
                  <span class="share-user-email">{{ user.email }}</span>
                </label>
              }
              @if (shareableUsers().length === 0) {
                <div class="share-no-users">No other users registered</div>
              }
            </div>
            <div class="share-panel-footer">
              <button mat-flat-button color="primary" (click)="shareDashboard()">
                <mat-icon>send</mat-icon> {{ selectedShareUsers().length > 0 ? 'Share with selected' : 'Share public link' }}
              </button>
              @if (shareUrl()) {
                <div class="share-url-display">
                  <input readonly [value]="shareUrl()" (click)="$event.target.select()" class="share-url-input" />
                  <button mat-icon-button (click)="copyShareUrl()" matTooltip="Copy link">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </div>
              }
            </div>
          </div>
        }

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
                 cdkDrag [cdkDragData]="widget" [cdkDragDisabled]="previewMode()"
                 [class.selected]="!previewMode() && selectedWidgetId() === widget.id"
                 [style.grid-column]="'span ' + widget.width"
                 [style.grid-row]="'span ' + widget.height"
                 (click)="!previewMode() && selectWidget(widget.id)">
              <div class="widget-header">
                <mat-icon class="widget-type-icon">
                  @if (widget.kind === 'search-text') { search }
                  @else if (widget.kind === 'line-chart') { show_chart }
                  @else if (widget.kind === 'bar-chart') { bar_chart }
                  @else if (widget.kind === 'pie-chart') { pie_chart }
                  @else if (widget.kind === 'badge') { tag }
                  @else { table_chart }
                </mat-icon>
                <span class="widget-title">{{ widget.label || kindLabel(widget.kind) }}</span>
                <span class="widget-badge">{{ kindLabel(widget.kind) }}</span>
                @if (previewMode() && (widget.dataSource || widget.dataSourceMode === 'script') && widget.kind !== 'search-text') {
                  <button mat-icon-button class="widget-refresh-btn" (click)="fetchWidgetData(widget); $event.stopPropagation()" matTooltip="Refresh data">
                    <mat-icon>refresh</mat-icon>
                  </button>
                }
                @if (!previewMode()) {
                <div class="widget-actions" (click)="$event.stopPropagation()">
                  <button mat-icon-button (click)="selectWidget(widget.id)" matTooltip="{{ 'dashboard.configure' | t }}">
                    <mat-icon>settings</mat-icon>
                  </button>
                  <button mat-icon-button (click)="removeWidget(widget.id)" color="warn" matTooltip="{{ 'dashboard.remove-widget' | t }}">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                  <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                </div>
                }
              </div>
              <div class="widget-preview">
                <!-- SEARCH TEXT widget -->
                @if (widget.kind === 'search-text') {
                  <div class="search-text-preview">
                    <mat-icon class="search-input-icon">search</mat-icon>
                    <input class="search-input" type="text"
                           [value]="searchFilter()"
                           (input)="searchFilter.set($any($event.target).value)"
                           (click)="$event.stopPropagation()"
                           placeholder="{{ widget.label || ('dashboard.search-placeholder' | t) }}" />
                    @if (searchFilter()) {
                      <button class="search-clear" (click)="searchFilter.set(''); $event.stopPropagation()">
                        <mat-icon>close</mat-icon>
                      </button>
                    }
                  </div>
                }
                @if (widget.dataSource) {
                  <span class="data-source-tag">
                    <mat-icon style="font-size:12px;width:12px;height:12px">cloud</mat-icon>
                    {{ widget.dataSource.moduleLabel }} › {{ widget.dataSource.endpointLabel }}
                  </span>
                } @else if (widget.dataSourceMode === 'script') {
                  <span class="data-source-tag">
                    <mat-icon style="font-size:12px;width:12px;height:12px">code</mat-icon>
                    Script
                  </span>
                } @else {
                  <span class="no-source">{{ 'dashboard.no-data-source' | t }}</span>
                }
                @if (!widget.lastData) {
                  @if (widget.kind === 'line-chart' || widget.kind === 'bar-chart' || widget.kind === 'pie-chart') {
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

                  <!-- BAR CHART -->
                  @if (widget.kind === 'bar-chart') {
                    <div class="chart-container">
                      <svg [attr.viewBox]="'0 0 400 220'" class="bar-chart-svg" preserveAspectRatio="xMidYMid meet">
                        <!-- Grid lines -->
                        <line x1="40" y1="10" x2="40" y2="180" stroke="#e2e8f0" stroke-width="1" />
                        <line x1="40" y1="180" x2="390" y2="180" stroke="#e2e8f0" stroke-width="1" />
                        @for (gl of [0.25, 0.5, 0.75]; track gl) {
                          <line [attr.x1]="40" [attr.y1]="180 - 170 * gl" [attr.x2]="390" [attr.y2]="180 - 170 * gl" stroke="#f1f5f9" stroke-width="1" />
                        }
                        <!-- Bars -->
                        @for (bar of getBarChartBars(widget); track $index) {
                          <rect [attr.x]="bar.x" [attr.y]="bar.y" [attr.width]="bar.width" [attr.height]="bar.height" [attr.fill]="bar.color" rx="3" />
                          <text [attr.x]="bar.x + bar.width / 2" [attr.y]="bar.y - 5" text-anchor="middle" class="chart-dot-label">{{ bar.val }}</text>
                        }
                        <!-- X-axis labels -->
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
                  <pre class="data-preview" style="max-height:120px;margin-top:4px">{{ widget.lastData | json }}</pre>
                }
              </div>
              <div *cdkDragPlaceholder class="widget-drag-placeholder"></div>
              @if (!previewMode()) {
              <div class="widget-resize-handle resize-e" (mousedown)="onWidgetResizeStart($event, widget, 'e')" (click)="$event.stopPropagation()"></div>
              <div class="widget-resize-handle resize-s" (mousedown)="onWidgetResizeStart($event, widget, 's')" (click)="$event.stopPropagation()"></div>
              <div class="widget-resize-handle resize-se" (mousedown)="onWidgetResizeStart($event, widget, 'se')" (click)="$event.stopPropagation()"></div>
              }
            </div>
          }
        </div>
      </div>

      <!-- ── CONFIG PANEL (right) ── -->
      @if (!previewMode()) {
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

            @if (widget.kind === 'search-text') {
              <p class="config-hint">{{ 'dashboard.search-text-hint' | t }}</p>
            }

            @if (widget.kind !== 'search-text') {

            <mat-divider class="section-divider" />

            <!-- Data source mode toggle -->
            <div class="config-section-label">{{ 'dashboard.data-source-mode' | t }}</div>
            <div class="body-mode-toggle">
              <button mat-stroked-button
                      [class.active-mode]="getDataSourceMode(widget) === 'api'"
                      (click)="updateWidget(widget.id, 'dataSourceMode', 'api')">
                <mat-icon>api</mat-icon> {{ 'dashboard.api-mode' | t }}
              </button>
              <button mat-stroked-button
                      [class.active-mode]="getDataSourceMode(widget) === 'script'"
                      (click)="updateWidget(widget.id, 'dataSourceMode', 'script')">
                <mat-icon>code</mat-icon> {{ 'dashboard.script-mode' | t }}
              </button>
            </div>

            <!-- ── SCRIPT MODE ── -->
            @if (getDataSourceMode(widget) === 'script') {
              <mat-divider class="section-divider" />
              <div class="config-section-label">
                {{ 'dashboard.script-code' | t }}
                <button mat-icon-button class="open-editor-btn"
                        matTooltip="Open Editor"
                        (click)="openScriptEditor(widget)">
                  <mat-icon>open_in_new</mat-icon>
                </button>
              </div>
              <p class="config-hint">{{ 'dashboard.script-hint' | t }}</p>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'dashboard.script-code' | t }}</mat-label>
                <textarea matInput rows="14"
                          [value]="widget.scriptCode ?? ''"
                          (input)="onWidgetScriptInput($any($event.target), widget.id)"
                          (keydown)="onScriptKeydown($event)"
                          (blur)="closeScriptAc()"
                          placeholder="// All API modules available (e.g. ImpossibleCloud, ZohoCRM)&#10;&#10;const regions = await ImpossibleCloud.ListRegions();&#10;return regions.regions;"
                          class="script-textarea"></textarea>
                <mat-hint>{{ 'dashboard.script-async-hint' | t }}</mat-hint>
              </mat-form-field>
            }

            <!-- ── API MODE ── -->
            @if (getDataSourceMode(widget) === 'api') {
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
            } <!-- end API mode -->

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

            @if (widget.kind === 'line-chart' || widget.kind === 'bar-chart' || widget.kind === 'pie-chart') {
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
            <button mat-flat-button color="accent" class="full-width" (click)="fetchWidgetData(widget)" [disabled]="(!widget.dataSource && getDataSourceMode(widget) !== 'script') || fetching()">
              @if (fetching()) { <mat-spinner diameter="16" /> }
              <mat-icon>{{ getDataSourceMode(widget) === 'script' ? 'play_arrow' : 'cloud_download' }}</mat-icon>
              {{ getDataSourceMode(widget) === 'script' ? ('dashboard.run-script' | t) : ('dashboard.fetch-data' | t) }}
            </button>

            @if (widget.lastData !== undefined) {
              <div class="config-section-label" style="margin-top:12px">{{ 'dashboard.fetched-data' | t }}</div>
              <pre class="data-preview">{{ widget.lastData | json }}</pre>
            }

            } <!-- end: not search-text -->
          </div>
        }
      </div>
      }

      <!-- Script IntelliSense overlay -->
      @if (scriptAcSuggestions().length > 0) {
        <div class="ac-overlay" [ngStyle]="scriptAcStyle()">
          @for (s of scriptAcSuggestions(); track s.insertText; let i = $index) {
            <div class="ac-item" [class.ac-active]="i === scriptAcIndex()"
                 (mousedown)="insertScriptSuggestion(s, $event)">
              <mat-icon class="ac-icon">{{ s.icon }}</mat-icon>
              <div class="ac-text">
                <span class="ac-label">{{ s.label }}</span>
                <span class="ac-detail">{{ s.detail }}</span>
              </div>
            </div>
          }
        </div>
      }
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
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-auto-rows: 80px;
      gap: 12px;
      min-height: 200px;
      align-content: start;
    }
    .canvas-empty {
      grid-column: 1 / -1;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 200px; color: #94a3b8; gap: 8px;
    }
    .canvas-empty mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .canvas-empty p { font-size: 13px; }

    /* ── Widget Cards ── */
    .widget-card {
      border: 1px solid #e2e8f0; border-radius: 12px;
      background: white; padding: 12px 16px;
      cursor: pointer; transition: border-color .15s, box-shadow .15s;
      position: relative;
      display: flex; flex-direction: column;
    }
    .widget-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
    .widget-card.selected { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,.2); }
    .widget-card--line-chart { border-left: 4px solid #2563eb; }
    .widget-card--bar-chart  { border-left: 4px solid #0891b2; }
    .widget-card--pie-chart  { border-left: 4px solid #d97706; }
    .widget-card--data-table { border-left: 4px solid #16a34a; }
    .widget-card--badge      { border-left: 4px solid #7c3aed; }
    .widget-card--search-text { border-left: 4px solid #0f172a; }

    .bar-chart-svg { width: 100%; height: auto; }

    /* Search text widget */
    .search-text-preview {
      display: flex; align-items: center; gap: 8px;
      border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px;
      background: #f8fafc; transition: border-color .15s;
    }
    .search-text-preview:focus-within { border-color: #0f172a; background: white; }
    .search-input-icon { font-size: 20px; width: 20px; height: 20px; color: #94a3b8; flex-shrink: 0; }
    .search-input {
      border: none; outline: none; background: transparent;
      flex: 1; font-size: 13px; color: #1e293b; font-family: inherit;
    }
    .search-input::placeholder { color: #94a3b8; }
    .search-clear {
      border: none; background: none; cursor: pointer; padding: 0;
      display: flex; align-items: center;
    }
    .search-clear mat-icon { font-size: 18px; width: 18px; height: 18px; color: #94a3b8; }
    .search-clear:hover mat-icon { color: #475569; }

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
    .widget-refresh-btn { width: 24px !important; height: 24px !important; line-height: 24px !important; opacity: 0.5; }
    .widget-refresh-btn:hover { opacity: 1; }
    .widget-refresh-btn mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .drag-handle { cursor: grab; color: #94a3b8; font-size: 18px; width: 18px; height: 18px; }

    .widget-preview { margin-top: 8px; flex: 1; overflow: auto; }
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

    /* ── Resize Handles ── */
    .widget-resize-handle { position: absolute; z-index: 2; }
    .widget-resize-handle.resize-e {
      top: 8px; right: 0; bottom: 8px; width: 6px;
      cursor: ew-resize; border-radius: 0 6px 6px 0;
    }
    .widget-resize-handle.resize-s {
      left: 8px; right: 8px; bottom: 0; height: 6px;
      cursor: ns-resize; border-radius: 0 0 6px 6px;
    }
    .widget-resize-handle.resize-se {
      bottom: 0; right: 0; width: 16px; height: 16px;
      cursor: nwse-resize;
    }
    .widget-resize-handle.resize-se::after {
      content: '';
      position: absolute; bottom: 4px; right: 4px;
      width: 8px; height: 8px;
      border-right: 2px solid #cbd5e1;
      border-bottom: 2px solid #cbd5e1;
      transition: border-color .15s;
    }
    .widget-card:hover .widget-resize-handle.resize-e,
    .widget-card:hover .widget-resize-handle.resize-s {
      background: rgba(124, 58, 237, 0.08);
    }
    .widget-card:hover .widget-resize-handle.resize-se::after {
      border-color: #7c3aed;
    }
    .widget-resize-handle.resize-e:hover,
    .widget-resize-handle.resize-s:hover {
      background: rgba(124, 58, 237, 0.18) !important;
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
      display: flex; align-items: center; gap: 4px;
    }
    .section-divider { margin: 8px 0; }
    .full-width { width: 100%; }
    .size-row { display: flex; gap: 8px; }
    .share-url-chip {
      display: flex; align-items: center; gap: 4px; padding: 4px 10px;
      background: #dbeafe; color: #1d4ed8; border-radius: 6px; font-size: 11px;
      cursor: pointer; max-width: 260px; overflow: hidden;
    }
    .share-url-chip:hover { background: #bfdbfe; }
    .share-url-chip mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .share-url-chip span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .share-copied-badge {
      display: inline-flex; align-items: center; gap: 4px;
      color: #16a34a; font-size: 12px; font-weight: 600;
    }
    .share-copied-badge mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .share-url-display {
      display: flex; align-items: center; gap: 4px; margin-top: 8px; width: 100%;
    }
    .share-url-input {
      flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px;
      font-size: 12px; color: #1e293b; background: #f8fafc; outline: none;
      min-width: 0;
    }
    .share-url-input:focus { border-color: #3b82f6; }

    .share-panel-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.15); z-index: 900; }
    .share-panel {
      position: fixed; top: 56px; right: 24px; z-index: 901;
      width: 360px; background: white;
      border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,.18);
      display: flex; flex-direction: column;
      max-height: calc(100vh - 80px);
    }
    .share-panel-header {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; font-weight: 700; font-size: 14px; color: #1e293b;
      border-bottom: 1px solid #e2e8f0;
    }
    .share-panel-header .spacer { flex: 1; }
    .share-panel-body { flex: 1; overflow-y: auto; padding: 8px 0; max-height: 240px; min-height: 60px; }
    .share-user-row {
      display: flex; align-items: center; gap: 8px; padding: 6px 16px; cursor: pointer;
    }
    .share-user-row:hover { background: #f8fafc; }
    .share-user-name { font-size: 13px; font-weight: 600; color: #334155; }
    .share-user-email { font-size: 11px; color: #94a3b8; margin-left: auto; }
    .share-no-users { padding: 24px 16px; text-align: center; color: #94a3b8; font-size: 13px; }
    .share-panel-footer {
      display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
    }
    .share-panel-footer .share-url-display { flex-basis: 100%; }

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

    .script-textarea {
      font-family: 'Cascadia Code', 'Fira Code', monospace;
      font-size: 11px; line-height: 1.5;
      min-height: 200px; resize: vertical; tab-size: 2;
    }
    .open-editor-btn {
      width: 24px; height: 24px; line-height: 24px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .body-mode-toggle {
      display: flex; gap: 4px; margin-bottom: 12px;
    }
    .body-mode-toggle button { flex: 1; font-size: 11px; }
    .active-mode { background: #e0f2fe !important; border-color: #0891b2 !important; color: #0891b2 !important; }

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

    /* ── Script IntelliSense overlay ── */
    .ac-overlay {
      position: fixed; z-index: 1000;
      background: white; border: 1px solid #e2e8f0;
      border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.12);
      max-height: 240px; overflow-y: auto;
    }
    .ac-item {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 12px; cursor: pointer; font-size: 12px;
    }
    .ac-item:hover, .ac-active { background: #f0fdfa; }
    .ac-icon { font-size: 16px; width: 16px; height: 16px; color: #0891b2; }
    .ac-text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .ac-label { font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ac-detail { font-size: 10px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  `]
})
export class DashboardBuilderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(DashboardService);
  private readonly shareSvc = inject(ShareService);
  private readonly api = inject(ApiService);

  readonly allModules = MODULES;
  readonly widthOptions = [3, 4, 6, 8, 12];
  readonly heightOptions = [1, 2, 3, 4, 5, 6];

  readonly widgetTypes: WidgetTypeRef[] = [
    { kind: 'search-text', label: 'Search Text', icon: 'search',        color: '#0f172a' },
    { kind: 'line-chart',  label: 'Line Chart',  icon: 'show_chart',    color: '#2563eb' },
    { kind: 'bar-chart',   label: 'Bar Chart',   icon: 'bar_chart',    color: '#0891b2' },
    { kind: 'pie-chart',   label: 'Pie Chart',   icon: 'pie_chart',    color: '#d97706' },
    { kind: 'data-table',  label: 'Data Table',  icon: 'table_chart',  color: '#16a34a' },
    { kind: 'badge',        label: 'Badge',        icon: 'tag',           color: '#7c3aed' },
  ];

  /** Global search text signal — drives filtering of all widget data */
  readonly searchFilter = signal<string>('');

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

  // ── Resize state ──
  private resizingWidgetId: string | null = null;
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartWidth = 0;
  private resizeStartHeight = 0;
  private gridColWidth = 0;
  private readonly GRID_ROW_HEIGHT = 80;
  private readonly GRID_GAP = 12;

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
        width: this.getDefaultWidth(data.kind),
        height: this.getDefaultHeight(data.kind),
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

  /** Safely convert unknown value to string without [object Object] */
  private safeStr(val: unknown, fallback = ''): string {
    if (val == null) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    return JSON.stringify(val);
  }

  /** Default widget width based on kind */
  private getDefaultWidth(kind: WidgetKind): number {
    switch (kind) {
      case 'data-table': case 'search-text': return 12;
      case 'badge': return 3;
      default: return 6;
    }
  }

  /** Default widget height based on kind */
  private getDefaultHeight(kind: WidgetKind): number {
    switch (kind) {
      case 'search-text': return 1;
      case 'badge': return 2;
      case 'data-table': case 'bar-chart': return 4;
      default: return 3;
    }
  }

  /** Get array items from widget lastData, filtered by global search text */
  private getItems(widget: DashboardWidget): Record<string, unknown>[] {
    if (!Array.isArray(widget.lastData)) return [];
    const items = widget.lastData as Record<string, unknown>[];
    const q = this.searchFilter().toLowerCase().trim();
    if (!q) return items;
    return items.filter(item =>
      Object.values(item).some(v =>
        v != null && this.safeStr(v).toLowerCase().includes(q)
      )
    );
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
        text: this.truncate(this.safeStr(this.extractField(item, labelField)), 10),
      }))
      .filter((_, i) => i % skip === 0 || i === items.length - 1);
  }

  // ── BAR CHART helpers ──────────────────────────────────────────────────

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
    // Limit to 30 bars to avoid clutter
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
        text: this.truncate(this.safeStr(this.extractField(item, labelField)), 8),
      }))
      .filter((_, i) => i % skip === 0);
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
      const label = labelField ? this.safeStr(this.extractField(item, labelField), 'Unknown') : 'Item';
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
        row[col] = this.safeStr(val);
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
        return v == null ? '–' : this.formatNum(Number(v));
      }
      return '–';
    }

    const items = this.getItems(widget);
    if (items.length === 0) return '–';

    if (agg === 'count') return String(items.length);

    if (!field) return '–';
    const nums = items.map(it => Number(this.extractField(it, field))).filter(n => !Number.isNaN(n));
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
    return n % 1 === 0 ? String(n) : n.toFixed(2);
  }

  private truncate(s: string, max: number): string {
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  // ── Widget resize ─────────────────────────────────────────────────────────

  onWidgetResizeStart(event: MouseEvent, widget: DashboardWidget, direction: 'e' | 's' | 'se') {
    event.preventDefault();
    event.stopPropagation();

    this.resizingWidgetId = widget.id;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartWidth = widget.width;
    this.resizeStartHeight = widget.height;

    const canvasEl = (this.el.nativeElement as HTMLElement).querySelector('.canvas-area');
    if (canvasEl) {
      const contentWidth = canvasEl.clientWidth - 40; // 20px padding each side
      this.gridColWidth = (contentWidth - this.GRID_GAP * 11) / 12;
    }

    const onMove = (ev: MouseEvent) => {
      if (!this.resizingWidgetId) return;
      const deltaX = ev.clientX - this.resizeStartX;
      const deltaY = ev.clientY - this.resizeStartY;

      let newWidth = this.resizeStartWidth;
      let newHeight = this.resizeStartHeight;

      if (direction === 'e' || direction === 'se') {
        newWidth = Math.max(1, Math.min(12, this.resizeStartWidth + Math.round(deltaX / (this.gridColWidth + this.GRID_GAP))));
      }
      if (direction === 's' || direction === 'se') {
        newHeight = Math.max(1, Math.min(6, this.resizeStartHeight + Math.round(deltaY / (this.GRID_ROW_HEIGHT + this.GRID_GAP))));
      }

      this.widgets.update(ws => ws.map(w =>
        w.id === this.resizingWidgetId ? { ...w, width: newWidth, height: newHeight } : w
      ));
    };

    const onUp = () => {
      this.resizingWidgetId = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const cursorMap: Record<string, string> = { e: 'ew-resize', s: 'ns-resize', se: 'nwse-resize' };
    document.body.style.cursor = cursorMap[direction];
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ── Fetch widget data (test) ──────────────────────────────────────────────

  async fetchWidgetData(widget: DashboardWidget) {
    const mode = this.getDataSourceMode(widget);

    if (mode === 'script') {
      return this.fetchWidgetDataFromScript(widget);
    }

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
      const data = this.extractArrayData(res, widget.dataPath);
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

  /** Execute script datasource — same async pattern as workflow/form scripts */
  private async fetchWidgetDataFromScript(widget: DashboardWidget) {
    const code = widget.scriptCode ?? '';
    if (!code.trim()) return;

    this.fetching.set(true);
    try {
      const apiProxies = this.buildScriptApiProxies();
      const args: Record<string, unknown> = { ...apiProxies };

      const argNames = Object.keys(args);
      const argValues = argNames.map(n => args[n]);

      // eslint-disable-next-line no-new-func
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction(...argNames, code);
      const res = await fn(...argValues);

      const data = this.extractArrayData(res, widget.dataPath);
      this.widgets.update(ws => ws.map(w =>
        w.id === widget.id ? { ...w, lastData: data } : w
      ));
    } catch (err) {
      console.error('Failed to run widget script', err);
      this.widgets.update(ws => ws.map(w =>
        w.id === widget.id ? { ...w, lastData: { error: err instanceof Error ? err.message : String(err) } } : w
      ));
    } finally {
      this.fetching.set(false);
    }
  }

  /** Apply dataPath and auto-detect wrapped arrays (searches up to 3 levels deep) */
  private extractArrayData(res: unknown, dataPath?: string): unknown {
    let data: unknown = res;
    if (dataPath) {
      data = this.svc.getPath(res, dataPath);
    }
    // Already an array — return as-is
    if (Array.isArray(data)) return data;
    // Try to find an array inside the object (up to 3 levels deep)
    if (data && typeof data === 'object') {
      const found = this.findNestedArray(data, 3);
      if (found) return found;
    }
    return data;
  }

  /** Recursively search for the first array property in an object, up to maxDepth levels */
  private findNestedArray(obj: unknown, maxDepth: number): unknown[] | null {
    if (!obj || typeof obj !== 'object' || maxDepth <= 0) return null;
    const record = obj as Record<string, unknown>;
    // First pass: direct array children (prefer 'data', then 'records', then 'items', then first found)
    for (const key of ['data', 'records', 'items']) {
      if (Array.isArray(record[key])) return record[key] as unknown[];
    }
    for (const val of Object.values(record)) {
      if (Array.isArray(val)) return val as unknown[];
    }
    // Second pass: recurse into nested objects
    for (const val of Object.values(record)) {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const found = this.findNestedArray(val, maxDepth - 1);
        if (found) return found;
      }
    }
    return null;
  }

  getDataSourceMode(widget: DashboardWidget): DataSourceMode {
    return widget.dataSourceMode ?? 'api';
  }

  /**
   * Build API proxy objects for all registered modules so scripts can call e.g.:
   *   const regions = await ImpossibleCloud.ListRegions();
   */
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
          const pathParams = this.resolveProxyPathParams(hasParams, args);
          const body = this.resolveProxyBody(hasBody, hasParams, args);
          return this.callProxyApi(mod.apiPrefix, ep.pathTemplate, httpMethod, pathParams, body);
        };
      }

      proxies[proxyName] = obj;
    }

    return proxies;
  }

  private resolveProxyPathParams(hasParams: boolean, args: unknown[]): Record<string, string> {
    const pathParams: Record<string, string> = {};
    if (hasParams && args[0] && typeof args[0] === 'object') {
      for (const [k, v] of Object.entries(args[0] as Record<string, unknown>)) {
        if (v == null) pathParams[k] = '';
        else if (typeof v === 'string') pathParams[k] = v;
        else pathParams[k] = JSON.stringify(v);
      }
    }
    return pathParams;
  }

  private resolveProxyBody(hasBody: boolean, hasParams: boolean, args: unknown[]): Record<string, unknown> | undefined {
    if (!hasBody) return undefined;
    const bodyArg = hasParams ? args[1] : args[0];
    return (bodyArg && typeof bodyArg === 'object') ? bodyArg as Record<string, unknown> : undefined;
  }

  private callProxyApi(
    apiPrefix: string, pathTemplate: string,
    httpMethod: 'get' | 'post' | 'put' | 'patch' | 'delete',
    pathParams: Record<string, string>,
    body: Record<string, unknown> | undefined,
  ): Promise<unknown> {
    if (httpMethod === 'get' || httpMethod === 'delete') {
      return firstValueFrom(this.api[httpMethod](apiPrefix, pathTemplate, pathParams));
    }
    const call = ({ post: this.api.post, put: this.api.put, patch: this.api.patch } as Record<string, typeof this.api.post>)[httpMethod] ?? this.api.post;
    return firstValueFrom(call.call(this.api, apiPrefix, pathTemplate, pathParams, body ?? {}));
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
      .filter(w => w.dataSource || w.dataSourceMode === 'script')
      .map(w => this.fetchWidgetData(w));
    await Promise.all(promises);
  }

  // ── Export PDF ───────────────────────────────────────────────────────────

  private readonly el = inject(ElementRef);
  private readonly dialog = inject(MatDialog);
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

  // ── Export Excel ─────────────────────────────────────────────────────────

  readonly exportingExcel = signal(false);

  async exportExcel() {
    // Ensure data is loaded first
    if (!this.previewMode()) {
      await this.preview();
    }

    this.exportingExcel.set(true);
    try {
      const ExcelJS = await import('exceljs');
      const { saveAs } = await import('file-saver');
      const wb = new ExcelJS.Workbook();
      wb.creator = 'cloud42 Platform';
      wb.created = new Date();

      const dashName = this.dashboardName() || 'Dashboard';

      // ── Summary sheet ──
      const summaryWs = wb.addWorksheet('Summary');
      summaryWs.columns = [
        { header: 'Dashboard', key: 'name', width: 30 },
        { header: 'Exported', key: 'date', width: 22 },
        { header: 'Widgets', key: 'count', width: 12 },
      ];
      summaryWs.addRow({ name: dashName, date: new Date().toLocaleString(), count: this.widgets().length });
      this.styleHeaderRow(summaryWs);

      // ── One sheet per widget ──
      for (const widget of this.widgets()) {
        if (widget.kind === 'search-text') continue; // no data to export

        const sheetName = this.sanitizeSheetName(widget.label || this.kindLabel(widget.kind), wb);
        const ws = wb.addWorksheet(sheetName);

        if (widget.kind === 'data-table') {
          this.exportDataTableSheet(ws, widget);
        } else if (widget.kind === 'badge') {
          this.exportBadgeSheet(ws, widget);
        } else if (widget.kind === 'line-chart') {
          this.exportLineChartSheet(ws, wb, widget, sheetName);
        } else if (widget.kind === 'bar-chart') {
          this.exportBarChartSheet(ws, wb, widget, sheetName);
        } else if (widget.kind === 'pie-chart') {
          this.exportPieChartSheet(ws, wb, widget, sheetName);
        }
      }

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, (dashName + '.xlsx').replaceAll(/[\\/:*?"<>|]/g, '_'));
    } finally {
      this.exportingExcel.set(false);
    }
  }

  private sanitizeSheetName(name: string, wb: import('exceljs').Workbook): string {
    // Excel sheet names: max 31 chars, no special chars
    let clean = name.replaceAll(/[\\/:*?[\]]/g, '').substring(0, 28);
    if (!clean) clean = 'Sheet';
    // Ensure unique
    let suffix = 1;
    let final = clean;
    while (wb.getWorksheet(final)) {
      final = clean.substring(0, 28 - String(suffix).length - 1) + '_' + suffix;
      suffix++;
    }
    return final;
  }

  private styleHeaderRow(ws: import('exceljs').Worksheet) {
    const row = ws.getRow(1);
    row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    row.alignment = { vertical: 'middle', horizontal: 'left' };
    row.height = 24;
  }

  private exportDataTableSheet(ws: import('exceljs').Worksheet, widget: DashboardWidget) {
    const columns = this.getTableColumns(widget);
    const rows = this.getItems(widget);

    ws.columns = columns.map(col => ({
      header: col,
      key: col,
      width: Math.max(12, Math.min(40, col.length + 4)),
    }));

    for (const item of rows) {
      const row: Record<string, unknown> = {};
      for (const col of columns) {
        const val = this.extractField(item, col);
        row[col] = val ?? '';
      }
      ws.addRow(row);
    }

    this.styleHeaderRow(ws);

    // Add Excel table for filtering/sorting
    if (rows.length > 0) {
      const lastCol = String.fromCodePoint(64 + columns.length); // A, B, C...
      const ref = columns.length <= 26
        ? `A1:${lastCol}${rows.length + 1}`
        : `A1:${this.colLetter(columns.length)}${rows.length + 1}`;
      ws.addTable({
        name: 'Table_' + ws.name.replaceAll(/[^a-zA-Z0-9]/g, ''),
        ref,
        headerRow: true,
        style: { theme: 'TableStyleMedium2', showRowStripes: true },
        columns: columns.map(c => ({ name: c, filterButton: true })),
        rows: rows.map(item => columns.map(col => this.extractField(item, col) ?? '')),
      });
    }
  }

  private exportBadgeSheet(ws: import('exceljs').Worksheet, widget: DashboardWidget) {
    const agg = (widget.bindings['aggregation'] || 'count') as AggregateFunction;
    const field = widget.bindings['valueField'];

    ws.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    ws.addRow({ metric: widget.label || 'Badge', value: this.getBadgeValue(widget) });
    ws.addRow({ metric: 'Aggregation', value: agg });
    if (field) ws.addRow({ metric: 'Field', value: field });
    if (widget.bindings['suffix']) ws.addRow({ metric: 'Suffix', value: widget.bindings['suffix'] });

    this.styleHeaderRow(ws);

    // Also add raw data if available
    if (Array.isArray(widget.lastData) && widget.lastData.length > 0) {
      const items = this.getItems(widget);
      const startRow = ws.rowCount + 2;
      ws.getCell(`A${startRow}`).value = 'Raw Data';
      ws.getCell(`A${startRow}`).font = { bold: true, size: 12 };

      const keys = Object.keys(items[0]).slice(0, 15);
      const headerRow = ws.getRow(startRow + 1);
      keys.forEach((k, i) => { headerRow.getCell(i + 1).value = k; });
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };

      for (const item of items.slice(0, 200)) {
        ws.addRow(keys.map(k => this.extractField(item, k) ?? ''));
      }
    }
  }

  private exportLineChartSheet(ws: import('exceljs').Worksheet, wb: import('exceljs').Workbook, widget: DashboardWidget, sheetName: string) {
    const items = this.getItems(widget);
    const labelField = widget.bindings['labelField'];
    const valueField = widget.bindings['valueField'];

    ws.columns = [
      { header: labelField || 'Label', key: 'label', width: 25 },
      { header: valueField || 'Value', key: 'value', width: 18 },
    ];
    for (const item of items) {
      ws.addRow({
        label: labelField ? this.safeStr(this.extractField(item, labelField)) : '',
        value: valueField ? (Number(this.extractField(item, valueField)) || 0) : 0,
      });
    }
    this.styleHeaderRow(ws);

    // Add line chart
    if (items.length > 0) {
      this.addExcelChart(ws, 'line', sheetName, widget.label || 'Line Chart', items.length);
    }
  }

  private exportBarChartSheet(ws: import('exceljs').Worksheet, wb: import('exceljs').Workbook, widget: DashboardWidget, sheetName: string) {
    const items = this.getItems(widget);
    const labelField = widget.bindings['labelField'];
    const valueField = widget.bindings['valueField'];

    ws.columns = [
      { header: labelField || 'Label', key: 'label', width: 25 },
      { header: valueField || 'Value', key: 'value', width: 18 },
    ];
    for (const item of items) {
      ws.addRow({
        label: labelField ? this.safeStr(this.extractField(item, labelField)) : '',
        value: valueField ? (Number(this.extractField(item, valueField)) || 0) : 0,
      });
    }
    this.styleHeaderRow(ws);

    if (items.length > 0) {
      this.addExcelChart(ws, 'bar', sheetName, widget.label || 'Bar Chart', items.length);
    }
  }

  private exportPieChartSheet(ws: import('exceljs').Worksheet, wb: import('exceljs').Workbook, widget: DashboardWidget, sheetName: string) {
    const items = this.getItems(widget);
    const labelField = widget.bindings['labelField'];
    const valueField = widget.bindings['valueField'];

    // For pie charts, aggregate by label like the UI does
    const map = new Map<string, number>();
    for (const item of items) {
      const label = labelField ? this.safeStr(this.extractField(item, labelField), 'Unknown') : 'Item';
      const val = valueField ? (Number(this.extractField(item, valueField)) || 0) : 0;
      map.set(label, (map.get(label) ?? 0) + val);
    }
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);

    ws.columns = [
      { header: labelField || 'Label', key: 'label', width: 25 },
      { header: valueField || 'Value', key: 'value', width: 18 },
    ];
    for (const [label, value] of entries) {
      ws.addRow({ label, value });
    }
    this.styleHeaderRow(ws);

    if (entries.length > 0) {
      this.addExcelChart(ws, 'pie', sheetName, widget.label || 'Pie Chart', entries.length);
    }
  }

  private addExcelChart(ws: import('exceljs').Worksheet, type: 'line' | 'bar' | 'pie', sheetName: string, title: string, dataCount: number) {
    const lastRow = dataCount + 1;
    const chartTypeMap = { line: 'line' as const, bar: 'bar' as const, pie: 'pie' as const };
    const chartType = chartTypeMap[type];

    (ws as any).addChart?.({
      type: chartType,
      title: { text: title },
      legend: { position: 'bottom' },
      plotArea: {
        catAxis: { title: { text: '' } },
        valAxis: { title: { text: '' } },
      },
      series: [{
        categories: `'${sheetName}'!A2:A${lastRow}`,
        values: `'${sheetName}'!B2:B${lastRow}`,
      }],
    }, {
      tl: { col: 3, row: 1 },
      br: { col: 12, row: 20 },
    });
  }

  private colLetter(n: number): string {
    let s = '';
    while (n > 0) {
      n--;
      s = String.fromCodePoint(65 + (n % 26)) + s;
      n = Math.floor(n / 26);
    }
    return s;
  }

  // ── Share ─────────────────────────────────────────────────────────────────

  private readonly userMgmt = inject(UserManagementService);
  readonly shareUrl = signal<string>('');
  readonly sharePanelOpen = signal(false);
  readonly selectedShareUsers = signal<string[]>([]);
  readonly shareCopied = signal(false);

  readonly shareableUsers = computed(() => {
    const currentEmail = this.userMgmt.currentUser()?.email;
    return this.userMgmt.users().filter(u => u.email !== currentEmail);
  });

  toggleSharePanel() {
    this.sharePanelOpen.update(v => !v);
  }

  isUserSelected(email: string): boolean {
    return this.selectedShareUsers().includes(email);
  }

  toggleShareUser(email: string) {
    this.selectedShareUsers.update(list =>
      list.includes(email) ? list.filter(e => e !== email) : [...list, email]
    );
  }

  async shareDashboard() {
    const id = this.dashboardId();
    if (!id) return;
    try {
      // Save dashboard WITH lastData so the shared view has snapshotted data
      const dashboard: Dashboard = {
        id,
        name: this.dashboardName() || 'Untitled Dashboard',
        widgets: this.widgets(), // includes lastData
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const existing = this.svc.getById(id);
      if (existing) {
        dashboard.createdAt = existing.createdAt;
      }
      this.svc.upsert(dashboard);

      const emails = this.selectedShareUsers();
      const links = await this.shareSvc.createShare('dashboard', id, emails.length > 0 ? emails : undefined);
      console.log('[Share] Created links:', links);
      if (links.length > 0) {
        const url = this.shareSvc.getShareUrl(links[0].token);
        this.shareUrl.set(url);
        this.clipboardCopy(url);
      }
    } catch (err) { console.error('[Share] Error:', err); }
  }

  copyShareUrl() {
    const url = this.shareUrl();
    if (url) this.clipboardCopy(url);
  }

  private async clipboardCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      (document as unknown as { execCommand(cmd: string): boolean }).execCommand('copy');
      ta.remove();
    }
    this.shareCopied.set(true);
    setTimeout(() => this.shareCopied.set(false), 2500);
  }

  // ── Script IntelliSense ───────────────────────────────────────────────────

  readonly scriptAcSuggestions = signal<{ label: string; insertText: string; detail: string; icon: string }[]>([]);
  readonly scriptAcIndex = signal(0);
  readonly scriptAcStyle = signal<Record<string, string>>({});
  private scriptAcInput: HTMLTextAreaElement | null = null;
  private scriptTimer: ReturnType<typeof setTimeout> | null = null;

  private buildScriptSuggestions(code: string, cursorPos: number): { label: string; insertText: string; detail: string; icon: string }[] {
    const before = code.substring(0, cursorPos);
    const suggestions: { label: string; insertText: string; detail: string; icon: string }[] = [];

    // After "ModuleName." — suggest methods
    const dotMatch = /(\w+)\.(\w*)$/.exec(before);
    if (dotMatch) {
      const moduleName = dotMatch[1];
      const partial = dotMatch[2].toLowerCase();
      const mod = MODULES.find(m => m.label.split(/\s+/).join('') === moduleName);
      if (mod) {
        for (const ep of mod.endpoints) {
          const methodName = ep.label.split(/\s+/).join('');
          if (!partial || methodName.toLowerCase().includes(partial)) {
            const paramNames = extractPathParams(ep.pathTemplate);
            const sig = paramNames.length > 0
              ? `(${paramNames.map(p => `{ ${p} }`).join(', ')}${ep.hasBody ? ', body' : ''})`
              : ep.hasBody ? '(body)' : '()';
            suggestions.push({ label: methodName + sig, insertText: methodName + sig, detail: `${ep.method} ${ep.pathTemplate}`, icon: 'http' });
          }
        }
      }
      return suggestions.slice(0, 30);
    }

    // Not after a dot — suggest module names + keywords
    const wordMatch = /(\w+)$/.exec(before);
    const partial = wordMatch ? wordMatch[1].toLowerCase() : '';
    if (!partial) return [];

    for (const kw of ['await', 'return', 'const', 'let', 'if', 'else', 'for', 'of', 'true', 'false', 'null']) {
      if (kw.includes(partial) && kw !== partial) {
        suggestions.push({ label: kw, insertText: kw, detail: 'keyword', icon: 'code' });
      }
    }

    for (const mod of MODULES) {
      const name = mod.label.split(/\s+/).join('');
      if (name.toLowerCase().includes(partial)) {
        suggestions.push({ label: name, insertText: name, detail: `${mod.endpoints.length} endpoints`, icon: 'api' });
      }
    }

    return suggestions.slice(0, 20);
  }

  onWidgetScriptInput(textarea: HTMLTextAreaElement, widgetId: string) {
    this.scriptAcInput = textarea;
    if (this.scriptTimer) clearTimeout(this.scriptTimer);
    this.scriptTimer = setTimeout(() => this.updateWidget(widgetId, 'scriptCode', textarea.value), 400);
    this.updateScriptAcPosition();
    const pos = textarea.selectionStart ?? 0;
    const suggestions = this.buildScriptSuggestions(textarea.value, pos);
    this.scriptAcSuggestions.set(suggestions);
    this.scriptAcIndex.set(0);
  }

  /** Open the Monaco script editor popup */
  openScriptEditor(widget: DashboardWidget) {
    const ref = this.dialog.open(ScriptEditorDialogComponent, {
      data: { code: widget.scriptCode ?? '', title: 'Script Editor', mode: 'dashboard-script' as const } as ScriptEditorDialogData,
      panelClass: 'script-editor-dialog-panel',
      width: '85vw',
      maxWidth: '1400px',
      height: '85vh',
      autoFocus: false,
    });
    ref.afterClosed().subscribe((result: string | undefined) => {
      if (result === undefined) return;
      this.updateWidget(widget.id, 'scriptCode', result);
    });
  }

  onScriptKeydown(event: KeyboardEvent) {
    const list = this.scriptAcSuggestions();
    if (list.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.scriptAcIndex.update(i => Math.min(i + 1, list.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.scriptAcIndex.update(i => Math.max(i - 1, 0));
    } else if (event.key === 'Tab' || (event.key === 'Enter' && list.length > 0)) {
      event.preventDefault();
      this.insertScriptSuggestion(list[this.scriptAcIndex()]);
    } else if (event.key === 'Escape') {
      this.scriptAcSuggestions.set([]);
    }
  }

  insertScriptSuggestion(suggestion: { insertText: string }, event?: MouseEvent) {
    if (event) event.preventDefault();
    const input = this.scriptAcInput;
    if (!input) { this.scriptAcSuggestions.set([]); return; }

    const pos = input.selectionStart ?? 0;
    const text = input.value;
    const before = text.substring(0, pos);
    const after = text.substring(pos);

    const dotMatch = /(\w+)\.(\w*)$/.exec(before);
    let replaceStart: number;
    if (dotMatch) {
      replaceStart = pos - dotMatch[2].length;
    } else {
      const wordMatch = /(\w+)$/.exec(before);
      replaceStart = wordMatch ? pos - wordMatch[1].length : pos;
    }

    const newText = text.substring(0, replaceStart) + suggestion.insertText + after;
    input.value = newText;
    const cursorPos = replaceStart + suggestion.insertText.length;
    input.setSelectionRange(cursorPos, cursorPos);

    this.scriptAcSuggestions.set([]);
    input.focus();
  }

  closeScriptAc() {
    setTimeout(() => { this.scriptAcSuggestions.set([]); this.scriptAcInput = null; }, 150);
  }

  private updateScriptAcPosition() {
    if (!this.scriptAcInput) return;
    const rect = this.scriptAcInput.getBoundingClientRect();
    const ta = this.scriptAcInput;
    const pos = ta.selectionStart ?? 0;
    const textBefore = ta.value.substring(0, pos);
    const lineNumber = textBefore.split('\n').length;
    const lineHeight = Number.parseFloat(getComputedStyle(ta).lineHeight) || 18;
    const paddingTop = Number.parseFloat(getComputedStyle(ta).paddingTop) || 8;
    let top = rect.top + paddingTop + lineNumber * lineHeight + 4;
    const maxTop = window.innerHeight - 260;
    if (top > maxTop) top = maxTop;
    this.scriptAcStyle.set({
      top: top + 'px',
      left: rect.left + 'px',
      width: Math.max(rect.width, 260) + 'px',
    });
  }
}
