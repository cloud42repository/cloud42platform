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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  CdkDragPlaceholder,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { FormService } from '../../services/form.service';
import { ApiService } from '../../services/api.service';
import {
  FormDefinition,
  FormField,
  FormFieldKind,
  FormFieldDataSource,
  FormSubmitAction,
  BodyMode,
  BodyFieldSource,
} from '../../config/form.types';
import { MODULES, ModuleDef, EndpointDef } from '../../config/endpoints';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { firstValueFrom } from 'rxjs';

interface FieldTypeRef {
  kind: FormFieldKind;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTooltipModule, MatDividerModule, MatCheckboxModule,
    MatProgressSpinnerModule,
    CdkDrag, CdkDropList, CdkDropListGroup, CdkDragPlaceholder, CdkDragHandle,
    TranslatePipe,
  ],
  template: `
    <div class="builder-shell" cdkDropListGroup>
      <!-- ── BROWSER PANEL (left) ── -->
      <div class="browser-panel">
        <div class="browser-header">
          <mat-icon>edit_note</mat-icon>
          <span>{{ 'form.field-browser' | t }}</span>
        </div>

        <div class="browser-section-label">{{ 'form.field-types' | t }}</div>
        <div class="browser-list"
             cdkDropList
             [id]="'fieldTypeList'"
             [cdkDropListData]="fieldTypes"
             [cdkDropListConnectedTo]="['formCanvas']"
             [cdkDropListSortingDisabled]="true">
          @for (ft of fieldTypes; track ft.kind) {
            <div class="browser-item" cdkDrag [cdkDragData]="ft">
              <mat-icon [style.color]="ft.color">{{ ft.icon }}</mat-icon>
              <span>{{ ft.label }}</span>
              <div *cdkDragPlaceholder class="drag-placeholder"></div>
            </div>
          }
        </div>

        <mat-divider class="browser-divider" />

        <div class="browser-section-label">{{ 'form.submit-actions' | t }}</div>
        <div class="action-list">
          @for (action of submitActions(); track action.id) {
            <div class="action-item" [class.selected]="selectedActionId() === action.id"
                 (click)="selectAction(action.id)">
              <span class="method-tag method-{{ action.method.toLowerCase() }}">{{ action.method }}</span>
              <span class="action-label">{{ action.label || action.endpointLabel || 'Action' }}</span>
              <button mat-icon-button (click)="removeAction(action.id); $event.stopPropagation()" class="action-delete">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
          <button mat-stroked-button (click)="addSubmitAction()" class="add-action-btn">
            <mat-icon>add</mat-icon> {{ 'form.add-action' | t }}
          </button>
        </div>

        <mat-divider class="browser-divider" />
        <div class="browser-section-label">{{ 'form.api-endpoints' | t }}</div>
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
          <a mat-icon-button routerLink="/forms" matTooltip="{{ 'form.back-to-forms' | t }}">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="name-input">
            <input matInput [value]="formName()" (input)="formName.set($any($event.target).value)"
                   placeholder="{{ 'form.name-placeholder' | t }}" />
          </mat-form-field>
          <span class="spacer"></span>
          <button mat-flat-button color="primary" (click)="save()" [disabled]="saving()">
            @if (saving()) { <mat-spinner diameter="16" /> }
            <mat-icon>save</mat-icon> {{ 'form.save' | t }}
          </button>
          <button mat-stroked-button (click)="preview()" [disabled]="fields().length === 0">
            <mat-icon>visibility</mat-icon> {{ 'form.preview' | t }}
          </button>
        </div>

        <div class="canvas-area"
             cdkDropList
             [id]="'formCanvas'"
             [cdkDropListData]="fields()"
             [cdkDropListConnectedTo]="['fieldTypeList']"
             (cdkDropListDropped)="onCanvasDrop($event)">
          @if (fields().length === 0 && submitActions().length === 0) {
            <div class="canvas-empty">
              <mat-icon>edit_note</mat-icon>
              <p>{{ 'form.canvas-empty' | t }}</p>
            </div>
          }

          <!-- Form fields -->
          @for (field of fields(); track field.id; let i = $index) {
            <div class="field-card field-card--{{ field.kind }}"
                 cdkDrag [cdkDragData]="field"
                 [class.selected]="selectedFieldId() === field.id"
                 [style.grid-column]="'span ' + field.width"
                 [style.grid-row]="'span ' + field.height"
                 (click)="selectField(field.id)">
              <div class="field-header">
                <mat-icon class="field-type-icon">
                  @if (field.kind === 'text') { text_fields }
                  @else if (field.kind === 'date') { calendar_today }
                  @else if (field.kind === 'select') { arrow_drop_down_circle }
                  @else { table_chart }
                </mat-icon>
                <span class="field-title">{{ field.label || kindLabel(field.kind) }}</span>
                <span class="field-badge">{{ kindLabel(field.kind) }}</span>
                @if (field.required) { <span class="required-mark">*</span> }
                <div class="field-actions" (click)="$event.stopPropagation()">
                  <button mat-icon-button (click)="selectField(field.id)" matTooltip="{{ 'form.configure' | t }}">
                    <mat-icon>settings</mat-icon>
                  </button>
                  <button mat-icon-button (click)="removeField(field.id)" color="warn" matTooltip="{{ 'form.remove-field' | t }}">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                  <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                </div>
              </div>

              <!-- Field preview -->
              <div class="field-preview">
                @if (field.kind === 'text') {
                  <div class="preview-input">
                    <span class="preview-placeholder">{{ field.placeholder || field.label || 'Text input' }}</span>
                  </div>
                }
                @if (field.kind === 'date') {
                  <div class="preview-input preview-date">
                    <span class="preview-placeholder">{{ field.placeholder || 'dd/mm/yyyy' }}</span>
                    <mat-icon class="preview-date-icon">calendar_today</mat-icon>
                  </div>
                }
                @if (field.kind === 'select') {
                  <div class="preview-input preview-select">
                    <span class="preview-placeholder">{{ field.placeholder || 'Select…' }}</span>
                    <mat-icon class="preview-arrow">arrow_drop_down</mat-icon>
                  </div>
                  @if (field.dataSource) {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">cloud</mat-icon>
                      {{ field.dataSource.moduleLabel }} › {{ field.dataSource.endpointLabel }}
                    </span>
                  }
                  @if (field.lastData && isArray(field.lastData)) {
                    <div class="select-options-preview">
                      @for (opt of getSelectOptions(field); track $index) {
                        <div class="select-option-item">
                          <span class="option-label">{{ opt.display }}</span>
                          <span class="option-value">{{ opt.value }}</span>
                        </div>
                      }
                      @if (asArray(field.lastData).length > 10) {
                        <div class="select-option-more">+{{ asArray(field.lastData).length - 10 }} more</div>
                      }
                    </div>
                  }
                }
                @if (field.kind === 'datatable') {
                  @if (field.dataSource) {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">cloud</mat-icon>
                      {{ field.dataSource.moduleLabel }} › {{ field.dataSource.endpointLabel }}
                    </span>
                  }
                  @if (field.columns) {
                    <div class="preview-table-cols">
                      @for (col of field.columns.split(','); track $index) {
                        <span class="col-tag">{{ col.trim() }}</span>
                      }
                    </div>
                  } @else {
                    <span class="no-source">{{ 'form.no-columns' | t }}</span>
                  }

                  <!-- Live data table preview -->
                  @if (field.lastData && isArray(field.lastData)) {
                    <div class="table-container">
                      <table class="data-table">
                        <thead>
                          <tr>
                            @for (col of getTableColumns(field); track col) {
                              <th>{{ col }}</th>
                            }
                          </tr>
                        </thead>
                        <tbody>
                          @for (row of getTableRows(field); track $index) {
                            <tr>
                              @for (col of getTableColumns(field); track col) {
                                <td>{{ row[col] }}</td>
                              }
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }
                }
              </div>

              <div *cdkDragPlaceholder class="field-drag-placeholder"></div>

              <!-- Resize handles -->
              <div class="field-resize-handle resize-e" (mousedown)="onFieldResizeStart($event, field, 'e')" (click)="$event.stopPropagation()"></div>
              <div class="field-resize-handle resize-s" (mousedown)="onFieldResizeStart($event, field, 's')" (click)="$event.stopPropagation()"></div>
              <div class="field-resize-handle resize-se" (mousedown)="onFieldResizeStart($event, field, 'se')" (click)="$event.stopPropagation()"></div>
            </div>
          }

          <!-- Submit buttons row -->
          @if (submitActions().length > 0) {
            <div class="submit-row" [style.grid-column]="'1 / -1'">
              @for (action of submitActions(); track action.id) {
                <button mat-flat-button [color]="action.color"
                        [class.selected-action]="selectedActionId() === action.id"
                        (click)="selectAction(action.id)">
                  <mat-icon>send</mat-icon>
                  {{ action.label || action.method }}
                </button>
              }
            </div>
          }
        </div>
      </div>

      <!-- ── CONFIG PANEL (right) ── -->
      <div class="config-panel" [class.open]="selectedField() !== null || selectedAction() !== null">

        <!-- Field configuration -->
        @if (selectedField(); as field) {
          <div class="config-header">
            <span>{{ 'form.configure-field' | t }}</span>
            <button mat-icon-button (click)="selectedFieldId.set(null)">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="config-body">
            <!-- Field label -->
            <div class="config-section-label">{{ 'form.field-label' | t }}</div>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
              <mat-label>{{ 'form.label' | t }}</mat-label>
              <input matInput [value]="field.label" (input)="updateField(field.id, 'label', $any($event.target).value)" />
            </mat-form-field>

            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
              <mat-label>{{ 'form.placeholder' | t }}</mat-label>
              <input matInput [value]="field.placeholder || ''" (input)="updateField(field.id, 'placeholder', $any($event.target).value)" />
            </mat-form-field>

            <mat-checkbox [checked]="field.required" (change)="updateField(field.id, 'required', $event.checked)">
              {{ 'form.required' | t }}
            </mat-checkbox>

            <mat-divider class="section-divider" />

            <!-- Data Source (for select & datatable) -->
            @if (field.kind === 'select' || field.kind === 'datatable') {
              <div class="config-section-label">{{ 'form.data-source' | t }}</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'form.select-module' | t }}</mat-label>
                <mat-select [value]="field.dataSource?.moduleApiPrefix ?? ''"
                            (selectionChange)="setFieldDataSourceModule(field.id, $event.value)">
                  @for (mod of allModules; track mod.id) {
                    <mat-option [value]="mod.apiPrefix">{{ mod.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              @if (getModuleEndpoints(field.dataSource?.moduleApiPrefix).length > 0) {
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>{{ 'form.select-endpoint' | t }}</mat-label>
                  <mat-select [value]="field.dataSource?.pathTemplate ?? ''"
                              (selectionChange)="setFieldDataSourceEndpoint(field.id, $event.value)">
                    @for (ep of getModuleEndpoints(field.dataSource?.moduleApiPrefix); track ep.id) {
                      <mat-option [value]="ep.pathTemplate">
                        <span class="method-tag method-{{ ep.method.toLowerCase() }}">{{ ep.method }}</span>
                        {{ ep.label }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              }

              <!-- Path params -->
              @if (field.dataSource && getPathParamNames(field.dataSource.pathTemplate).length > 0) {
                <div class="config-section-label">{{ 'form.path-params' | t }}</div>
                @for (param of getPathParamNames(field.dataSource.pathTemplate); track param) {
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                    <mat-label>:{{ param }}</mat-label>
                    <input matInput [value]="field.dataSource!.pathParams[param] || ''"
                           (input)="updateFieldPathParam(field.id, param, $any($event.target).value)" />
                  </mat-form-field>
                }
              }

              <!-- Data Path -->
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'form.data-path' | t }}</mat-label>
                <input matInput [value]="field.dataSource?.dataPath ?? ''"
                       (input)="updateFieldDataPath(field.id, $any($event.target).value)"
                       placeholder="data" />
              </mat-form-field>

              @if (field.kind === 'select') {
                <mat-divider class="section-divider" />
                <div class="config-section-label">{{ 'form.select-bindings' | t }}</div>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>{{ 'form.display-field' | t }}</mat-label>
                  <input matInput [value]="field.displayField || ''"
                         (input)="updateField(field.id, 'displayField', $any($event.target).value)"
                         placeholder="name" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>{{ 'form.value-field' | t }}</mat-label>
                  <input matInput [value]="field.valueField || ''"
                         (input)="updateField(field.id, 'valueField', $any($event.target).value)"
                         placeholder="id" />
                </mat-form-field>
              }

              @if (field.kind === 'datatable') {
                <mat-divider class="section-divider" />
                <div class="config-section-label">{{ 'form.table-columns' | t }}</div>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>{{ 'form.columns' | t }}</mat-label>
                  <input matInput [value]="field.columns || ''"
                         (input)="updateField(field.id, 'columns', $any($event.target).value)"
                         placeholder="{{ 'form.columns-hint' | t }}" />
                </mat-form-field>
              }

              <button mat-flat-button color="accent" class="full-width" (click)="fetchFieldData(field)" [disabled]="!field.dataSource || fetching()">
                @if (fetching()) { <mat-spinner diameter="16" /> }
                <mat-icon>cloud_download</mat-icon> {{ 'form.fetch-data' | t }}
              </button>
            }

            <mat-divider class="section-divider" />

            <!-- Size -->
            <div class="config-section-label">{{ 'form.size' | t }}</div>
            <div class="size-row">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="size-field">
                <mat-label>{{ 'form.width' | t }}</mat-label>
                <mat-select [value]="field.width" (selectionChange)="updateField(field.id, 'width', $event.value)">
                  @for (n of widthOptions; track n) {
                    <mat-option [value]="n">{{ n }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="size-field">
                <mat-label>{{ 'form.height' | t }}</mat-label>
                <mat-select [value]="field.height" (selectionChange)="updateField(field.id, 'height', $event.value)">
                  @for (n of heightOptions; track n) {
                    <mat-option [value]="n">{{ n }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        }

        <!-- Submit action configuration -->
        @if (selectedAction(); as action) {
          <div class="config-header">
            <span>{{ 'form.configure-action' | t }}</span>
            <button mat-icon-button (click)="selectedActionId.set(null)">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="config-body">
            <div class="config-section-label">{{ 'form.action-label' | t }}</div>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
              <mat-label>{{ 'form.label' | t }}</mat-label>
              <input matInput [value]="action.label" (input)="updateAction(action.id, 'label', $any($event.target).value)" />
            </mat-form-field>

            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
              <mat-label>{{ 'form.http-method' | t }}</mat-label>
              <mat-select [value]="action.method" (selectionChange)="updateAction(action.id, 'method', $event.value)">
                <mat-option value="POST">POST</mat-option>
                <mat-option value="PUT">PUT</mat-option>
                <mat-option value="PATCH">PATCH</mat-option>
                <mat-option value="DELETE">DELETE</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
              <mat-label>{{ 'form.button-color' | t }}</mat-label>
              <mat-select [value]="action.color" (selectionChange)="updateAction(action.id, 'color', $event.value)">
                <mat-option value="primary">Primary</mat-option>
                <mat-option value="accent">Accent</mat-option>
                <mat-option value="warn">Warn</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-divider class="section-divider" />

            <!-- Action API endpoint -->
            <div class="config-section-label">{{ 'form.action-endpoint' | t }}</div>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
              <mat-label>{{ 'form.select-module' | t }}</mat-label>
              <mat-select [value]="action.moduleApiPrefix" (selectionChange)="setActionModule(action.id, $event.value)">
                @for (mod of allModules; track mod.id) {
                  <mat-option [value]="mod.apiPrefix">{{ mod.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            @if (getModuleEndpoints(action.moduleApiPrefix).length > 0) {
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'form.select-endpoint' | t }}</mat-label>
                <mat-select [value]="action.pathTemplate" (selectionChange)="setActionEndpoint(action.id, $event.value)">
                  @for (ep of getModuleEndpoints(action.moduleApiPrefix); track ep.id) {
                    <mat-option [value]="ep.pathTemplate">
                      <span class="method-tag method-{{ ep.method.toLowerCase() }}">{{ ep.method }}</span>
                      {{ ep.label }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }

            <!-- Path params -->
            @if (getPathParamNames(action.pathTemplate).length > 0) {
              <div class="config-section-label">{{ 'form.path-params' | t }}</div>
              @for (param of getPathParamNames(action.pathTemplate); track param) {
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>:{{ param }}</mat-label>
                  <input matInput [value]="action.pathParams[param] || ''"
                         (input)="updateActionPathParam(action.id, param, $any($event.target).value)" />
                </mat-form-field>
              }
            }

            <mat-divider class="section-divider" />

            <!-- Body mapping -->
            <div class="config-section-label">{{ 'form.body-mapping' | t }}</div>

            <!-- Body mode toggle -->
            <div class="body-mode-toggle">
              <button mat-stroked-button
                      [class.active-mode]="getBodyMode(action) === 'fields'"
                      (click)="setBodyMode(action.id, 'fields')"
                      matTooltip="{{ 'form.fields-hint' | t }}">
                <mat-icon>list</mat-icon> {{ 'form.fields-mode' | t }}
              </button>
              <button mat-stroked-button
                      [class.active-mode]="getBodyMode(action) === 'text'"
                      (click)="setBodyMode(action.id, 'text')"
                      matTooltip="{{ 'form.text-hint' | t }}">
                <mat-icon>code</mat-icon> {{ 'form.text-mode' | t }}
              </button>
              <button mat-stroked-button
                      [class.active-mode]="getBodyMode(action) === 'form'"
                      (click)="setBodyMode(action.id, 'form')"
                      matTooltip="{{ 'form.form-hint' | t }}">
                <mat-icon>dynamic_form</mat-icon> {{ 'form.form-mode' | t }}
              </button>
            </div>

            <!-- ── FIELDS MODE ── -->
            @if (getBodyMode(action) === 'fields') {
              <p class="config-hint">{{ 'form.body-mapping-hint' | t }}</p>
              @for (key of action.bodyKeys; track key) {
                <div class="field-block">
                  <div class="field-name-row">
                    <mat-icon>data_object</mat-icon>
                    <code>{{ key }}</code>
                    <button mat-icon-button class="remove-key-btn" (click)="removeBodyKey(action.id, key)">
                      <mat-icon>remove_circle_outline</mat-icon>
                    </button>
                  </div>
                  <div class="source-toggle">
                    <button mat-stroked-button
                            [class.active-mode]="getBodySourceType(action, key) === 'hardcoded'"
                            (click)="setBodySourceType(action.id, key, 'hardcoded')">
                      <mat-icon>text_fields</mat-icon> {{ 'form.hardcoded' | t }}
                    </button>
                    <button mat-stroked-button
                            [class.active-mode]="getBodySourceType(action, key) === 'form-field'"
                            (click)="setBodySourceType(action.id, key, 'form-field')">
                      <mat-icon>dynamic_form</mat-icon> {{ 'form.from-field' | t }}
                    </button>
                  </div>
                  @if (getBodySourceType(action, key) === 'hardcoded') {
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                      <mat-label>{{ 'form.value' | t }}</mat-label>
                      <input matInput [value]="getBodyHardcodedValue(action, key)"
                             (input)="setBodyHardcoded(action.id, key, $any($event.target).value)"
                             [placeholder]="fieldRefPlaceholder" />
                    </mat-form-field>
                  }
                  @if (getBodySourceType(action, key) === 'form-field') {
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                      <mat-label>{{ 'form.source-field' | t }}</mat-label>
                      <mat-select [value]="getBodyFieldId(action, key)"
                                  (selectionChange)="setBodyFieldSource(action.id, key, $event.value)">
                        @for (f of fields(); track f.id) {
                          <mat-option [value]="f.id">{{ f.label || f.kind }} ({{ f.id }})</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  }
                </div>
              }
              <div class="add-field-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                  <mat-label>{{ 'form.field-name' | t }}</mat-label>
                  <input matInput [(ngModel)]="newBodyKey" placeholder="e.g. name" (keydown.enter)="addBodyKey(action.id)" />
                </mat-form-field>
                <button mat-stroked-button (click)="addBodyKey(action.id)" [disabled]="!newBodyKey.trim()">
                  <mat-icon>add</mat-icon> {{ 'form.add-field' | t }}
                </button>
              </div>
            }

            <!-- ── TEXT MODE ── -->
            @if (getBodyMode(action) === 'text') {
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'form.raw-body-json' | t }}</mat-label>
                <textarea matInput rows="10"
                          [value]="action.rawBody ?? '{}'"
                          (input)="setRawBody(action.id, $any($event.target).value)"
                          placeholder='{ "key": "value" }'
                          class="raw-body-textarea"></textarea>
                <mat-hint>{{ 'form.json-hint' | t }}</mat-hint>
              </mat-form-field>
            }

            <!-- ── FORM MODE ── -->
            @if (getBodyMode(action) === 'form') {
              <p class="config-hint">{{ 'form.form-mode-hint' | t }}</p>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'form.raw-body-json' | t }}</mat-label>
                <textarea matInput rows="10"
                          [value]="action.rawBody ?? '{}'"
                          (input)="setRawBody(action.id, $any($event.target).value)"
                          [placeholder]="formModePlaceholder"
                          class="raw-body-textarea"></textarea>
                <mat-hint>{{ 'form.form-ref-hint' | t }}</mat-hint>
              </mat-form-field>
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

    /* ── Action list ── */
    .action-list { padding: 0 8px; }
    .action-item {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 10px; border-radius: 8px; font-size: 12px;
      border: 1px solid #e2e8f0; margin-bottom: 4px; background: white;
      cursor: pointer; transition: border-color .15s;
    }
    .action-item.selected { border-color: #0891b2; background: #f0fdfa; }
    .action-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .action-delete { width: 24px; height: 24px; line-height: 24px; }
    .action-delete mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .add-action-btn { margin: 4px 0 8px; width: calc(100% - 0px); font-size: 12px; }

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
      grid-auto-rows: 60px;
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

    /* ── Field Cards ── */
    .field-card {
      border: 1px solid #e2e8f0; border-radius: 12px;
      background: white; padding: 12px 16px;
      cursor: pointer; transition: border-color .15s, box-shadow .15s;
      position: relative;
      display: flex; flex-direction: column;
    }
    .field-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
    .field-card.selected { border-color: #0891b2; box-shadow: 0 0 0 2px rgba(8,145,178,.2); }
    .field-card--text       { border-left: 4px solid #2563eb; }
    .field-card--date       { border-left: 4px solid #d97706; }
    .field-card--select     { border-left: 4px solid #7c3aed; }
    .field-card--datatable  { border-left: 4px solid #16a34a; }

    .field-header {
      display: flex; align-items: center; gap: 8px;
    }
    .field-type-icon { font-size: 18px; width: 18px; height: 18px; color: #64748b; }
    .field-title { font-weight: 700; font-size: 13px; color: #1e293b; }
    .field-badge {
      font-size: 9px; padding: 2px 8px; border-radius: 99px;
      background: #f1f5f9; color: #64748b; font-weight: 600; margin-left: auto;
    }
    .required-mark { color: #dc2626; font-weight: 700; font-size: 14px; margin-left: 2px; }
    .field-actions { display: flex; align-items: center; margin-left: 4px; }
    .field-actions button { width: 28px; height: 28px; line-height: 28px; }
    .field-actions mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .drag-handle { cursor: grab; color: #94a3b8; font-size: 18px; width: 18px; height: 18px; }

    .field-preview { margin-top: 8px; flex: 1; overflow: auto; }

    .preview-input {
      border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px;
      background: #f8fafc; display: flex; align-items: center;
    }
    .preview-placeholder { color: #94a3b8; font-size: 12px; flex: 1; }
    .preview-date { position: relative; }
    .preview-date-icon { font-size: 16px; width: 16px; height: 16px; color: #94a3b8; }
    .preview-select { cursor: default; }
    .preview-arrow { font-size: 20px; width: 20px; height: 20px; color: #94a3b8; }

    .data-source-tag {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; color: #0284c7; background: #f0f9ff;
      padding: 2px 8px; border-radius: 6px; margin-top: 6px;
    }
    .no-source { font-size: 11px; color: #94a3b8; font-style: italic; }

    .select-options-preview {
      margin-top: 6px; border: 1px solid #e2e8f0; border-radius: 6px;
      max-height: 180px; overflow-y: auto; background: white;
    }
    .select-option-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 5px 10px; font-size: 11px; border-bottom: 1px solid #f1f5f9;
    }
    .select-option-item:last-child { border-bottom: none; }
    .select-option-item:hover { background: #f0f9ff; }
    .option-label { color: #1e293b; font-weight: 500; }
    .option-value { color: #94a3b8; font-size: 10px; font-family: monospace; }
    .select-option-more {
      padding: 4px 10px; font-size: 10px; color: #64748b;
      text-align: center; background: #f8fafc;
      border-top: 1px solid #e2e8f0; border-radius: 0 0 6px 6px;
    }

    .preview-table-cols { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
    .col-tag {
      font-size: 10px; padding: 2px 6px; border-radius: 4px;
      background: #ecfdf5; color: #059669; font-family: monospace;
    }

    .field-drag-placeholder {
      background: #e0f2fe; border: 2px dashed #38bdf8;
      border-radius: 12px; min-height: 60px;
    }

    /* ── Resize Handles ── */
    .field-resize-handle { position: absolute; z-index: 2; }
    .field-resize-handle.resize-e {
      top: 8px; right: 0; bottom: 8px; width: 6px;
      cursor: ew-resize; border-radius: 0 6px 6px 0;
    }
    .field-resize-handle.resize-s {
      left: 8px; right: 8px; bottom: 0; height: 6px;
      cursor: ns-resize; border-radius: 0 0 6px 6px;
    }
    .field-resize-handle.resize-se {
      bottom: 0; right: 0; width: 16px; height: 16px;
      cursor: nwse-resize;
    }
    .field-resize-handle.resize-se::after {
      content: '';
      position: absolute; bottom: 4px; right: 4px;
      width: 8px; height: 8px;
      border-right: 2px solid #cbd5e1;
      border-bottom: 2px solid #cbd5e1;
      transition: border-color .15s;
    }
    .field-card:hover .field-resize-handle.resize-e,
    .field-card:hover .field-resize-handle.resize-s {
      background: rgba(8, 145, 178, 0.08);
    }
    .field-card:hover .field-resize-handle.resize-se::after {
      border-color: #0891b2;
    }

    /* ── Submit row ── */
    .submit-row {
      display: flex; gap: 12px; padding: 12px 0; justify-content: flex-end;
    }
    .submit-row button { min-width: 100px; }
    .selected-action { outline: 2px solid #0891b2; outline-offset: 2px; }

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
    .config-hint { font-size: 11px; color: #64748b; margin: 0; }
    .section-divider { margin: 8px 0; }
    .full-width { width: 100%; }
    .size-row { display: flex; gap: 8px; }
    .size-field { flex: 1; }

    .kv-rows { display: flex; flex-direction: column; gap: 4px; }
    .kv-row { display: flex; gap: 4px; align-items: center; }
    .kv-key { flex: 1; }
    .kv-value { flex: 1; }
    .add-param-btn { margin-top: 4px; }

    /* ── Body mode toggle ── */
    .body-mode-toggle {
      display: flex; gap: 4px; margin-bottom: 8px;
    }
    .body-mode-toggle button {
      flex: 1; font-size: 11px; padding: 4px 0;
    }
    .body-mode-toggle button mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 2px; }
    .active-mode { background: #f0fdfa !important; border-color: #0891b2 !important; color: #0891b2 !important; }

    .field-block {
      border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;
      margin-bottom: 6px; background: #fafbfc;
    }
    .field-name-row {
      display: flex; align-items: center; gap: 6px; font-size: 12px;
    }
    .field-name-row mat-icon { font-size: 14px; width: 14px; height: 14px; color: #64748b; }
    .field-name-row code { font-size: 12px; font-weight: 600; color: #1e293b; flex: 1; }
    .remove-key-btn { width: 24px; height: 24px; line-height: 24px; }
    .remove-key-btn mat-icon { font-size: 14px; width: 14px; height: 14px; color: #dc2626; }

    .source-toggle { display: flex; gap: 4px; margin: 6px 0; }
    .source-toggle button { font-size: 10px; flex: 1; padding: 2px 0; }
    .source-toggle button mat-icon { font-size: 14px; width: 14px; height: 14px; margin-right: 2px; }

    .add-field-row { display: flex; gap: 6px; align-items: center; margin-top: 4px; }
    .add-key-input { flex: 1; }

    .raw-body-textarea {
      font-family: 'Cascadia Code', 'Fira Code', monospace;
      font-size: 11px; line-height: 1.5;
    }

    .ep-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* ── Data table ── */
    .table-container { margin-top: 10px; overflow-x: auto; max-height: 200px; overflow-y: auto; }
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
  `]
})
export class FormBuilderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(FormService);
  private readonly api = inject(ApiService);
  private readonly el = inject(ElementRef);

  readonly allModules = MODULES;
  readonly widthOptions = [3, 4, 6, 8, 12];
  readonly heightOptions = [1, 2, 3, 4, 5, 6];
  readonly fieldRefPlaceholder = 'Value or {{field.id}} ref';
  readonly formModePlaceholder = '{ "key": "{{field.myField}}" }';

  readonly fieldTypes: FieldTypeRef[] = [
    { kind: 'text',       label: 'Text Input',    icon: 'text_fields',           color: '#2563eb' },
    { kind: 'date',       label: 'Date Picker',   icon: 'calendar_today',        color: '#d97706' },
    { kind: 'select',     label: 'Select',        icon: 'arrow_drop_down_circle', color: '#7c3aed' },
    { kind: 'datatable',  label: 'Data Table',    icon: 'table_chart',           color: '#16a34a' },
  ];

  // ── State ─────────────────────────────────────────────────────────────────

  readonly formId = signal<string>('');
  readonly formName = signal<string>('');
  readonly fields = signal<FormField[]>([]);
  readonly submitActions = signal<FormSubmitAction[]>([]);
  readonly selectedFieldId = signal<string | null>(null);
  readonly selectedActionId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly fetching = signal(false);

  readonly selectedField = computed<FormField | null>(() => {
    const id = this.selectedFieldId();
    if (!id) return null;
    // Clear action selection when selecting a field
    return this.fields().find(f => f.id === id) ?? null;
  });

  readonly selectedAction = computed<FormSubmitAction | null>(() => {
    const id = this.selectedActionId();
    if (!id || this.selectedFieldId()) return null;
    return this.submitActions().find(a => a.id === id) ?? null;
  });

  // ── Resize state ──
  private resizingFieldId: string | null = null;
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartWidth = 0;
  private resizeStartHeight = 0;
  private gridColWidth = 0;
  private readonly GRID_ROW_HEIGHT = 60;
  private readonly GRID_GAP = 12;

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
        this.formId.set(existing.id);
        this.formName.set(existing.name);
        this.fields.set([...existing.fields]);
        this.submitActions.set([...existing.submitActions]);
      } else {
        this.router.navigate(['/forms']);
      }
    } else {
      this.formId.set(`frm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
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

  onCanvasDrop(event: CdkDragDrop<FormField[]>) {
    if (event.previousContainer === event.container) {
      this.fields.update(fs => {
        const arr = [...fs];
        const [item] = arr.splice(event.previousIndex, 1);
        arr.splice(event.currentIndex, 0, item);
        return arr;
      });
    } else {
      const data = event.item.data as FieldTypeRef;
      const newField: FormField = {
        id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        kind: data.kind,
        label: '',
        required: false,
        x: 0,
        y: 0,
        width: data.kind === 'datatable' ? 12 : 6,
        height: data.kind === 'datatable' ? 4 : 1,
      };
      this.fields.update(fs => {
        const arr = [...fs];
        arr.splice(event.currentIndex, 0, newField);
        return arr;
      });
      this.selectedFieldId.set(newField.id);
      this.selectedActionId.set(null);
    }
  }

  // ── Field CRUD ────────────────────────────────────────────────────────────

  selectField(id: string) {
    this.selectedActionId.set(null);
    this.selectedFieldId.set(this.selectedFieldId() === id ? null : id);
  }

  selectAction(id: string) {
    this.selectedFieldId.set(null);
    this.selectedActionId.set(this.selectedActionId() === id ? null : id);
  }

  removeField(id: string) {
    this.fields.update(fs => fs.filter(f => f.id !== id));
    if (this.selectedFieldId() === id) this.selectedFieldId.set(null);
  }

  updateField(id: string, field: string, value: unknown) {
    this.fields.update(fs => fs.map(f =>
      f.id === id ? { ...f, [field]: value } : f
    ));
  }

  // ── Data source for fields ────────────────────────────────────────────────

  getModuleEndpoints(moduleApiPrefix?: string): EndpointDef[] {
    if (!moduleApiPrefix) return [];
    const mod = MODULES.find(m => m.apiPrefix === moduleApiPrefix);
    return mod?.endpoints ?? [];
  }

  setFieldDataSourceModule(fieldId: string, moduleApiPrefix: string) {
    const mod = MODULES.find(m => m.apiPrefix === moduleApiPrefix);
    if (!mod) return;
    this.fields.update(fs => fs.map(f => {
      if (f.id !== fieldId) return f;
      return {
        ...f,
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

  setFieldDataSourceEndpoint(fieldId: string, pathTemplate: string) {
    const field = this.fields().find(f => f.id === fieldId);
    if (!field?.dataSource) return;
    const mod = MODULES.find(m => m.apiPrefix === field.dataSource!.moduleApiPrefix);
    const ep = mod?.endpoints.find(e => e.pathTemplate === pathTemplate);
    if (!ep) return;
    this.fields.update(fs => fs.map(f => {
      if (f.id !== fieldId) return f;
      return {
        ...f,
        dataSource: {
          ...f.dataSource!,
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

  updateFieldPathParam(fieldId: string, param: string, value: string) {
    this.fields.update(fs => fs.map(f => {
      if (f.id !== fieldId || !f.dataSource) return f;
      return {
        ...f,
        dataSource: {
          ...f.dataSource,
          pathParams: { ...f.dataSource.pathParams, [param]: value },
        },
      };
    }));
  }

  updateFieldDataPath(fieldId: string, value: string) {
    this.fields.update(fs => fs.map(f => {
      if (f.id !== fieldId || !f.dataSource) return f;
      return {
        ...f,
        dataSource: { ...f.dataSource, dataPath: value },
      };
    }));
  }

  // ── Submit actions ────────────────────────────────────────────────────────

  addSubmitAction() {
    const action: FormSubmitAction = {
      id: `sa-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      label: 'Submit',
      method: 'POST',
      moduleApiPrefix: '',
      moduleLabel: '',
      pathTemplate: '',
      endpointLabel: '',
      pathParams: {},
      bodyMode: 'fields',
      bodyKeys: [],
      bodySources: {},
      rawBody: '{}',
      bodyMapping: {},
      color: 'primary',
    };
    this.submitActions.update(as => [...as, action]);
    this.selectedFieldId.set(null);
    this.selectedActionId.set(action.id);
  }

  removeAction(id: string) {
    this.submitActions.update(as => as.filter(a => a.id !== id));
    if (this.selectedActionId() === id) this.selectedActionId.set(null);
  }

  updateAction(id: string, field: string, value: unknown) {
    this.submitActions.update(as => as.map(a =>
      a.id === id ? { ...a, [field]: value } : a
    ));
  }

  setActionModule(actionId: string, moduleApiPrefix: string) {
    const mod = MODULES.find(m => m.apiPrefix === moduleApiPrefix);
    if (!mod) return;
    this.submitActions.update(as => as.map(a => {
      if (a.id !== actionId) return a;
      return {
        ...a,
        moduleApiPrefix: mod.apiPrefix,
        moduleLabel: mod.label,
        pathTemplate: '',
        endpointLabel: '',
        pathParams: {},
      };
    }));
  }

  setActionEndpoint(actionId: string, pathTemplate: string) {
    const action = this.submitActions().find(a => a.id === actionId);
    if (!action) return;
    const mod = MODULES.find(m => m.apiPrefix === action.moduleApiPrefix);
    const ep = mod?.endpoints.find(e => e.pathTemplate === pathTemplate);
    if (!ep) return;
    this.submitActions.update(as => as.map(a => {
      if (a.id !== actionId) return a;
      return {
        ...a,
        pathTemplate: ep.pathTemplate,
        endpointLabel: ep.label,
        pathParams: {},
      };
    }));
  }

  updateActionPathParam(actionId: string, param: string, value: string) {
    this.submitActions.update(as => as.map(a => {
      if (a.id !== actionId) return a;
      return { ...a, pathParams: { ...a.pathParams, [param]: value } };
    }));
  }

  // ── Body mode & fields ──────────────────────────────────────────────────

  newBodyKey = '';

  getBodyMode(action: FormSubmitAction): BodyMode {
    return action.bodyMode ?? 'fields';
  }

  setBodyMode(actionId: string, mode: BodyMode) {
    this.submitActions.update(as => as.map(a =>
      a.id === actionId ? { ...a, bodyMode: mode } : a
    ));
  }

  setRawBody(actionId: string, value: string) {
    this.submitActions.update(as => as.map(a =>
      a.id === actionId ? { ...a, rawBody: value } : a
    ));
  }

  getBodySourceType(action: FormSubmitAction, key: string): 'hardcoded' | 'form-field' {
    return action.bodySources[key]?.type ?? 'hardcoded';
  }

  getBodyHardcodedValue(action: FormSubmitAction, key: string): string {
    const s = action.bodySources[key];
    return s?.type === 'hardcoded' ? s.value : '';
  }

  getBodyFieldId(action: FormSubmitAction, key: string): string {
    const s = action.bodySources[key];
    return s?.type === 'form-field' ? s.fieldId : '';
  }

  setBodySourceType(actionId: string, key: string, type: 'hardcoded' | 'form-field') {
    const src: BodyFieldSource = type === 'hardcoded'
      ? { type: 'hardcoded', value: '' }
      : { type: 'form-field', fieldId: '' };
    this.submitActions.update(as => as.map(a => {
      if (a.id !== actionId) return a;
      return { ...a, bodySources: { ...a.bodySources, [key]: src } };
    }));
  }

  setBodyHardcoded(actionId: string, key: string, value: string) {
    this.submitActions.update(as => as.map(a => {
      if (a.id !== actionId) return a;
      return { ...a, bodySources: { ...a.bodySources, [key]: { type: 'hardcoded', value } } };
    }));
  }

  setBodyFieldSource(actionId: string, key: string, fieldId: string) {
    this.submitActions.update(as => as.map(a => {
      if (a.id !== actionId) return a;
      return { ...a, bodySources: { ...a.bodySources, [key]: { type: 'form-field', fieldId } } };
    }));
  }

  addBodyKey(actionId: string) {
    const key = this.newBodyKey.trim();
    if (!key) return;
    this.submitActions.update(as => as.map(a => {
      if (a.id !== actionId) return a;
      return {
        ...a,
        bodyKeys: a.bodyKeys.includes(key) ? a.bodyKeys : [...a.bodyKeys, key],
        bodySources: { ...a.bodySources, [key]: a.bodySources[key] ?? { type: 'hardcoded', value: '' } },
      };
    }));
    this.newBodyKey = '';
  }

  removeBodyKey(actionId: string, key: string) {
    this.submitActions.update(as => as.map(a => {
      if (a.id !== actionId) return a;
      const bodySources = { ...a.bodySources };
      delete bodySources[key];
      return { ...a, bodyKeys: a.bodyKeys.filter(k => k !== key), bodySources };
    }));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  kindLabel(kind: FormFieldKind): string {
    return this.fieldTypes.find(ft => ft.kind === kind)?.label ?? kind;
  }

  isArray(data: unknown): boolean {
    return Array.isArray(data);
  }

  asArray(data: unknown): unknown[] {
    return Array.isArray(data) ? data : [];
  }

  getSelectOptions(field: FormField): { display: string; value: string }[] {
    const items = Array.isArray(field.lastData) ? field.lastData as Record<string, unknown>[] : [];
    const displayField = field.displayField || '';
    const valueField = field.valueField || '';
    return items.slice(0, 10).map(item => ({
      display: displayField ? String(this.svc.getPath(item, displayField) ?? '') : JSON.stringify(item).slice(0, 60),
      value: valueField ? String(this.svc.getPath(item, valueField) ?? '') : '',
    }));
  }

  getTableColumns(field: FormField): string[] {
    if (field.columns) {
      return field.columns.split(',').map(c => c.trim()).filter(Boolean);
    }
    const items = Array.isArray(field.lastData) ? field.lastData as Record<string, unknown>[] : [];
    if (items.length > 0) return Object.keys(items[0]).slice(0, 8);
    return [];
  }

  getTableRows(field: FormField): Record<string, string>[] {
    const items = Array.isArray(field.lastData) ? field.lastData as Record<string, unknown>[] : [];
    const columns = this.getTableColumns(field);
    return items.slice(0, 30).map(item => {
      const row: Record<string, string> = {};
      for (const col of columns) {
        const val = this.svc.getPath(item, col);
        row[col] = val == null ? '' : String(val);
      }
      return row;
    });
  }

  // ── Field resize ──────────────────────────────────────────────────────────

  onFieldResizeStart(event: MouseEvent, field: FormField, direction: 'e' | 's' | 'se') {
    event.preventDefault();
    event.stopPropagation();

    this.resizingFieldId = field.id;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartWidth = field.width;
    this.resizeStartHeight = field.height;

    const canvasEl = (this.el.nativeElement as HTMLElement).querySelector('.canvas-area');
    if (canvasEl) {
      const contentWidth = canvasEl.clientWidth - 40;
      this.gridColWidth = (contentWidth - this.GRID_GAP * 11) / 12;
    }

    const onMove = (ev: MouseEvent) => {
      if (!this.resizingFieldId) return;
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

      this.fields.update(fs => fs.map(f =>
        f.id === this.resizingFieldId ? { ...f, width: newWidth, height: newHeight } : f
      ));
    };

    const onUp = () => {
      this.resizingFieldId = null;
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

  // ── Fetch data (for select / datatable) ───────────────────────────────────

  async fetchFieldData(field: FormField) {
    if (!field.dataSource) return;
    this.fetching.set(true);
    try {
      const ds = field.dataSource;
      const res = await firstValueFrom(
        this.api.get(ds.moduleApiPrefix, ds.pathTemplate, ds.pathParams, ds.queryParams)
      );
      let data: unknown = res;
      if (ds.dataPath) {
        data = this.svc.getPath(res, ds.dataPath);
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
      this.fields.update(fs => fs.map(f =>
        f.id === field.id ? { ...f, lastData: data } : f
      ));
    } catch (err) {
      console.error('Failed to fetch field data', err);
    } finally {
      this.fetching.set(false);
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  save() {
    this.saving.set(true);
    const form: FormDefinition = {
      id: this.formId(),
      name: this.formName() || 'Untitled Form',
      fields: this.fields().map(f => ({ ...f, lastData: undefined })),
      submitActions: this.submitActions(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const existing = this.svc.getById(form.id);
    if (existing) {
      form.createdAt = existing.createdAt;
    }
    this.svc.upsert(form);
    this.saving.set(false);
    this.router.navigate(['/forms']);
  }

  readonly previewMode = signal(false);

  preview() {
    this.previewMode.set(true);
    this.selectedFieldId.set(null);
    this.selectedActionId.set(null);
  }
}
