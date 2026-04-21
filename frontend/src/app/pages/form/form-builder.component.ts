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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
import { ShareService } from '../../services/share.service';
import { ApiService } from '../../services/api.service';
import { UserManagementService } from '../../services/user-management.service';
import {
  FormDefinition,
  FormField,
  FormFieldKind,
  FormSubmitAction,
  ActionMode,
  BodyMode,
  BodyFieldSource,
  FieldDataSourceMode,
} from '../../config/form.types';
import { MODULES, EndpointDef, extractPathParams } from '../../config/endpoints';
import { getEndpointPayload } from '../../config/endpoint-payloads';
import { getEndpointInputSchema } from '../../config/endpoint-schemas';
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
    MatSlideToggleModule, MatProgressSpinnerModule,
    CdkDrag, CdkDropList, CdkDropListGroup, CdkDragPlaceholder, CdkDragHandle,
    TranslatePipe,
  ],
  template: `
    <div class="builder-shell" cdkDropListGroup>
      <!-- ── BROWSER PANEL (left) ── -->
      @if (!previewMode()) {
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
              @if (action.actionMode === 'script') {
                <span class="method-tag method-patch">JS</span>
              } @else {
                <span class="method-tag method-{{ action.method.toLowerCase() }}">{{ action.method }}</span>
              }
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
      }

      <!-- ── CANVAS (center) ── -->
      <div class="canvas-panel">
        <div class="canvas-toolbar">
          <a mat-icon-button routerLink="/forms" matTooltip="{{ 'form.back-to-forms' | t }}">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="name-input">
            <input matInput [value]="formName()" (input)="formName.set($any($event.target).value)"
                   placeholder="{{ 'form.name-placeholder' | t }}" [readonly]="previewMode()" />
          </mat-form-field>
          <span class="spacer"></span>
          @if (!previewMode()) {
          <button mat-flat-button color="primary" (click)="save()" [disabled]="saving()">
            @if (saving()) { <mat-spinner diameter="16" /> }
            <mat-icon>save</mat-icon> {{ 'form.save' | t }}
          </button>
          }
          @if (previewMode()) {
          <button mat-stroked-button (click)="previewMode.set(false)">
            <mat-icon>edit</mat-icon> {{ 'form.exit-preview' | t }}
          </button>
          } @else {
          <button mat-stroked-button (click)="preview()" [disabled]="fields().length === 0">
            <mat-icon>visibility</mat-icon> {{ 'form.preview' | t }}
          </button>
          }
          <button mat-stroked-button (click)="toggleSharePanel()" [disabled]="!formId()">
            <mat-icon>{{ shareUrl() ? 'link' : 'share' }}</mat-icon> {{ 'form.share' | t }}
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
              <button mat-flat-button color="primary" (click)="shareForm()">
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
                 cdkDrag [cdkDragData]="field" [cdkDragDisabled]="previewMode()"
                 [class.selected]="!previewMode() && selectedFieldId() === field.id"
                 [style.grid-column]="'span ' + field.width"
                 [style.grid-row]="'span ' + field.height"
                 (click)="!previewMode() && selectField(field.id)">
              <div class="field-header">
                <mat-icon class="field-type-icon">
                  @if (field.kind === 'label') { label }
                  @else if (field.kind === 'text') { text_fields }
                  @else if (field.kind === 'number') { pin }
                  @else if (field.kind === 'boolean') { toggle_on }
                  @else if (field.kind === 'date') { calendar_today }
                  @else if (field.kind === 'select') { arrow_drop_down_circle }
                  @else { table_chart }
                </mat-icon>
                <span class="field-title">{{ field.label || kindLabel(field.kind) }}</span>
                <span class="field-badge">{{ kindLabel(field.kind) }}</span>
                @if (field.required) { <span class="required-mark">*</span> }
                @if (!previewMode()) {
                <div class="field-actions" (click)="$event.stopPropagation()">
                  <button mat-icon-button (click)="selectField(field.id)" matTooltip="{{ 'form.configure' | t }}">
                    <mat-icon>settings</mat-icon>
                  </button>
                  <button mat-icon-button (click)="removeField(field.id)" color="warn" matTooltip="{{ 'form.remove-field' | t }}">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                  <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                </div>
                }
              </div>

              <!-- Field preview -->
              <div class="field-preview">
                @if (field.kind === 'label') {
                  <div class="preview-label-value" (click)="$event.stopPropagation(); selectField(field.id)">
                    {{ getFieldValue(field.id) || field.placeholder || field.label || 'Label' }}
                  </div>
                  @if (field.boundFieldId) {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">table_chart</mat-icon>
                      {{ getBoundTableLabel(field) }} → {{ field.boundColumn || '?' }}
                    </span>
                  } @else if (field.dataSourceMode === 'script') {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">code</mat-icon>
                      Script → {{ field.valueField || '?' }}
                    </span>
                  } @else if (field.dataSource) {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">cloud</mat-icon>
                      {{ field.dataSource.moduleLabel }} › {{ field.valueField || '?' }}
                    </span>
                  }
                }
                @if (field.kind === 'text') {
                  <div class="preview-input">
                    <input type="text" class="preview-text-input"
                           [placeholder]="field.placeholder || field.label || 'Text input'"
                           [value]="getFieldValue(field.id)"
                           (input)="setFieldValue(field.id, $any($event.target).value)"
                           (click)="$event.stopPropagation(); selectField(field.id)" />
                  </div>
                  @if (field.boundFieldId) {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">table_chart</mat-icon>
                      {{ getBoundTableLabel(field) }} → {{ field.boundColumn || '?' }}
                    </span>
                  } @else if (field.dataSourceMode === 'script') {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">code</mat-icon>
                      Script → {{ field.valueField || '?' }}
                    </span>
                  } @else if (field.dataSource) {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">cloud</mat-icon>
                      {{ field.dataSource.moduleLabel }} › {{ field.valueField || '?' }}
                    </span>
                  }
                }
                @if (field.kind === 'number') {
                  <div class="preview-input">
                    <input type="number" class="preview-text-input"
                           [placeholder]="field.placeholder || field.label || '0'"
                           [value]="getFieldValue(field.id)"
                           (input)="setFieldValue(field.id, $any($event.target).valueAsNumber)"
                           (click)="$event.stopPropagation(); selectField(field.id)" />
                  </div>
                  @if (field.boundFieldId) {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">table_chart</mat-icon>
                      {{ getBoundTableLabel(field) }} → {{ field.boundColumn || '?' }}
                    </span>
                  } @else if (field.dataSourceMode === 'script') {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">code</mat-icon>
                      Script → {{ field.valueField || '?' }}
                    </span>
                  } @else if (field.dataSource) {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">cloud</mat-icon>
                      {{ field.dataSource.moduleLabel }} › {{ field.valueField || '?' }}
                    </span>
                  }
                }
                @if (field.kind === 'boolean') {
                  <div class="preview-boolean" (click)="$event.stopPropagation(); toggleBooleanField(field.id)">
                    <mat-slide-toggle
                      [checked]="getBooleanFieldValue(field.id)"
                      (change)="setFieldValue(field.id, $event.checked)"
                      (click)="$event.stopPropagation()">
                      {{ field.label || 'Toggle' }}
                    </mat-slide-toggle>
                  </div>
                }
                @if (field.kind === 'date') {
                  <div class="preview-input preview-date">
                    <input type="date" class="preview-text-input"
                           [value]="getFieldValue(field.id)"
                           (input)="setFieldValue(field.id, $any($event.target).value)"
                           (click)="$event.stopPropagation(); selectField(field.id)" />
                  </div>
                  @if (field.boundFieldId) {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">table_chart</mat-icon>
                      {{ getBoundTableLabel(field) }} → {{ field.boundColumn || '?' }}
                    </span>
                  } @else if (field.dataSourceMode === 'script') {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">code</mat-icon>
                      Script → {{ field.valueField || '?' }}
                    </span>
                  } @else if (field.dataSource) {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">cloud</mat-icon>
                      {{ field.dataSource.moduleLabel }} › {{ field.valueField || '?' }}
                    </span>
                  }
                }
                @if (field.kind === 'select') {
                  <mat-form-field appearance="outline" class="preview-select-field" (click)="$event.stopPropagation()">
                    <mat-select [value]="getFieldValue(field.id)"
                                (selectionChange)="setFieldValue(field.id, $event.value)"
                                [placeholder]="field.placeholder || 'Select…'">
                      @for (opt of getSelectOptions(field); track $index) {
                        <mat-option [value]="opt.value">{{ opt.display }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  @if (field.dataSourceMode === 'script') {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">code</mat-icon>
                      Script
                    </span>
                  } @else if (field.dataSource) {
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
                  @if (field.dataSourceMode === 'script') {
                    <span class="data-source-tag">
                      <mat-icon style="font-size:12px;width:12px;height:12px">code</mat-icon>
                      Script
                    </span>
                  } @else if (field.dataSource) {
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
                            <tr [class.row-selected]="selectedTableRow()?.fieldId === field.id && selectedTableRow()?.rowIndex === $index"
                                (click)="onTableRowSelect(field, $index, row); $event.stopPropagation()">
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
              @if (!previewMode()) {
              <div class="field-resize-handle resize-e" (mousedown)="onFieldResizeStart($event, field, 'e')" (click)="$event.stopPropagation()"></div>
              <div class="field-resize-handle resize-s" (mousedown)="onFieldResizeStart($event, field, 's')" (click)="$event.stopPropagation()"></div>
              <div class="field-resize-handle resize-se" (mousedown)="onFieldResizeStart($event, field, 'se')" (click)="$event.stopPropagation()"></div>
              }
            </div>
          }

          <!-- Submit buttons row -->
          @if (submitActions().length > 0) {
            <div class="submit-row" [style.grid-column]="'1 / -1'">
              @for (action of submitActions(); track action.id) {
                <div class="action-btn-group" [class.selected-action]="selectedActionId() === action.id">
                  <button mat-flat-button [color]="action.color"
                          (click)="executeAction(action)"
                          [disabled]="executing()"
                          class="action-run-btn">
                    @if (executing() && lastResponse()?.actionId === action.id) {
                      <mat-spinner diameter="16" />
                    } @else {
                      <mat-icon>{{ action.actionMode === 'script' ? 'code' : 'send' }}</mat-icon>
                    }
                    {{ action.label || action.method }}
                  </button>
                  @if (!previewMode()) {
                  <button mat-icon-button class="action-config-btn"
                          (click)="selectAction(action.id)"
                          matTooltip="{{ 'form.configure-action' | t }}">
                    <mat-icon>settings</mat-icon>
                  </button>
                  }
                </div>
              }
            </div>
          }

          <!-- Response panel -->
          @if (lastResponse(); as resp) {
            <div class="response-panel" [style.grid-column]="'1 / -1'"
                 [class.response-success]="resp.status === 'success'"
                 [class.response-error]="resp.status === 'error'">
              <div class="response-header">
                <mat-icon>{{ resp.status === 'success' ? 'check_circle' : 'error' }}</mat-icon>
                <span>{{ resp.status === 'success' ? ('form.response-success' | t) : ('form.response-error' | t) }}</span>
                <span class="spacer"></span>
                <button mat-icon-button (click)="lastResponse.set(null)">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <pre class="response-body">{{ formatJson(resp.data) }}</pre>
            </div>
          }
        </div>
      </div>

      <!-- ── CONFIG PANEL (right) ── -->
      @if (!previewMode()) {
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

            @if (field.kind !== 'boolean') {
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
              <mat-label>{{ 'form.placeholder' | t }}</mat-label>
              <input matInput [value]="field.placeholder || ''" (input)="updateField(field.id, 'placeholder', $any($event.target).value)" />
            </mat-form-field>
            }

            <mat-checkbox [checked]="field.required" (change)="updateField(field.id, 'required', $event.checked)">
              {{ 'form.required' | t }}
            </mat-checkbox>

            <mat-divider class="section-divider" />

            <!-- Data Source / Data Binding -->
            @if (field.kind === 'label' || field.kind === 'text' || field.kind === 'number' || field.kind === 'boolean' || field.kind === 'date' || field.kind === 'select' || field.kind === 'datatable') {
              <div class="config-section-label">{{ field.kind === 'label' || field.kind === 'text' || field.kind === 'number' || field.kind === 'boolean' || field.kind === 'date' ? ('form.data-binding' | t) : ('form.data-source' | t) }}</div>

              <!-- Data source mode toggle -->
              <div class="body-mode-toggle">
                <button mat-stroked-button
                        [class.active-mode]="getFieldDataSourceMode(field) === 'api'"
                        (click)="updateField(field.id, 'dataSourceMode', 'api')">
                  <mat-icon>api</mat-icon> {{ 'form.api-mode' | t }}
                </button>
                <button mat-stroked-button
                        [class.active-mode]="getFieldDataSourceMode(field) === 'script'"
                        (click)="updateField(field.id, 'dataSourceMode', 'script')">
                  <mat-icon>code</mat-icon> {{ 'form.script-mode' | t }}
                </button>
              </div>

              <!-- ── SCRIPT MODE ── -->
              @if (getFieldDataSourceMode(field) === 'script') {
                <mat-divider class="section-divider" />
                <div class="config-section-label">{{ 'form.script-code' | t }}</div>
                <p class="config-hint">{{ 'form.field-script-hint' | t }}</p>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>{{ 'form.script-code' | t }}</mat-label>
                  <textarea matInput rows="12"
                            [value]="field.scriptCode ?? ''"
                            (input)="onFieldScriptInput($any($event.target), field.id)"
                            (keydown)="onScriptKeydown($event)"
                            (blur)="closeAc()"
                            placeholder="// All API modules available (e.g. ZohoBooks, ZohoCRM)&#10;&#10;const res = await ZohoBooks.ListContacts();&#10;return res.contacts;"
                            class="script-textarea"></textarea>
                  <mat-hint>{{ 'form.script-async-hint' | t }}</mat-hint>
                </mat-form-field>

                <!-- Data path for script result -->
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>{{ 'form.data-path' | t }}</mat-label>
                  <input matInput [value]="field.dataSource?.dataPath ?? ''"
                         (input)="updateFieldDataPath(field.id, $any($event.target).value)"
                         placeholder="data" />
                </mat-form-field>
              }

              <!-- ── API MODE ── -->
              @if (getFieldDataSourceMode(field) === 'api') {
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
              } <!-- end API MODE -->

              @if (field.kind === 'label' || field.kind === 'text' || field.kind === 'number' || field.kind === 'boolean' || field.kind === 'date') {
                <mat-divider class="section-divider" />
                <div class="config-section-label">{{ 'form.text-binding' | t }}</div>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>{{ 'form.value-field' | t }}</mat-label>
                  <input matInput [value]="field.valueField || ''"
                         (input)="updateField(field.id, 'valueField', $any($event.target).value)"
                         placeholder="name" />
                  <mat-hint>{{ 'form.text-binding-hint' | t }}</mat-hint>
                </mat-form-field>

                <!-- Bind to Table row -->
                @if (getDatatableFields().length > 0) {
                  <mat-divider class="section-divider" />
                  <div class="config-section-label">{{ 'form.bind-to-table' | t }}</div>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                    <mat-label>{{ 'form.source-table' | t }}</mat-label>
                    <mat-select [value]="field.boundFieldId || ''"
                                (selectionChange)="updateField(field.id, 'boundFieldId', $event.value || undefined)">
                      <mat-option value="">{{ 'form.none' | t }}</mat-option>
                      @for (dt of getDatatableFields(); track dt.id) {
                        <mat-option [value]="dt.id">{{ dt.label || dt.id }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  @if (field.boundFieldId) {
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                      <mat-label>{{ 'form.bound-column' | t }}</mat-label>
                      <input matInput [value]="field.boundColumn || ''"
                             (input)="updateField(field.id, 'boundColumn', $any($event.target).value)"
                             placeholder="email" />
                      <mat-hint>{{ 'form.bound-column-hint' | t }}</mat-hint>
                    </mat-form-field>
                  }
                }
              }

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

              <button mat-flat-button color="accent" class="full-width"
                      (click)="fetchFieldData(field)"
                      [disabled]="(getFieldDataSourceMode(field) === 'api' && !field.dataSource) || (getFieldDataSourceMode(field) === 'script' && !field.scriptCode?.trim()) || fetching()">
                @if (fetching()) { <mat-spinner diameter="16" /> }
                <mat-icon>{{ getFieldDataSourceMode(field) === 'script' ? 'play_arrow' : 'cloud_download' }}</mat-icon>
                {{ getFieldDataSourceMode(field) === 'script' ? ('form.run-script' | t) : ('form.fetch-data' | t) }}
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

            @if (getActionMode(action) === 'api') {
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
              <mat-label>{{ 'form.http-method' | t }}</mat-label>
              <mat-select [value]="action.method" (selectionChange)="updateAction(action.id, 'method', $event.value)">
                <mat-option value="POST">POST</mat-option>
                <mat-option value="PUT">PUT</mat-option>
                <mat-option value="PATCH">PATCH</mat-option>
                <mat-option value="DELETE">DELETE</mat-option>
              </mat-select>
            </mat-form-field>
            }

            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
              <mat-label>{{ 'form.button-color' | t }}</mat-label>
              <mat-select [value]="action.color" (selectionChange)="updateAction(action.id, 'color', $event.value)">
                <mat-option value="primary">Primary</mat-option>
                <mat-option value="accent">Accent</mat-option>
                <mat-option value="warn">Warn</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-divider class="section-divider" />

            <!-- Action mode toggle: API vs Script -->
            <div class="config-section-label">{{ 'form.action-mode' | t }}</div>
            <div class="body-mode-toggle">
              <button mat-stroked-button
                      [class.active-mode]="getActionMode(action) === 'api'"
                      (click)="updateAction(action.id, 'actionMode', 'api')">
                <mat-icon>api</mat-icon> {{ 'form.api-mode' | t }}
              </button>
              <button mat-stroked-button
                      [class.active-mode]="getActionMode(action) === 'script'"
                      (click)="updateAction(action.id, 'actionMode', 'script')">
                <mat-icon>code</mat-icon> {{ 'form.script-mode' | t }}
              </button>
            </div>

            <!-- ── SCRIPT MODE ── -->
            @if (getActionMode(action) === 'script') {
              <mat-divider class="section-divider" />
              <div class="config-section-label">{{ 'form.script-code' | t }}</div>
              <p class="config-hint">{{ 'form.script-hint' | t }}</p>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'form.script-code' | t }}</mat-label>
                <textarea matInput rows="14"
                          [value]="action.scriptCode ?? ''"
                          (input)="onActionScriptInput($any($event.target), action.id)"
                          (keydown)="onScriptKeydown($event)"
                          (blur)="closeAc()"
                          placeholder="// Form field values available via FormFields object&#10;// All API modules available (e.g. ImpossibleCloud, ZohoCRM)&#10;&#10;const regions = await ImpossibleCloud.ListRegions();&#10;return regions;"
                          class="raw-body-textarea script-textarea"></textarea>
                <mat-hint>{{ 'form.script-async-hint' | t }}</mat-hint>
              </mat-form-field>
            }

            <!-- ── API MODE ── -->
            @if (getActionMode(action) === 'api') {
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
                         (input)="onAcInput($any($event.target), pathParamCallback(action.id, param))"
                         (keydown)="onAcKeydown($event)"
                         (blur)="closeAc()"
                         [placeholder]="fieldRefPlaceholder" />
                </mat-form-field>
              }
            }

            <mat-divider class="section-divider" />

            <!-- Body mapping (only for POST/PUT/PATCH) -->
            @if (action.method === 'POST' || action.method === 'PUT' || action.method === 'PATCH') {
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
              <div class="generate-row">
                <p class="config-hint">{{ 'form.body-mapping-hint' | t }}</p>
                <button mat-stroked-button class="generate-btn" (click)="generateFieldsTemplate(action.id)"
                        matTooltip="{{ 'form.generate-hint' | t }}">
                  <mat-icon>auto_fix_high</mat-icon> {{ 'form.generate-template' | t }}
                </button>
              </div>
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
                             (input)="onAcInput($any($event.target), acSetHardcoded.bind(this, action.id, key))"
                             (keydown)="onAcKeydown($event)"
                             (blur)="closeAc()"
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
              <button mat-stroked-button class="generate-btn" (click)="generateTextTemplate(action.id)"
                      matTooltip="{{ 'form.generate-hint' | t }}">
                <mat-icon>auto_fix_high</mat-icon> {{ 'form.generate-template' | t }}
              </button>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'form.raw-body-json' | t }}</mat-label>
                <textarea matInput rows="10"
                          [value]="action.rawBody ?? '{}'"
                          (input)="onAcTextareaInput($any($event.target), action.id)"
                          (keydown)="onAcKeydown($event)"
                          (blur)="closeAc()"
                          placeholder='{ "key": "value" }'
                          class="raw-body-textarea"></textarea>
                <mat-hint>{{ 'form.json-hint' | t }}</mat-hint>
              </mat-form-field>
            }

            <!-- ── FORM MODE ── -->
            @if (getBodyMode(action) === 'form') {
              <button mat-stroked-button class="generate-btn" (click)="generateFormTemplate(action.id)"
                      matTooltip="{{ 'form.generate-hint' | t }}">
                <mat-icon>auto_fix_high</mat-icon> {{ 'form.generate-template' | t }}
              </button>
              <p class="config-hint">{{ 'form.form-mode-hint' | t }}</p>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'form.raw-body-json' | t }}</mat-label>
                <textarea matInput rows="10"
                          [value]="action.rawBody ?? '{}'"
                          (input)="onAcTextareaInput($any($event.target), action.id)"
                          (keydown)="onAcKeydown($event)"
                          (blur)="closeAc()"
                          [placeholder]="formModePlaceholder"
                          class="raw-body-textarea"></textarea>
                <mat-hint>{{ 'form.form-ref-hint' | t }}</mat-hint>
              </mat-form-field>
            }
            } @else {
              <p class="config-hint" style="font-style:italic">{{ 'form.no-body' | t }}</p>
            }
            } <!-- end API mode -->
          </div>
        }

        <!-- Autocomplete overlay for {{field.xxx}} refs -->
        @if (acSuggestions().length > 0) {
          <div class="ac-overlay" [ngStyle]="acStyle()">
            @for (s of acSuggestions(); track s.insertText; let i = $index) {
              <div class="ac-item" [class.ac-active]="i === acIndex()"
                   (mousedown)="insertAcSuggestion(s, $event)">
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
    .preview-text-input {
      border: none; outline: none; background: transparent;
      color: #1e293b; font-size: 12px; width: 100%; cursor: text;
    }
    .preview-text-input::placeholder { color: #94a3b8; }
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
    .action-btn-group {
      display: flex; align-items: center; gap: 0;
      border-radius: 8px; transition: outline .15s;
    }
    .action-btn-group.selected-action { outline: 2px solid #0891b2; outline-offset: 2px; }
    .action-run-btn { border-radius: 8px 0 0 8px !important; min-width: 100px; }
    .action-config-btn {
      border-radius: 0 8px 8px 0 !important;
      border: 1px solid #e2e8f0; border-left: none;
      background: white; width: 100px; height: 40px; line-height: 22px;
      padding: 0;
    }
    .action-config-btn mat-icon { font-size: 12px; width: 12px; height: 12px; color: #64748b; }
    .action-config-btn:hover { background: #f1f5f9; }
    .action-config-btn:hover mat-icon { color: #0891b2; }

    /* ── Select input ── */
    .preview-select-field {
      width: 100%; font-size: 12px;
    }
    .preview-select-field .mat-mdc-form-field-subscript-wrapper { display: none; }
    .preview-select-field .mdc-notched-outline__leading,
    .preview-select-field .mdc-notched-outline__notch,
    .preview-select-field .mdc-notched-outline__trailing {
      border-color: #e2e8f0 !important;
    }
    .preview-select-field:hover .mdc-notched-outline__leading,
    .preview-select-field:hover .mdc-notched-outline__notch,
    .preview-select-field:hover .mdc-notched-outline__trailing {
      border-color: #0891b2 !important;
    }

    /* ── Response panel ── */
    .response-panel {
      border-radius: 12px; padding: 0; overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .response-success { border-color: #22c55e; }
    .response-error { border-color: #ef4444; }
    .response-header {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px; font-weight: 700; font-size: 13px;
    }
    .response-success .response-header { background: #f0fdf4; color: #15803d; }
    .response-error .response-header { background: #fef2f2; color: #dc2626; }
    .response-body {
      padding: 12px 16px; font-size: 11px; margin: 0;
      max-height: 300px; overflow: auto;
      font-family: 'Cascadia Code', 'Fira Code', monospace;
      background: #fafbfc; line-height: 1.5;
      white-space: pre-wrap; word-break: break-all;
    }

    /* ── Config Panel ── */
    .config-panel {
      width: 0; overflow: hidden; background: white;
      border-left: 1px solid #e2e8f0; transition: width .2s;
      display: flex; flex-direction: column;
    }
    .config-panel.open { width: 360px; min-width: 360px; overflow-y: auto; }
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
    .share-copied-badge {
      display: inline-flex; align-items: center; gap: 4px;
      color: #16a34a; font-size: 12px; font-weight: 600;
    }
    .share-copied-badge mat-icon { font-size: 16px; width: 16px; height: 16px; }
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
    .share-url-display {
      display: flex; align-items: center; gap: 4px; margin-top: 8px; width: 100%;
    }
    .share-url-input {
      flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px;
      font-size: 12px; color: #1e293b; background: #f8fafc; outline: none; min-width: 0;
    }
    .share-url-input:focus { border-color: #3b82f6; }
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

    .generate-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .generate-row .config-hint { margin: 0; flex: 1; }
    .generate-btn {
      font-size: 11px; white-space: nowrap; margin-bottom: 8px;
    }
    .generate-btn mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; }

    /* ── Autocomplete overlay ── */
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

    .raw-body-textarea {
      font-family: 'Cascadia Code', 'Fira Code', monospace;
      font-size: 11px; line-height: 1.5;
    }
    .script-textarea {
      min-height: 200px; resize: vertical;
      tab-size: 2;
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
    .data-table tbody tr { cursor: pointer; }
    .data-table tbody tr.row-selected td { background: #dbeafe; font-weight: 500; }

    .preview-label-value {
      font-size: 13px; color: #1e293b; padding: 6px 0;
      line-height: 1.5; word-break: break-word;
    }

    .preview-boolean {
      display: flex; align-items: center; padding: 4px 0;
    }
  `]
})
export class FormBuilderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(FormService);
  private readonly shareSvc = inject(ShareService);
  private readonly api = inject(ApiService);
  private readonly el = inject(ElementRef);
  private readonly userMgmt = inject(UserManagementService);

  readonly allModules = MODULES;
  readonly widthOptions = [3, 4, 6, 8, 12];
  readonly heightOptions = [1, 2, 3, 4, 5, 6];
  readonly fieldRefPlaceholder = 'Value or {{field.id}} ref';
  readonly formModePlaceholder = '{ "key": "{{field.myField}}" }';

  readonly fieldTypes: FieldTypeRef[] = [
    { kind: 'label',      label: 'Label',         icon: 'label',                 color: '#64748b' },
    { kind: 'text',       label: 'Text Input',    icon: 'text_fields',           color: '#2563eb' },
    { kind: 'number',     label: 'Number',        icon: 'pin',                   color: '#0d9488' },
    { kind: 'boolean',    label: 'Boolean',       icon: 'toggle_on',             color: '#e11d48' },
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
  readonly executing = signal(false);
  readonly lastResponse = signal<{ actionId: string; status: 'success' | 'error'; data: unknown } | null>(null);
  /** Runtime values entered in the form fields */
  readonly fieldValues = signal<Record<string, unknown>>({});
  /** Currently selected datatable row: { fieldId, rowIndex } */
  readonly selectedTableRow = signal<{ fieldId: string; rowIndex: number } | null>(null);

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
        // Auto-fetch data for fields with a dataSource or script but no cached data
        for (const f of this.fields()) {
          if ((f.dataSource || f.dataSourceMode === 'script') && f.lastData == null) this.fetchFieldData(f);
        }
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
    this.selectedFieldId.set(id);
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

  getActionMode(action: FormSubmitAction): ActionMode {
    return action.actionMode ?? 'api';
  }

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

    const { rawBody, bodyKeys, bodySources } = this.resolveActionBody(action, mod, ep);

    this.submitActions.update(as => as.map(a =>
      a.id === actionId ? {
        ...a,
        method: ep.method as FormSubmitAction['method'],
        pathTemplate: ep.pathTemplate,
        endpointLabel: ep.label,
        pathParams: {},
        bodyMode: 'text',
        rawBody,
        bodyKeys,
        bodySources,
      } : a
    ));
  }

  private resolveActionBody(action: FormSubmitAction, mod: typeof MODULES[number] | undefined, ep: EndpointDef) {
    const hasBody = ep.hasBody ?? ['POST', 'PUT', 'PATCH'].includes(ep.method);
    let rawBody = hasBody ? '{}' : '';
    let bodyKeys: string[] = hasBody ? action.bodyKeys : [];
    let bodySources: Record<string, BodyFieldSource> = hasBody ? action.bodySources : {};

    if (hasBody && mod) {
      ({ rawBody, bodyKeys, bodySources } = this.generateEndpointBody(mod.id, ep.id, rawBody, bodyKeys, bodySources));
    }
    return { rawBody, bodyKeys, bodySources };
  }

  private generateEndpointBody(
    modId: string, epId: string,
    rawBody: string, bodyKeys: string[], bodySources: Record<string, BodyFieldSource>,
  ): { rawBody: string; bodyKeys: string[]; bodySources: Record<string, BodyFieldSource> } {
    const payload = getEndpointPayload(modId, epId);
    if (!payload || typeof payload !== 'object') return { rawBody, bodyKeys, bodySources };
    rawBody = JSON.stringify(payload, null, 2);
    const keys = Object.keys(payload as Record<string, unknown>);
    bodyKeys = keys;
    bodySources = {};
    for (const key of keys) {
      const val = (payload as Record<string, unknown>)[key];
      bodySources[key] = { type: 'hardcoded', value: typeof val === 'string' ? val : JSON.stringify(val) };
    }
    return { rawBody, bodyKeys, bodySources };
  }

  updateActionPathParam(actionId: string, param: string, value: string) {
    this.submitActions.update(as => as.map(a => {
      if (a.id !== actionId) return a;
      return { ...a, pathParams: { ...a.pathParams, [param]: value } };
    }));
  }

  /** Returns a callback for onAcInput that updates a specific path param */
  pathParamCallback(actionId: string, param: string): (value: string) => void {
    return (value: string) => this.updateActionPathParam(actionId, param, value);
  }

  /** Generate body keys + sources from current form fields (fields mode) */
  generateFieldsTemplate(actionId: string) {
    const ff = this.fields();
    if (ff.length === 0) return;
    const keys = ff.map(f => f.label || f.id);
    const sources: Record<string, BodyFieldSource> = {};
    ff.forEach(f => { sources[f.label || f.id] = { type: 'form-field', fieldId: f.id }; });
    this.submitActions.update(as => as.map(a => {
      if (a.id !== actionId) return a;
      return { ...a, bodyKeys: keys, bodySources: sources };
    }));
  }

  /** Generate raw JSON with field labels as keys and empty default values (text mode) */
  generateTextTemplate(actionId: string) {
    const ff = this.fields();
    if (ff.length === 0) return;
    const obj: Record<string, string> = {};
    ff.forEach(f => { obj[f.label || f.id] = ''; });
    const json = JSON.stringify(obj, null, 2);
    this.submitActions.update(as => as.map(a =>
      a.id === actionId ? { ...a, rawBody: json } : a
    ));
  }

  /** Generate raw JSON with {{field.xxx}} references (form mode) */
  generateFormTemplate(actionId: string) {
    const ff = this.fields();
    if (ff.length === 0) return;
    const obj: Record<string, string> = {};
    ff.forEach(f => { obj[f.label || f.id] = `{{field.${f.id}}}`; });
    const json = JSON.stringify(obj, null, 2);
    this.submitActions.update(as => as.map(a =>
      a.id === actionId ? { ...a, rawBody: json } : a
    ));
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

  /** Safely convert unknown value to string without [object Object] */
  private safeStr(val: unknown, fallback = ''): string {
    if (val == null) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    return JSON.stringify(val);
  }

  /** Get Material icon for a field kind */
  private getFieldIcon(kind: FormFieldKind): string {
    switch (kind) {
      case 'label': return 'label';
      case 'text': return 'text_fields';
      case 'number': return 'pin';
      case 'boolean': return 'toggle_on';
      case 'date': return 'calendar_today';
      case 'select': return 'arrow_drop_down_circle';
      default: return 'table_chart';
    }
  }

  getSelectOptions(field: FormField): { display: string; value: string }[] {
    const items = Array.isArray(field.lastData) ? field.lastData as Record<string, unknown>[] : [];
    const displayField = field.displayField || '';
    const valueField = field.valueField || '';
    return items.slice(0, 10).map(item => ({
      display: displayField ? this.safeStr(this.svc.getPath(item, displayField)) : JSON.stringify(item).slice(0, 60),
      value: valueField ? this.safeStr(this.svc.getPath(item, valueField)) : '',
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
        row[col] = this.safeStr(val);
      }
      return row;
    });
  }

  /** Called when a datatable row is clicked — updates all text/date fields bound to this table */
  onTableRowSelect(tableField: FormField, rowIndex: number, row: Record<string, string>) {
    this.selectedTableRow.set({ fieldId: tableField.id, rowIndex });
    // Store each column value as fieldValues['tableFieldId.colName'] for {{field.tableId.col}} refs
    for (const [col, val] of Object.entries(row)) {
      this.setFieldValue(`${tableField.id}.${col}`, val ?? '');
    }
    // Find all fields bound to this datatable and populate their values
    for (const f of this.fields()) {
      if (f.boundFieldId === tableField.id && f.boundColumn) {
        const value = row[f.boundColumn] ?? '';
        this.setFieldValue(f.id, value);
      }
    }
  }

  /** Get datatable fields for the "Bind to Table" dropdown */
  getDatatableFields(): FormField[] {
    return this.fields().filter(f => f.kind === 'datatable');
  }

  /** Get label of bound datatable field */
  getBoundTableLabel(field: FormField): string {
    const dt = this.fields().find(f => f.id === field.boundFieldId);
    return dt?.label || field.boundFieldId || '?';
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

  // ── Fetch data (for select / datatable / text+date binding) ──────────────

  getFieldDataSourceMode(field: FormField): FieldDataSourceMode {
    return field.dataSourceMode ?? 'api';
  }

  async fetchFieldData(field: FormField) {
    const mode = this.getFieldDataSourceMode(field);

    if (mode === 'script') {
      return this.fetchFieldDataFromScript(field);
    }

    if (!field.dataSource) return;
    this.fetching.set(true);
    try {
      const ds = field.dataSource;
      const res = await firstValueFrom(
        this.api.get(ds.moduleApiPrefix, ds.pathTemplate, ds.pathParams, ds.queryParams)
      );
      this.applyFetchedData(field, res);
    } catch (err) {
      console.error('Failed to fetch field data', err);
    } finally {
      this.fetching.set(false);
    }
  }

  /** Execute script data source — same async pattern as dashboard/workflow scripts */
  private async fetchFieldDataFromScript(field: FormField) {
    const code = field.scriptCode ?? '';
    if (!code.trim()) return;

    this.fetching.set(true);
    try {
      const apiProxies = this.buildScriptApiProxies();
      const formFields: Record<string, unknown> = {};
      for (const f of this.fields()) {
        formFields[f.label || f.id] = this.fieldValues()[f.id] ?? '';
      }
      const args: Record<string, unknown> = { FormFields: formFields, ...apiProxies };

      const argNames = Object.keys(args);
      const argValues = argNames.map(n => args[n]);

      // eslint-disable-next-line no-new-func
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction(...argNames, code);
      const res = await fn(...argValues);

      this.applyFetchedData(field, res);
    } catch (err) {
      console.error('Failed to run field script', err);
    } finally {
      this.fetching.set(false);
    }
  }

  /** Store fetched data and, for text/date fields, extract a single value via valueField */
  private applyFetchedData(field: FormField, res: unknown) {
    if (field.kind === 'label' || field.kind === 'text' || field.kind === 'number' || field.kind === 'boolean' || field.kind === 'date') {
      let data: unknown = res;
      if (field.dataSource?.dataPath) {
        data = this.svc.getPath(res, field.dataSource.dataPath);
      }
      // Auto-unwrap common wrapper keys when dataPath is not set
      if (!Array.isArray(data) && data && typeof data === 'object') {
        const obj = data as Record<string, unknown>;
        for (const key of ['data', 'records', 'items', 'result']) {
          if (Array.isArray(obj[key])) { data = obj[key]; break; }
        }
        // If still not an array, try the first array-valued property
        if (!Array.isArray(data)) {
          const firstArr = Object.values(obj).find(v => Array.isArray(v));
          if (firstArr) data = firstArr;
        }
      }
      // If the result is an array, take the first element
      if (Array.isArray(data) && data.length > 0) data = data[0];
      // Extract the value at valueField path
      let value: unknown = data;
      if (field.valueField && data && typeof data === 'object') {
        value = this.svc.getPath(data, field.valueField);
      }
      const strValue = value != null ? String(value) : '';
      this.setFieldValue(field.id, strValue);
      this.fields.update(fs => fs.map(f =>
        f.id === field.id ? { ...f, lastData: res } : f
      ));
    } else {
      // For select/datatable: extract array as before
      const data = this.extractFieldArrayData(res, field.dataSource?.dataPath);
      this.fields.update(fs => fs.map(f =>
        f.id === field.id ? { ...f, lastData: data } : f
      ));
    }
  }

  /** Apply dataPath and auto-detect wrapped arrays (searches up to 3 levels deep) */
  private extractFieldArrayData(res: unknown, dataPath?: string): unknown {
    let data: unknown = res;
    if (dataPath) {
      data = this.svc.getPath(res, dataPath);
    }
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      // Prioritise common keys
      for (const key of ['data', 'records', 'items']) {
        if (Array.isArray(obj[key])) return obj[key];
      }
      const firstArr = Object.values(obj).find(v => Array.isArray(v));
      if (firstArr) return firstArr;
    }
    return data;
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  save() {
    this.saving.set(true);
    const form: FormDefinition = {
      id: this.formId(),
      name: this.formName() || 'Untitled Form',
      fields: this.fields(),
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

  // ── Field values (runtime) ─────────────────────────────────────────────

  getFieldValue(fieldId: string): string {
    return this.safeStr(this.fieldValues()[fieldId]);
  }

  setFieldValue(fieldId: string, value: unknown) {
    this.fieldValues.update(v => ({ ...v, [fieldId]: value }));
  }

  getBooleanFieldValue(fieldId: string): boolean {
    const val = this.fieldValues()[fieldId];
    return val === true || val === 'true';
  }

  toggleBooleanField(fieldId: string) {
    this.setFieldValue(fieldId, !this.getBooleanFieldValue(fieldId));
  }

  // ── Execute submit action ──────────────────────────────────────────────

  async executeAction(actionParam: FormSubmitAction) {
    // Always read the latest action from the signal to pick up path-param edits
    const action = this.submitActions().find(a => a.id === actionParam.id) ?? actionParam;
    const mode = this.getActionMode(action);

    if (mode === 'script') {
      return this.executeScriptAction(action);
    }

    console.log('[FormBuilder] executeAction called:', {
      moduleApiPrefix: action.moduleApiPrefix,
      pathTemplate: action.pathTemplate,
      method: action.method,
      bodyMode: action.bodyMode,
      pathParams: action.pathParams,
    });
    if (!action.moduleApiPrefix || !action.pathTemplate) {
      console.warn('[FormBuilder] Missing moduleApiPrefix or pathTemplate — action not configured');
      this.lastResponse.set({
        actionId: action.id,
        status: 'error',
        data: { error: 'Action not configured — click the ⚙ button to set module and endpoint' },
      });
      return;
    }

    this.executing.set(true);
    this.lastResponse.set({ actionId: action.id, status: 'success', data: null });

    try {
      const body = this.buildRequestBody(action);
      const values = this.fieldValues();
      const resolvedPathParams: Record<string, string> = {};
      for (const [key, val] of Object.entries(action.pathParams)) {
        resolvedPathParams[key] = this.resolveFieldRefs(val, values);
      }
      const method = action.method.toLowerCase();
      console.log('[FormBuilder] Executing action:', method.toUpperCase(), action.moduleApiPrefix + action.pathTemplate, 'pathParams:', resolvedPathParams, 'Body:', body);
      let res: unknown;

      if (method === 'delete') {
        res = await firstValueFrom(
          this.api.delete(action.moduleApiPrefix, action.pathTemplate, resolvedPathParams)
        );
      } else {
        const apiCallMap: Record<string, typeof this.api.post> = {
          put: this.api.put,
          patch: this.api.patch,
          post: this.api.post,
        };
        const apiCall = apiCallMap[method] ?? this.api.post;
        res = await firstValueFrom(
          apiCall.call(this.api, action.moduleApiPrefix, action.pathTemplate, resolvedPathParams, body)
        );
      }

      this.lastResponse.set({ actionId: action.id, status: 'success', data: res });
    } catch (err: unknown) {
      const errorData = (err && typeof err === 'object' && 'error' in err)
        ? (err as { error: unknown }).error
        : err;
      this.lastResponse.set({ actionId: action.id, status: 'error', data: errorData });
    } finally {
      this.executing.set(false);
    }
  }

  /** Execute a script action — same pattern as workflow ScriptBlock */
  private async executeScriptAction(action: FormSubmitAction) {
    const code = action.scriptCode ?? '';
    if (!code.trim()) {
      this.lastResponse.set({
        actionId: action.id,
        status: 'error',
        data: { error: 'No script code configured — click the ⚙ button to add a script' },
      });
      return;
    }

    this.executing.set(true);
    this.lastResponse.set({ actionId: action.id, status: 'success', data: null });

    try {
      // Build FormFields object from current field values + metadata
      const formFields: Record<string, unknown> = {};
      for (const field of this.fields()) {
        formFields[field.label || field.id] = this.fieldValues()[field.id] ?? '';
      }

      // Build API proxy objects (same as workflow scripts)
      const apiProxies = this.buildScriptApiProxies();

      const args: Record<string, unknown> = {
        FormFields: formFields,
        ...apiProxies,
      };

      const argNames = Object.keys(args);
      const argValues = argNames.map(n => args[n]);

      // eslint-disable-next-line no-new-func
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction(...argNames, code);
      const result = await fn(...argValues);

      this.lastResponse.set({ actionId: action.id, status: 'success', data: result });
    } catch (err: unknown) {
      let errorData: unknown;
      if (err && typeof err === 'object' && 'error' in err) {
        errorData = (err as { error: unknown }).error;
      } else if (err instanceof Error) {
        errorData = err.message;
      } else {
        errorData = err;
      }
      this.lastResponse.set({ actionId: action.id, status: 'error', data: errorData });
    } finally {
      this.executing.set(false);
    }
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

  private async callProxyApi(
    apiPrefix: string, pathTemplate: string,
    httpMethod: 'get' | 'post' | 'put' | 'patch' | 'delete',
    pathParams: Record<string, string>,
    body: Record<string, unknown> | undefined,
  ): Promise<unknown> {
    let res: unknown;
    if (httpMethod === 'get' || httpMethod === 'delete') {
      res = await firstValueFrom(this.api[httpMethod](apiPrefix, pathTemplate, pathParams));
    } else {
      const call = ({ post: this.api.post, put: this.api.put, patch: this.api.patch } as Record<string, typeof this.api.post>)[httpMethod] ?? this.api.post;
      res = await firstValueFrom(call.call(this.api, apiPrefix, pathTemplate, pathParams, body ?? {}));
    }
    return this.unwrapProxyResponse(res);
  }

  /** Auto-unwrap common wrapper objects so scripts get arrays directly */
  private unwrapProxyResponse(res: unknown): unknown {
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
      const obj = res as Record<string, unknown>;
      for (const key of ['data', 'records', 'items', 'result']) {
        if (Array.isArray(obj[key])) return obj[key];
      }
      const firstArr = Object.values(obj).find(v => Array.isArray(v));
      if (firstArr) return firstArr;
    }
    return res;
  }

  private buildRequestBody(action: FormSubmitAction): unknown {
    const mode = this.getBodyMode(action);
    const values = this.fieldValues();
    const isEmptyDefault = (action.rawBody ?? '{}').trim() === '{}' && action.bodyKeys.length === 0;

    if (mode === 'fields' || isEmptyDefault) {
      return this.buildFieldsBody(action, values);
    }

    const raw = action.rawBody ?? '{}';
    const resolved = this.resolveFieldRefs(raw, values);
    return this.parseJsonWithFixup(resolved, mode);
  }

  private buildFieldsBody(action: FormSubmitAction, values: Record<string, unknown>): Record<string, unknown> {
    if (action.bodyKeys.length > 0) {
      return this.buildFromBodyKeys(action, values);
    }
    return this.buildFromFormFields(values);
  }

  private buildFromBodyKeys(action: FormSubmitAction, values: Record<string, unknown>): Record<string, unknown> {
    const body: Record<string, unknown> = {};
    for (const key of action.bodyKeys) {
      const src = action.bodySources[key];
      if (!src || src.type === 'hardcoded') {
        const raw = src?.type === 'hardcoded' ? src.value : '';
        body[key] = this.resolveFieldRefs(raw, values);
      } else {
        body[key] = values[src.fieldId] ?? '';
      }
    }
    return body;
  }

  private buildFromFormFields(values: Record<string, unknown>): Record<string, unknown> {
    const body: Record<string, unknown> = {};
    for (const field of this.fields()) {
      const val = values[field.id];
      if (val !== undefined && val !== '') {
        body[field.label || field.id] = val;
      }
    }
    return body;
  }

  private parseJsonWithFixup(resolved: string, mode: string): unknown {
    try {
      return JSON.parse(resolved);
    } catch {
      try {
        const fixed = resolved.replaceAll(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g, '$1"$2":');
        return JSON.parse(fixed);
      } catch {
        console.warn(`[FormBuilder] Invalid JSON in ${mode} body:`, resolved);
        return {};
      }
    }
  }

  private resolveFieldRefs(template: string, values: Record<string, unknown>): string {
    return template.replaceAll(/\{\{field\.([^}]+)\}\}/g, (_match, fieldId) => {
      return this.safeStr(values[fieldId]);
    });
  }

  formatJson(data: unknown): string {
    if (data == null) return '';
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return this.safeStr(data);
    }
  }

  // ── Autocomplete for {{field.xxx}} references ─────────────────────────────

  readonly acSuggestions = signal<{ label: string; insertText: string; detail: string; icon: string }[]>([]);
  readonly acIndex = signal(0);
  readonly acStyle = signal<Record<string, string>>({});
  private acInput: HTMLInputElement | HTMLTextAreaElement | null = null;
  private acCallback: ((value: string) => void) | null = null;
  private rawBodyTimer: ReturnType<typeof setTimeout> | null = null;
  private scriptFieldTimer: ReturnType<typeof setTimeout> | null = null;
  private scriptActionTimer: ReturnType<typeof setTimeout> | null = null;

  /** Debounced setRawBody to prevent Angular change detection from resetting textarea cursor */
  private setRawBodyDebounced(actionId: string, value: string) {
    if (this.rawBodyTimer) clearTimeout(this.rawBodyTimer);
    this.rawBodyTimer = setTimeout(() => this.setRawBody(actionId, value), 400);
  }

  private buildFieldSuggestions(filter: string): { label: string; insertText: string; detail: string; icon: string }[] {
    const suggestions: { label: string; insertText: string; detail: string; icon: string }[] = [];
    const values = this.fieldValues();
    for (const f of this.fields()) {
      const ref = `{{field.${f.id}}}`;
      const label = f.label || f.kind;
      const matchesFilter = !filter
        || ref.toLowerCase().includes(filter)
        || label.toLowerCase().includes(filter)
        || f.id.toLowerCase().includes(filter);
      if (matchesFilter) {
        const val = values[f.id];
        const preview = val !== undefined && val !== '' ? ` = "${this.safeStr(val).slice(0, 30)}"` : '';
        suggestions.push({
          label: `field.${f.id}`,
          insertText: ref,
          detail: `${label} (${f.kind})${preview}`,
          icon: this.getFieldIcon(f.kind),
        });
      }
      // For datatable fields, also offer column-level refs: {{field.tableId.colName}}
      if (f.kind === 'datatable' && f.columns) {
        for (const col of f.columns.split(',').map(c => c.trim()).filter(Boolean)) {
          const colRef = `{{field.${f.id}.${col}}}`;
          const colLabel = `${label} → ${col}`;
          const colMatchesFilter = !filter
            || colRef.toLowerCase().includes(filter)
            || colLabel.toLowerCase().includes(filter)
            || col.toLowerCase().includes(filter);
          if (colMatchesFilter) {
            const colVal = values[`${f.id}.${col}`];
            const colPreview = colVal !== undefined && colVal !== '' ? ` = "${this.safeStr(colVal).slice(0, 30)}"` : '';
            suggestions.push({
              label: `field.${f.id}.${col}`,
              insertText: colRef,
              detail: `${colLabel}${colPreview}`,
              icon: 'view_column',
            });
          }
        }
      }
    }
    return suggestions;
  }

  private checkFieldRefTrigger(input: HTMLInputElement | HTMLTextAreaElement): boolean {
    const pos = input.selectionStart ?? 0;
    const before = input.value.substring(0, pos);

    if (before.endsWith('{{')) {
      this.acSuggestions.set(this.buildFieldSuggestions(''));
      this.acIndex.set(0);
      return true;
    }

    const openIdx = before.lastIndexOf('{{');
    const closeIdx = before.lastIndexOf('}}');
    if (openIdx > closeIdx && openIdx >= 0) {
      const partial = before.substring(openIdx + 2).toLowerCase();
      this.acSuggestions.set(this.buildFieldSuggestions(partial));
      this.acIndex.set(0);
      return true;
    }

    return false;
  }

  private updateAcPosition() {
    if (!this.acInput) return;
    const rect = this.acInput.getBoundingClientRect();

    let top = rect.bottom + 4;
    // For textareas: position near cursor line instead of below the entire element
    if (this.acInput instanceof HTMLTextAreaElement) {
      const ta = this.acInput;
      const pos = ta.selectionStart ?? 0;
      const textBefore = ta.value.substring(0, pos);
      const lineNumber = textBefore.split('\n').length;
      const lineHeight = Number.parseFloat(getComputedStyle(ta).lineHeight) || 18;
      const paddingTop = Number.parseFloat(getComputedStyle(ta).paddingTop) || 8;
      top = rect.top + paddingTop + lineNumber * lineHeight + 4;
    }

    const maxTop = window.innerHeight - 260;
    if (top > maxTop) top = maxTop;

    this.acStyle.set({
      top: top + 'px',
      left: rect.left + 'px',
      width: Math.max(rect.width, 260) + 'px',
    });
  }

  onAcInput(input: HTMLInputElement, callback: (value: string) => void) {
    this.acInput = input;
    this.acCallback = callback;
    callback(input.value);
    this.updateAcPosition();
    if (!this.checkFieldRefTrigger(input)) {
      this.acSuggestions.set([]);
    }
  }

  onAcTextareaInput(textarea: HTMLTextAreaElement, actionId: string) {
    this.acInput = textarea;
    this.acCallback = (v: string) => this.setRawBody(actionId, v);

    // Save cursor position BEFORE updating the signal (Angular re-render resets cursor)
    const cursorPos = textarea.selectionStart ?? 0;
    const textBefore = textarea.value.substring(0, cursorPos);

    // Debounce the signal update to prevent textarea flicker during typing
    this.setRawBodyDebounced(actionId, textarea.value);
    this.updateAcPosition();

    if (!this.checkFieldRefTrigger(textarea)) {
      // Try JSON field suggestions when typing a key
      const lineStart = textBefore.lastIndexOf('\n') + 1;
      const line = textBefore.substring(lineStart).trimStart();

      if (line.startsWith('"') && !line.includes(':')) {
        const partial = line.substring(1).replace(/"$/, '');
        const suggestions = this.buildJsonFieldSuggestions(actionId, partial);
        if (suggestions.length > 0) {
          this.acSuggestions.set(suggestions);
          this.acIndex.set(0);
          return;
        }
      }
      this.acSuggestions.set([]);
    }
  }

  private buildJsonFieldSuggestions(actionId: string, filter: string): { label: string; insertText: string; detail: string; icon: string }[] {
    const action = this.submitActions().find(a => a.id === actionId);
    if (!action) return [];
    const mod = MODULES.find(m => m.apiPrefix === action.moduleApiPrefix);
    const ep = mod?.endpoints.find(e => e.pathTemplate === action.pathTemplate && e.method === action.method);
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

  onAcKeydown(event: KeyboardEvent) {
    const list = this.acSuggestions();
    if (list.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.acIndex.update(i => Math.min(i + 1, list.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.acIndex.update(i => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      this.insertAcSuggestion(list[this.acIndex()]);
    } else if (event.key === 'Escape') {
      this.acSuggestions.set([]);
    }
  }

  insertAcSuggestion(suggestion: { insertText: string }, event?: MouseEvent) {
    if (this.scriptAcMode) { this.insertScriptSuggestion(suggestion, event); return; }
    if (event) event.preventDefault();
    const input = this.acInput;
    if (!input) { this.acSuggestions.set([]); return; }

    const pos = input.selectionStart ?? 0;
    const text = input.value;
    const before = text.substring(0, pos);
    const openIdx = before.lastIndexOf('{{');

    if (openIdx >= 0 && !before.substring(openIdx).includes('}}')) {
      // {{ reference insertion
      const after = text.substring(pos);
      const closeMatch = /^[^}]*}}/.exec(after);
      const replaceEnd = closeMatch ? pos + closeMatch[0].length : pos;
      const newText = text.substring(0, openIdx) + suggestion.insertText + text.substring(replaceEnd);
      input.value = newText;
      const cursorPos = openIdx + suggestion.insertText.length;
      input.setSelectionRange(cursorPos, cursorPos);
    } else if (suggestion.insertText.startsWith('"') && suggestion.insertText.includes(':')) {
      // JSON field insertion — replace the current line from the opening quote
      const lineStart = before.lastIndexOf('\n') + 1;
      const indent = /^(\s*)/.exec(before.substring(lineStart))?.[1] ?? '';
      const quoteStart = before.lastIndexOf('"', pos - 1);
      const after = text.substring(pos);
      const lineEnd = after.indexOf('\n');
      const replaceEnd = lineEnd >= 0 ? pos + lineEnd : text.length;
      const insertStart = quoteStart >= lineStart ? quoteStart : lineStart + indent.length;
      const newText = text.substring(0, insertStart) + suggestion.insertText + text.substring(replaceEnd);
      input.value = newText;
      const cursorPos = insertStart + suggestion.insertText.length;
      input.setSelectionRange(cursorPos, cursorPos);
    }

    if (this.acCallback) this.acCallback(input.value);
    this.acSuggestions.set([]);
    input.focus();
  }

  closeAc() {
    setTimeout(() => { this.acSuggestions.set([]); this.acInput = null; this.scriptAcMode = false; }, 150);
  }

  // ── Script IntelliSense ───────────────────────────────────────────────────

  /** Whether the current autocomplete is for script insertion (vs {{field}} refs) */
  private scriptAcMode = false;

  /** Build suggestions for the current word under the cursor inside a script textarea */
  private buildScriptSuggestions(code: string, cursorPos: number, includeFormFields: boolean): { label: string; insertText: string; detail: string; icon: string }[] {
    const before = code.substring(0, cursorPos);
    const suggestions: { label: string; insertText: string; detail: string; icon: string }[] = [];

    // Check if we're after "ModuleName." — suggest methods
    const dotMatch = /(\w+)\.(\w*)$/.exec(before);
    if (dotMatch) {
      const moduleName = dotMatch[1];
      const partial = dotMatch[2].toLowerCase();

      // FormFields dot access
      if (moduleName === 'FormFields' && includeFormFields) {
        for (const f of this.fields()) {
          const key = f.label || f.id;
          if (!partial || key.toLowerCase().includes(partial)) {
            suggestions.push({ label: key, insertText: key, detail: `${f.kind} field`, icon: this.getFieldIcon(f.kind) });
          }
        }
        return suggestions.slice(0, 20);
      }

      // API module methods
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
        return suggestions.slice(0, 30);
      }
      return [];
    }

    // Not after a dot — suggest module names, FormFields, keywords
    const wordMatch = /(\w+)$/.exec(before);
    const partial = wordMatch ? wordMatch[1].toLowerCase() : '';
    if (!partial) return [];

    // Keywords
    for (const kw of ['await', 'return', 'const', 'let', 'if', 'else', 'for', 'of', 'true', 'false', 'null']) {
      if (kw.includes(partial) && kw !== partial) {
        suggestions.push({ label: kw, insertText: kw, detail: 'keyword', icon: 'code' });
      }
    }

    // API module names
    for (const mod of MODULES) {
      const name = mod.label.split(/\s+/).join('');
      if (name.toLowerCase().includes(partial)) {
        const count = mod.endpoints.length;
        suggestions.push({ label: name, insertText: name, detail: `${count} endpoints`, icon: 'api' });
      }
    }

    // FormFields (action scripts only)
    if (includeFormFields && 'formfields'.includes(partial)) {
      const count = this.fields().length;
      suggestions.push({ label: 'FormFields', insertText: 'FormFields', detail: `${count} fields`, icon: 'dynamic_form' });
    }

    return suggestions.slice(0, 20);
  }

  /** Handle input in a field-data-source script textarea */
  onFieldScriptInput(textarea: HTMLTextAreaElement, fieldId: string) {
    this.acInput = textarea;
    this.acCallback = null;
    this.scriptAcMode = true;
    if (this.scriptFieldTimer) clearTimeout(this.scriptFieldTimer);
    this.scriptFieldTimer = setTimeout(() => this.updateField(fieldId, 'scriptCode', textarea.value), 400);
    this.updateAcPosition();
    const pos = textarea.selectionStart ?? 0;
    const suggestions = this.buildScriptSuggestions(textarea.value, pos, false);
    this.acSuggestions.set(suggestions);
    this.acIndex.set(0);
  }

  /** Handle input in an action script textarea */
  onActionScriptInput(textarea: HTMLTextAreaElement, actionId: string) {
    this.acInput = textarea;
    this.acCallback = null;
    this.scriptAcMode = true;
    if (this.scriptActionTimer) clearTimeout(this.scriptActionTimer);
    this.scriptActionTimer = setTimeout(() => this.updateAction(actionId, 'scriptCode', textarea.value), 400);
    this.updateAcPosition();
    const pos = textarea.selectionStart ?? 0;
    const suggestions = this.buildScriptSuggestions(textarea.value, pos, true);
    this.acSuggestions.set(suggestions);
    this.acIndex.set(0);
  }

  /** Handle keydown for script textareas — reuse same keys as existing AC */
  onScriptKeydown(event: KeyboardEvent) {
    const list = this.acSuggestions();
    if (list.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.acIndex.update(i => Math.min(i + 1, list.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.acIndex.update(i => Math.max(i - 1, 0));
    } else if (event.key === 'Tab' || (event.key === 'Enter' && list.length > 0)) {
      event.preventDefault();
      this.insertScriptSuggestion(list[this.acIndex()]);
    } else if (event.key === 'Escape') {
      this.acSuggestions.set([]);
    }
  }

  /** Insert a script suggestion — replaces the partial word before cursor */
  insertScriptSuggestion(suggestion: { insertText: string }, event?: MouseEvent) {
    if (event) event.preventDefault();
    const input = this.acInput;
    if (!input) { this.acSuggestions.set([]); return; }

    const pos = input.selectionStart ?? 0;
    const text = input.value;
    const before = text.substring(0, pos);
    const after = text.substring(pos);

    // Find the partial to replace — either "Module.partial" or "partial"
    const dotMatch = /(\w+)\.(\w*)$/.exec(before);
    let replaceStart: number;
    let insertText: string;
    if (dotMatch) {
      // Replace just the part after the dot
      replaceStart = pos - dotMatch[2].length;
      insertText = suggestion.insertText;
    } else {
      const wordMatch = /(\w+)$/.exec(before);
      replaceStart = wordMatch ? pos - wordMatch[1].length : pos;
      insertText = suggestion.insertText;
    }

    const newText = text.substring(0, replaceStart) + insertText + after;
    input.value = newText;
    const cursorPos = replaceStart + insertText.length;
    input.setSelectionRange(cursorPos, cursorPos);

    this.acSuggestions.set([]);
    input.focus();
  }

  acSetHardcoded(actionId: string, key: string, value: string) {
    this.setBodyHardcoded(actionId, key, value);
  }

  // ── Share ─────────────────────────────────────────────────────────────────

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

  async shareForm() {
    const id = this.formId();
    if (!id) return;
    try {
      const emails = this.selectedShareUsers();
      const links = await this.shareSvc.createShare('form', id, emails.length > 0 ? emails : undefined);
      if (links.length > 0) {
        const url = this.shareSvc.getShareUrl(links[0].token);
        this.shareUrl.set(url);
        await this.clipboardCopy(url);
      }
    } catch { /* ignore */ }
  }

  async copyShareUrl() {
    const url = this.shareUrl();
    if (url) await this.clipboardCopy(url);
  }

  private async clipboardCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
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
}
