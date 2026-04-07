import {
  Component, OnInit, signal, computed, inject, ViewChild, ElementRef,
  ChangeDetectorRef, HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  CdkDragDrop, DragDropModule, moveItemInArray,
} from '@angular/cdk/drag-drop';

import { MODULES, ModuleDef, EndpointDef, extractPathParams } from '../../config/endpoints';
import { getEndpointPayload } from '../../config/endpoint-payloads';
import { getEndpointInputSchema, getEndpointOutputSchema, getEndpointOutputLabel, flattenSchemaKeys } from '../../config/endpoint-schemas';
import { WorkflowService } from '../../services/workflow.service';
import { ShareService } from '../../services/share.service';
import {
  Workflow, WorkflowNode, WorkflowStep, TryCatchBlock, LoopBlock, LoopMode, IfElseBlock, MapperBlock, FilterBlock, SubWorkflowBlock, WorkflowInput, WorkflowOutput, FieldMapping, PayloadSource, StepKind, BodyMode,
} from '../../config/workflow.types';
import { FormViewComponent, StepRefSuggestion } from '../../shared/form-view/form-view.component';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { SchemaService, FieldSchema } from '../../services/schema.service';

interface AutocompleteSuggestion {
  label: string;       // Display label
  insertText: string;  // Text to insert
  detail: string;      // Category/description
  icon: string;        // Material icon name
  typeHint?: 'array' | 'object' | 'string' | 'number' | 'boolean';  // Resolved type from last run
}

interface EndpointRef { module: ModuleDef; endpoint: EndpointDef; }
interface ControlFlowRef { kind: 'try-catch' | 'loop' | 'if-else' | 'mapper' | 'filter' | 'sub-workflow'; label: string; icon: string; color: string; }

@Component({
  selector: 'app-workflow-builder',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatTooltipModule, MatChipsModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatDividerModule, MatRadioModule,
    DragDropModule, FormViewComponent, MatButtonToggleModule,
    TranslatePipe,
  ],
  template: `
    <!-- ── Top bar ──────────────────────────────────────────────────────── -->
    <div class="topbar">
      <button mat-icon-button routerLink="/workflows" matTooltip="{{ 'workflow.back-to-workflows' | t }}">
        <mat-icon>arrow_back</mat-icon>
      </button>

      <mat-form-field appearance="outline" class="name-field" subscriptSizing="dynamic">
        <mat-label>{{ 'workflow.name-input' | t }}</mat-label>
        <mat-icon matPrefix>account_tree</mat-icon>
        <input matInput [(ngModel)]="wfName" placeholder="My workflow" />
      </mat-form-field>

      <div class="topbar-actions">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="schedule-field">
          <mat-label>{{ 'workflow.schedule-at' | t }}</mat-label>
          <mat-icon matPrefix>schedule</mat-icon>
          <input matInput type="datetime-local"
                 [value]="scheduledAt"
                 (input)="scheduledAt = $any($event.target).value"
                 (change)="scheduledAt = $any($event.target).value" />
          @if (scheduledAt) {
            <button matSuffix mat-icon-button (click)="scheduledAt = ''" matTooltip="{{ 'workflow.clear-schedule' | t }}">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
        <button mat-stroked-button (click)="save()">
          <mat-icon>save</mat-icon> {{ 'workflow.save' | t }}
        </button>
        <button mat-stroked-button (click)="ioPanelOpen.update(v => !v)"
                [class.active-io]="ioPanelOpen()"
                matTooltip="{{ 'workflow.io-config' | t }}">
          <mat-icon>{{ ioPanelOpen() ? 'expand_less' : 'settings_input_component' }}</mat-icon>
          {{ 'workflow.io' | t }}
        </button>
        <button mat-flat-button color="primary"
                (click)="runNow()"
                [disabled]="steps().length === 0 || running()">
          @if (running()) { <mat-spinner diameter="16" /> }
          @else { <mat-icon>play_arrow</mat-icon> }
          {{ 'workflow.run-now' | t }}
        </button>
        @if (runLog()) {
          <button mat-stroked-button class="results-btn" (click)="resultPanelOpen.update(v => !v)">
            <mat-icon>{{ resultPanelOpen() ? 'expand_more' : 'expand_less' }}</mat-icon>
            {{ 'workflow.results' | t }}
          </button>
        }
        <button mat-stroked-button (click)="shareWorkflow()" [disabled]="!hasWorkflowId()">
          <mat-icon>{{ shareUrl() ? 'link' : 'share' }}</mat-icon> {{ 'workflow.share' | t }}
        </button>
        @if (shareUrl()) {
          <div class="share-url-chip" (click)="copyShareUrl()">
            <mat-icon>content_copy</mat-icon>
            <span>{{ shareUrl() }}</span>
          </div>
        }
      </div>
    </div>

    <!-- ── I/O Configuration Panel ──────────────────────────────────── -->
    @if (ioPanelOpen()) {
      <div class="io-panel">
        <div class="io-section">
          <div class="io-section-header">
            <mat-icon>input</mat-icon>
            <span>{{ 'workflow.inputs' | t }}</span>
            <button mat-icon-button (click)="addInput()" matTooltip="{{ 'workflow.add-input' | t }}">
              <mat-icon>add_circle_outline</mat-icon>
            </button>
          </div>
          @for (inp of wfInputs(); track inp.name; let i = $index) {
            <div class="io-row">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="io-name-field">
                <mat-label>{{ 'workflow.input-name' | t }}</mat-label>
                <input matInput [value]="inp.name"
                       (input)="updateInput(i, 'name', $any($event.target).value)" placeholder="e.g. contactId" />
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="io-default-field">
                <mat-label>{{ 'workflow.default-value' | t }}</mat-label>
                <input matInput [value]="inp.defaultValue ?? ''"
                       (input)="updateInput(i, 'defaultValue', $any($event.target).value)" />
              </mat-form-field>
              <button mat-icon-button color="warn" (click)="removeInput(i)">
                <mat-icon>remove_circle_outline</mat-icon>
              </button>
            </div>
          }
          @if (wfInputs().length === 0) {
            <p class="io-empty">{{ 'workflow.no-inputs' | t }}</p>
          }
        </div>
        <div class="io-divider"></div>
        <div class="io-section">
          <div class="io-section-header">
            <mat-icon>output</mat-icon>
            <span>{{ 'workflow.outputs' | t }}</span>
            <button mat-icon-button (click)="addOutput()" matTooltip="{{ 'workflow.add-output' | t }}">
              <mat-icon>add_circle_outline</mat-icon>
            </button>
          </div>
          @for (out of wfOutputs(); track out.name; let i = $index) {
            <div class="io-row">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="io-name-field">
                <mat-label>{{ 'workflow.output-name' | t }}</mat-label>
                <input matInput [value]="out.name"
                       (input)="updateOutput(i, 'name', $any($event.target).value)" placeholder="e.g. result" />
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="io-step-field">
                <mat-label>{{ 'workflow.source-step' | t }}</mat-label>
                <mat-select [value]="out.source.type === 'from-step' ? out.source.stepId : ''"
                            (selectionChange)="setOutputSourceStep(i, $event.value)">
                  @for (s of steps(); track s.id; let si = $index) {
                    <mat-option [value]="s.id">Step {{ si + 1 }}: {{ getStepLabel(s) }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="io-field-field">
                <mat-label>{{ 'workflow.source-field' | t }}</mat-label>
                <input matInput [value]="out.source.type === 'from-step' ? out.source.field : ''"
                       (input)="setOutputSourceField(i, $any($event.target).value)" placeholder="e.g. data.id" />
              </mat-form-field>
              <button mat-icon-button color="warn" (click)="removeOutput(i)">
                <mat-icon>remove_circle_outline</mat-icon>
              </button>
            </div>
          }
          @if (wfOutputs().length === 0) {
            <p class="io-empty">{{ 'workflow.no-outputs' | t }}</p>
          }
        </div>
      </div>
    }

    <!-- ── Three-panel layout ────────────────────────────────────────────── -->
    <div class="builder-layout">

      <!-- LEFT: endpoint browser ─────────────────────────────────────────── -->
      <div class="browser-panel">
        <div class="browser-header">
          <mat-icon>api</mat-icon>
          <span>{{ 'workflow.endpoints' | t }}</span>
        </div>
        <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="browserSearch" placeholder="{{ 'workflow.search-endpoints' | t }}" />
          @if (browserSearch) {
            <button matSuffix mat-icon-button (click)="browserSearch = ''">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <!-- Control flow section -->
        <div class="cf-section">
          <div class="cf-section-label">
            <mat-icon>device_hub</mat-icon>
            <span>{{ 'workflow.control-flow' | t }}</span>
          </div>
          <div class="cf-list"
               cdkDropList
               id="controlFlowList"
               [cdkDropListData]="controlFlowItems"
               [cdkDropListConnectedTo]="allBranchDropIds()"
               [cdkDropListSortingDisabled]="true"
               (cdkDropListDropped)="onBrowserDrop($event)">
            @for (item of controlFlowItems; track item.kind) {
              <div class="cf-item"
                   cdkDrag
                   [cdkDragData]="item">
                <div class="cf-item-inner" [style.border-left-color]="item.color">
                  <mat-icon [style.color]="item.color">{{ item.icon }}</mat-icon>
                  <span>{{ item.label }}</span>
                  <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                </div>
                <div *cdkDragPreview class="drag-preview">
                  <mat-icon [style.color]="item.color" style="font-size:14px;width:14px;height:14px;">{{ item.icon }}</mat-icon>
                  {{ item.label }}
                </div>
                <div *cdkDragPlaceholder class="drag-placeholder-browser"></div>
              </div>
            }
          </div>
        </div>

        <div class="module-list"
             cdkDropList
             #browserList="cdkDropList"
             [cdkDropListData]="flatEndpoints()"
             [cdkDropListConnectedTo]="allBranchDropIds()"
             [cdkDropListSortingDisabled]="true"
             (cdkDropListDropped)="onBrowserDrop($event)">

          @for (group of groupedEndpoints(); track group.module.id) {
            <div class="module-group">
              <button class="module-toggle"
                      (click)="toggleModule(group.module.id)">
                <mat-icon>{{ group.module.icon }}</mat-icon>
                <span>{{ group.module.label }}</span>
                <mat-icon class="chevron">
                  {{ expandedModules().has(group.module.id) ? 'expand_less' : 'expand_more' }}
                </mat-icon>
              </button>

              @if (expandedModules().has(group.module.id)) {
                @for (ref of group.endpoints; track ref.endpoint.id) {
                  <div class="ep-item"
                       cdkDrag
                       [cdkDragData]="ref">
                    <div class="ep-item-content">
                      <span class="method-badge method-{{ ref.endpoint.method.toLowerCase() }}">
                        {{ ref.endpoint.method }}
                      </span>
                      <span class="ep-name">{{ ref.endpoint.label }}</span>
                      <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                    </div>
                    <!-- drag preview -->
                    <div *cdkDragPreview class="drag-preview">
                      <span class="method-badge method-{{ ref.endpoint.method.toLowerCase() }}">
                        {{ ref.endpoint.method }}
                      </span>
                      {{ ref.endpoint.label }}
                    </div>
                    <!-- placeholder -->
                    <div *cdkDragPlaceholder class="drag-placeholder-browser"></div>
                  </div>
                }
              }
            </div>
          }
        </div>
      </div>

      <!-- CENTER: canvas ──────────────────────────────────────────────────── -->
      <div class="canvas-panel" cdkDropListGroup>
        <div class="canvas-header">
          <mat-icon>account_tree</mat-icon>
          <span>{{ 'workflow.workflow-steps' | t }}</span>
          @if (steps().length > 0) {
            <span class="step-count">{{ steps().length }}</span>
          }
        </div>

        @if (steps().length === 0) {
          <div class="canvas-empty"
               cdkDropList
               id="workflowCanvas"
               [cdkDropListData]="steps()"
               [cdkDropListConnectedTo]="['browserList', 'controlFlowList']"
               (cdkDropListDropped)="onCanvasDrop($event)">
            <mat-icon>drag_indicator</mat-icon>
            <p>{{ 'workflow.drag-hint' | t }}</p>
          </div>
        } @else {
          <div class="step-list"
               cdkDropList
               id="workflowCanvas"
               [cdkDropListData]="steps()"
               [cdkDropListConnectedTo]="['browserList', 'controlFlowList']"
               (cdkDropListDropped)="onCanvasDrop($event)">
            @for (node of steps(); track node.id; let i = $index) {
              <div class="step-card"
                   [class.step-card--selected]="selectedStepId() === node.id"
                   [class.step-card--block]="node.kind !== 'endpoint'"
                   cdkDrag
                   [cdkDragData]="node">

                <!-- ── ENDPOINT STEP ── -->
                @if (node.kind === 'endpoint') {
                  @let step = asEndpoint(node);
                  <div class="step-card-inner" (click)="selectStep(node.id)">
                    <div class="step-num">{{ i + 1 }}</div>
                    <div class="step-info">
                      <div class="step-header-row">
                        <span class="method-badge method-{{ step.method.toLowerCase() }}">
                          {{ step.method }}
                        </span>
                        <span class="step-label">{{ step.endpointLabel }}</span>
                      </div>
                      <div class="step-sub">
                        <span class="step-module">{{ step.moduleLabel }}</span>
                        <code class="step-path">{{ step.pathTemplate }}</code>
                      </div>
                      @if (step.pathParamNames.length > 0 || step.bodyKeys.length > 0 || step.bodyMode === 'text' || step.bodyMode === 'form') {
                        <div class="step-config-summary">
                          @for (p of step.pathParamNames; track p) {
                            <span class="cfg-chip" [class.cfg-chip--set]="step.paramSources[p]?.type === 'hardcoded' ? $any(step.paramSources[p])?.value : true">
                              :{{ p }}={{ getSourceSummary(step, p, 'param') }}
                            </span>
                          }
                          @if (step.bodyMode === 'text') {
                            <span class="cfg-chip cfg-chip--body">{{ 'workflow.body-raw-json' | t }}</span>
                          } @else if (step.bodyMode === 'form') {
                            <span class="cfg-chip cfg-chip--body">{{ 'workflow.body-form' | t }}</span>
                          } @else {
                            @for (k of step.bodyKeys; track k) {
                              <span class="cfg-chip cfg-chip--body">
                                {{ k }}={{ getSourceSummary(step, k, 'body') }}
                              </span>
                            }
                          }
                        </div>
                      }
                    </div>
                    <div class="step-card-actions" (click)="$event.stopPropagation()">
                      <button mat-icon-button (click)="selectStep(node.id)" matTooltip="{{ 'workflow.configure-step' | t }}">
                        <mat-icon>settings</mat-icon>
                      </button>
                      <button mat-icon-button (click)="removeStep(node.id)" color="warn" matTooltip="{{ 'workflow.remove-step' | t }}">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                      <mat-icon class="drag-handle" cdkDragHandle matTooltip="{{ 'workflow.drag-reorder' | t }}">drag_indicator</mat-icon>
                    </div>
                  </div>
                }

                <!-- ── TRY / CATCH BLOCK ── -->
                @if (node.kind === 'try-catch') {
                  @let block = asTryCatch(node);
                  <div class="block-card block-card--try" (click)="selectStep(node.id)">
                    <div class="block-header">
                      <mat-icon class="block-icon">shield</mat-icon>
                      <span class="block-title">{{ block.label || ('workflow.try-catch' | t) }}</span>
                      <span class="block-badge">try·catch</span>
                      <div class="step-card-actions" (click)="$event.stopPropagation()">
                        <button mat-icon-button (click)="selectStep(node.id)" matTooltip="{{ 'workflow.configure-step' | t }}">
                          <mat-icon>settings</mat-icon>
                        </button>
                        <button mat-icon-button (click)="removeStep(node.id)" color="warn" matTooltip="{{ 'workflow.remove-step' | t }}">
                          <mat-icon>delete_outline</mat-icon>
                        </button>
                        <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                      </div>
                    </div>
                    <div class="block-branches-expanded" (click)="$event.stopPropagation()">
                      <!-- TRY zone -->
                      <div class="branch-col branch-col--try">
                        <div class="branch-col-header">
                          <span class="branch-label">{{ 'workflow.try-label' | t }}</span>
                          <span class="branch-count">{{ block.trySteps.length }}</span>
                        </div>
                        <div class="branch-drop"
                             cdkDropList
                             [id]="'block-' + block.id + '-try'"
                             [cdkDropListData]="block.trySteps"
                             [cdkDropListConnectedTo]="['browserList', 'controlFlowList']"
                             (cdkDropListDropped)="onBranchDrop($event, block.id, 'trySteps')">
                          @for (s of block.trySteps; track s.id) {
                            <div class="inner-step" cdkDrag [cdkDragData]="s">
                              <mat-icon class="inner-step-icon">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                              <span class="inner-step-label">{{ getNodeLabel(s) }}</span>
                              <mat-icon cdkDragHandle class="drag-handle">drag_indicator</mat-icon>
                              <button mat-icon-button class="inner-remove-btn" (click)="$event.stopPropagation(); removeFromBranch(block.id, 'trySteps', s.id)" matTooltip="{{ 'workflow.remove-step' | t }}"><mat-icon>close</mat-icon></button>
                              <div *cdkDragPlaceholder class="inner-drag-placeholder"></div>
                            </div>
                          }
                          @if (block.trySteps.length === 0) {
                            <div class="branch-drop-hint">{{ 'workflow.drop-here' | t }}</div>
                          }
                        </div>
                      </div>
                      <!-- CATCH zone -->
                      <div class="branch-col branch-col--catch">
                        <div class="branch-col-header">
                          <span class="branch-label">{{ 'workflow.catch-label' | t }}</span>
                          <span class="branch-count">{{ block.catchSteps.length }}</span>
                        </div>
                        <div class="branch-drop"
                             cdkDropList
                             [id]="'block-' + block.id + '-catch'"
                             [cdkDropListData]="block.catchSteps"
                             [cdkDropListConnectedTo]="['browserList', 'controlFlowList']"
                             (cdkDropListDropped)="onBranchDrop($event, block.id, 'catchSteps')">
                          @for (s of block.catchSteps; track s.id) {
                            <div class="inner-step" cdkDrag [cdkDragData]="s">
                              <mat-icon class="inner-step-icon">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                              <span class="inner-step-label">{{ getNodeLabel(s) }}</span>
                              <mat-icon cdkDragHandle class="drag-handle">drag_indicator</mat-icon>
                              <button mat-icon-button class="inner-remove-btn" (click)="$event.stopPropagation(); removeFromBranch(block.id, 'catchSteps', s.id)" matTooltip="{{ 'workflow.remove-step' | t }}"><mat-icon>close</mat-icon></button>
                              <div *cdkDragPlaceholder class="inner-drag-placeholder"></div>
                            </div>
                          }
                          @if (block.catchSteps.length === 0) {
                            <div class="branch-drop-hint">{{ 'workflow.drop-here' | t }}</div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- ── LOOP BLOCK ── -->
                @if (node.kind === 'loop') {
                  @let block = asLoop(node);
                  <div class="block-card block-card--loop" (click)="selectStep(node.id)">
                    <div class="block-header">
                      <mat-icon class="block-icon">loop</mat-icon>
                      <span class="block-title">{{ block.label || ('workflow.loop' | t) }}</span>
                      <span class="block-badge">{{ (block.loopMode ?? 'count') === 'for-each' ? 'for-each' : 'loop × ' + (block.loopCount ?? 1) }}</span>
                      <div class="step-card-actions" (click)="$event.stopPropagation()">
                        <button mat-icon-button (click)="selectStep(node.id)" matTooltip="{{ 'workflow.configure-step' | t }}">
                          <mat-icon>settings</mat-icon>
                        </button>
                        <button mat-icon-button (click)="removeStep(node.id)" color="warn" matTooltip="{{ 'workflow.remove-step' | t }}">
                          <mat-icon>delete_outline</mat-icon>
                        </button>
                        <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                      </div>
                    </div>
                    <div class="block-branches-expanded" (click)="$event.stopPropagation()">
                      <!-- BODY zone -->
                      <div class="branch-col branch-col--body" style="flex:1">
                        <div class="branch-col-header">
                          <span class="branch-label">{{ 'workflow.body-label' | t }}</span>
                          <span class="branch-count">{{ block.bodySteps.length }}</span>
                        </div>
                        <div class="branch-drop"
                             cdkDropList
                             [id]="'block-' + block.id + '-body'"
                             [cdkDropListData]="block.bodySteps"
                             [cdkDropListConnectedTo]="['browserList', 'controlFlowList']"
                             (cdkDropListDropped)="onBranchDrop($event, block.id, 'bodySteps')">
                          @for (s of block.bodySteps; track s.id) {
                            <div class="inner-step" cdkDrag [cdkDragData]="s">
                              <mat-icon class="inner-step-icon">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                              <span class="inner-step-label">{{ getNodeLabel(s) }}</span>
                              <mat-icon cdkDragHandle class="drag-handle">drag_indicator</mat-icon>
                              <button mat-icon-button class="inner-remove-btn" (click)="$event.stopPropagation(); removeFromBranch(block.id, 'bodySteps', s.id)" matTooltip="{{ 'workflow.remove-step' | t }}"><mat-icon>close</mat-icon></button>
                              <div *cdkDragPlaceholder class="inner-drag-placeholder"></div>
                            </div>
                          }
                          @if (block.bodySteps.length === 0) {
                            <div class="branch-drop-hint">{{ 'workflow.drop-here' | t }}</div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- ── IF / ELSE BLOCK ── -->
                @if (node.kind === 'if-else') {
                  @let block = asIfElse(node);
                  <div class="block-card block-card--ifelse" (click)="selectStep(node.id)">
                    <div class="block-header">
                      <mat-icon class="block-icon">call_split</mat-icon>
                      <span class="block-title">{{ block.label || ('workflow.if-else' | t) }}</span>
                      <span class="block-badge">if·else</span>
                      <div class="step-card-actions" (click)="$event.stopPropagation()">
                        <button mat-icon-button (click)="selectStep(node.id)" matTooltip="{{ 'workflow.configure-step' | t }}">
                          <mat-icon>settings</mat-icon>
                        </button>
                        <button mat-icon-button (click)="removeStep(node.id)" color="warn" matTooltip="{{ 'workflow.remove-step' | t }}">
                          <mat-icon>delete_outline</mat-icon>
                        </button>
                        <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                      </div>
                    </div>
                    <div class="block-branches-expanded" (click)="$event.stopPropagation()">
                      <!-- THEN zone -->
                      <div class="branch-col branch-col--then">
                        <div class="branch-col-header">
                          <span class="branch-label">THEN</span>
                          <span class="branch-count">{{ block.thenSteps.length }}</span>
                        </div>
                        <div class="branch-drop"
                             cdkDropList
                             [id]="'block-' + block.id + '-then'"
                             [cdkDropListData]="block.thenSteps"
                             [cdkDropListConnectedTo]="['browserList', 'controlFlowList']"
                             (cdkDropListDropped)="onBranchDrop($event, block.id, 'thenSteps')">
                          @for (s of block.thenSteps; track s.id) {
                            <div class="inner-step" cdkDrag [cdkDragData]="s">
                              <mat-icon class="inner-step-icon">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                              <span class="inner-step-label">{{ getNodeLabel(s) }}</span>
                              <mat-icon cdkDragHandle class="drag-handle">drag_indicator</mat-icon>
                              <button mat-icon-button class="inner-remove-btn" (click)="$event.stopPropagation(); removeFromBranch(block.id, 'thenSteps', s.id)" matTooltip="{{ 'workflow.remove-step' | t }}"><mat-icon>close</mat-icon></button>
                              <div *cdkDragPlaceholder class="inner-drag-placeholder"></div>
                            </div>
                          }
                          @if (block.thenSteps.length === 0) {
                            <div class="branch-drop-hint">{{ 'workflow.drop-here' | t }}</div>
                          }
                        </div>
                      </div>
                      <!-- ELSE zone -->
                      <div class="branch-col branch-col--else">
                        <div class="branch-col-header">
                          <span class="branch-label">ELSE</span>
                          <span class="branch-count">{{ block.elseSteps.length }}</span>
                        </div>
                        <div class="branch-drop"
                             cdkDropList
                             [id]="'block-' + block.id + '-else'"
                             [cdkDropListData]="block.elseSteps"
                             [cdkDropListConnectedTo]="['browserList', 'controlFlowList']"
                             (cdkDropListDropped)="onBranchDrop($event, block.id, 'elseSteps')">
                          @for (s of block.elseSteps; track s.id) {
                            <div class="inner-step" cdkDrag [cdkDragData]="s">
                              <mat-icon class="inner-step-icon">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                              <span class="inner-step-label">{{ getNodeLabel(s) }}</span>
                              <mat-icon cdkDragHandle class="drag-handle">drag_indicator</mat-icon>
                              <button mat-icon-button class="inner-remove-btn" (click)="$event.stopPropagation(); removeFromBranch(block.id, 'elseSteps', s.id)" matTooltip="{{ 'workflow.remove-step' | t }}"><mat-icon>close</mat-icon></button>
                              <div *cdkDragPlaceholder class="inner-drag-placeholder"></div>
                            </div>
                          }
                          @if (block.elseSteps.length === 0) {
                            <div class="branch-drop-hint">{{ 'workflow.drop-here' | t }}</div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- ── MAPPER BLOCK ── -->
                @if (node.kind === 'mapper') {
                  @let block = asMapper(node);
                  <div class="block-card block-card--mapper" (click)="selectStep(node.id)">
                    <div class="block-header">
                      <mat-icon class="block-icon">swap_horiz</mat-icon>
                      <span class="block-title">{{ block.label || ('workflow.mapper' | t) }}</span>
                      <span class="block-badge">{{ block.mappings.length }} {{ 'workflow.mappings' | t }}</span>
                      <div class="step-card-actions" (click)="$event.stopPropagation()">
                        <button mat-icon-button (click)="selectStep(node.id)" matTooltip="{{ 'workflow.configure-step' | t }}">
                          <mat-icon>settings</mat-icon>
                        </button>
                        <button mat-icon-button (click)="removeStep(node.id)" color="warn" matTooltip="{{ 'workflow.remove-step' | t }}">
                          <mat-icon>delete_outline</mat-icon>
                        </button>
                        <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                      </div>
                    </div>
                    @if (block.mappings.length > 0) {
                      <div class="mapper-preview">
                        @for (m of block.mappings; track $index) {
                          <div class="mapper-preview-row">
                            <mat-icon class="mapper-arrow-icon">arrow_right_alt</mat-icon>
                            <span class="mapper-output-field">{{ m.outputField || '?' }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }

                <!-- ── FILTER BLOCK ── -->
                @if (node.kind === 'filter') {
                  @let block = asFilter(node);
                  <div class="block-card block-card--filter" (click)="selectStep(node.id)">
                    <div class="block-header">
                      <mat-icon class="block-icon">filter_list</mat-icon>
                      <span class="block-title">{{ block.label || ('workflow.filter' | t) }}</span>
                      <span class="block-badge">{{ block.filterField ? block.filterField + ' ' + (block.filterOperator ?? '==') + ' ' + (block.filterValue ?? '') : 'filter' }}</span>
                      <div class="step-card-actions" (click)="$event.stopPropagation()">
                        <button mat-icon-button (click)="selectStep(node.id)" matTooltip="{{ 'workflow.configure-step' | t }}">
                          <mat-icon>settings</mat-icon>
                        </button>
                        <button mat-icon-button (click)="removeStep(node.id)" color="warn" matTooltip="{{ 'workflow.remove-step' | t }}">
                          <mat-icon>delete_outline</mat-icon>
                        </button>
                        <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                      </div>
                    </div>
                  </div>
                }

                <!-- ── SUB-WORKFLOW BLOCK ── -->
                @if (node.kind === 'sub-workflow') {
                  @let block = asSubWorkflow(node);
                  <div class="block-card block-card--sub-workflow" (click)="selectStep(node.id)">
                    <div class="block-header">
                      <mat-icon class="block-icon">account_tree</mat-icon>
                      <span class="block-title">{{ block.label || block.workflowName || ('workflow.sub-workflow' | t) }}</span>
                      @if (block.workflowName) {
                        <span class="block-badge">{{ block.workflowName }}</span>
                      }
                      <div class="step-card-actions" (click)="$event.stopPropagation()">
                        <button mat-icon-button (click)="selectStep(node.id)" matTooltip="{{ 'workflow.configure-step' | t }}">
                          <mat-icon>settings</mat-icon>
                        </button>
                        <button mat-icon-button (click)="removeStep(node.id)" color="warn" matTooltip="{{ 'workflow.remove-step' | t }}">
                          <mat-icon>delete_outline</mat-icon>
                        </button>
                        <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                      </div>
                    </div>
                    @if (getSubWorkflowInputNames(block.workflowId).length > 0) {
                      <div class="sub-wf-io-preview">
                        <span class="sub-wf-io-label">
                          <mat-icon style="font-size:12px;width:12px;height:12px">input</mat-icon>
                          {{ getSubWorkflowInputNames(block.workflowId).join(', ') }}
                        </span>
                      </div>
                    }
                  </div>
                }

                <!-- DnD extras -->
                <div *cdkDragPlaceholder class="drag-placeholder-canvas"></div>

                <!-- connector line after step (not last) -->
                @if (i < steps().length - 1) {
                  <div class="connector">
                    <div class="connector-line"></div>
                    <mat-icon class="connector-arrow">arrow_downward</mat-icon>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- RIGHT: step config ──────────────────────────────────────────────── -->
      @if (selectedStep()) {
        <div class="config-panel">
          <!-- Header changes based on node kind -->
          <div class="config-header">
            @if (selectedStep()!.kind === 'endpoint') {
              <span class="method-badge method-{{ asEndpoint(selectedStep()!).method.toLowerCase() }}">
                {{ asEndpoint(selectedStep()!).method }}
              </span>
              <span class="config-title">{{ asEndpoint(selectedStep()!).endpointLabel }}</span>
            } @else if (selectedStep()!.kind === 'try-catch') {
              <mat-icon style="color:#f59e0b">shield</mat-icon>
              <span class="config-title">{{ asTryCatch(selectedStep()!).label || ('workflow.try-catch' | t) }}</span>
            } @else if (selectedStep()!.kind === 'loop') {
              <mat-icon style="color:#8b5cf6">loop</mat-icon>
              <span class="config-title">{{ asLoop(selectedStep()!).label || ('workflow.loop' | t) }}</span>
            } @else if (selectedStep()!.kind === 'if-else') {
              <mat-icon style="color:#0284c7">call_split</mat-icon>
              <span class="config-title">{{ asIfElse(selectedStep()!).label || ('workflow.if-else' | t) }}</span>
            } @else if (selectedStep()!.kind === 'mapper') {
              <mat-icon style="color:#059669">swap_horiz</mat-icon>
              <span class="config-title">{{ asMapper(selectedStep()!).label || ('workflow.mapper' | t) }}</span>
            } @else if (selectedStep()!.kind === 'filter') {
              <mat-icon style="color:#dc2626">filter_list</mat-icon>
              <span class="config-title">{{ asFilter(selectedStep()!).label || ('workflow.filter' | t) }}</span>
            } @else if (selectedStep()!.kind === 'sub-workflow') {
              <mat-icon style="color:#7c3aed">account_tree</mat-icon>
              <span class="config-title">{{ asSubWorkflow(selectedStep()!).label || ('workflow.sub-workflow' | t) }}</span>
            }
            <button mat-icon-button (click)="selectedStepId.set(null)" style="margin-left:auto">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="config-body">

            <!-- ── ENDPOINT CONFIG ─────────────────────────────────────────── -->
            @if (selectedStep()!.kind === 'endpoint') {
              @let ep = asEndpoint(selectedStep()!);

              <!-- Path parameters -->
              @if (ep.pathParamNames.length > 0) {
                <div class="config-section-label">{{ 'workflow.path-parameters' | t }}</div>
                @for (param of ep.pathParamNames; track param) {
                  <div class="field-block">
                    <div class="field-name"><mat-icon>tag</mat-icon><code>:{{ param }}</code></div>
                    <div class="source-toggle">
                      <button mat-stroked-button [class.active-source]="getParamSourceType(param) === 'hardcoded'" (click)="setParamSourceType(param, 'hardcoded')">
                        <mat-icon>text_fields</mat-icon> {{ 'workflow.hardcoded' | t }}
                      </button>
                      <button mat-stroked-button [class.active-source]="getParamSourceType(param) === 'from-step'" [disabled]="previousSteps().length === 0" (click)="setParamSourceType(param, 'from-step')" matTooltip="{{ previousSteps().length === 0 ? ('workflow.no-previous-steps' | t) : ('workflow.use-previous-step' | t) }}">
                        <mat-icon>link</mat-icon> {{ 'workflow.from-step' | t }}
                      </button>
                    </div>
                    @if (getParamSourceType(param) === 'hardcoded') {
                      <div class="ac-field-wrapper">
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                          <mat-label>{{ 'workflow.value-for-param' | t:{param: param} }}</mat-label>
                          <input matInput [value]="getParamValue(param)"
                            (input)="onAcFieldInput($any($event.target), acSetParamHardcoded.bind(this, param))"
                            (keydown)="onAcKeydown($event)"
                            (blur)="closeAutocomplete()"
                            placeholder="e.g. my-account-id … type {{ for refs" />
                        </mat-form-field>
                      </div>
                    }
                    @if (getParamSourceType(param) === 'from-step') {
                      <div class="from-step-row">
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="step-select">
                          <mat-label>{{ 'workflow.from-step' | t }}</mat-label>
                          <mat-select [value]="getParamFromStepId(param)" (selectionChange)="setParamFromStepId(param, $event.value)">
                            @for (ps of previousSteps(); track ps.id) {
                              <mat-option [value]="ps.id">{{ getStepIndex(ps.id) + 1 }}. {{ getNodeLabel(ps) }}</mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="field-input">
                          <mat-label>{{ 'workflow.field-path' | t }}</mat-label>
                          <input matInput [value]="getParamFromStepField(param)"
                            (input)="onAcFieldInput($any($event.target), acSetParamFromStepField.bind(this, param))"
                            (keydown)="onAcKeydown($event)"
                            (blur)="closeAutocomplete()"
                            placeholder="e.g. data.0.id … type {{ for refs" />
                          <mat-hint>{{ 'workflow.dot-notation-hint' | t }}</mat-hint>
                        </mat-form-field>
                      </div>
                    }
                  </div>
                }
              }

              <!-- Body fields -->
              @if (ep.hasBody) {
                <mat-divider class="section-divider" />
                <div class="config-section-label">{{ 'workflow.request-body' | t }}</div>

                <!-- Body mode toggle (Fields / Text / Form) -->
                <div class="body-mode-toggle">
                  <button mat-stroked-button [class.active-source]="getBodyMode(ep) === 'fields'" (click)="setBodyMode('fields')"
                    matTooltip="{{ 'workflow.fields-hint' | t }}">
                    <mat-icon>list</mat-icon> {{ 'workflow.fields' | t }}
                  </button>
                  <button mat-stroked-button [class.active-source]="getBodyMode(ep) === 'text'" (click)="setBodyMode('text')"
                    matTooltip="{{ 'workflow.text-hint' | t }}">
                    <mat-icon>code</mat-icon> {{ 'workflow.text' | t }}
                  </button>
                  <button mat-stroked-button [class.active-source]="getBodyMode(ep) === 'form'" (click)="setBodyMode('form')"
                    matTooltip="{{ 'workflow.form-hint' | t }}">
                    <mat-icon>dynamic_form</mat-icon> {{ 'workflow.form' | t }}
                  </button>
                </div>

                <!-- ── FIELDS MODE (original) ── -->
                @if (getBodyMode(ep) === 'fields') {
                  @for (key of ep.bodyKeys; track key) {
                    <div class="field-block">
                      <div class="field-name">
                        <mat-icon>data_object</mat-icon><code>{{ key }}</code>
                        <button mat-icon-button class="remove-key-btn" (click)="removeBodyKey(key)" matTooltip="{{ 'workflow.remove-field' | t }}"><mat-icon>remove_circle_outline</mat-icon></button>
                      </div>
                      <div class="source-toggle">
                        <button mat-stroked-button [class.active-source]="getBodySourceType(key) === 'hardcoded'" (click)="setBodySourceType(key, 'hardcoded')">
                          <mat-icon>text_fields</mat-icon> {{ 'workflow.hardcoded' | t }}
                        </button>
                        <button mat-stroked-button [class.active-source]="getBodySourceType(key) === 'from-step'" [disabled]="previousSteps().length === 0" (click)="setBodySourceType(key, 'from-step')" matTooltip="{{ previousSteps().length === 0 ? ('workflow.no-previous-steps' | t) : ('workflow.use-previous-step' | t) }}">
                          <mat-icon>link</mat-icon> {{ 'workflow.from-step' | t }}
                        </button>
                      </div>
                      @if (getBodySourceType(key) === 'hardcoded') {
                        <div class="ac-field-wrapper">
                          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                            <mat-label>{{ 'workflow.value-for-key' | t:{key: key} }}</mat-label>
                            <input matInput [value]="getBodyValue(key)"
                              (input)="onAcFieldInput($any($event.target), acSetBodyHardcoded.bind(this, key))"
                              (keydown)="onAcKeydown($event)"
                              (blur)="closeAutocomplete()"
                              placeholder="Value… type {{ for refs" />
                          </mat-form-field>
                        </div>
                      }
                      @if (getBodySourceType(key) === 'from-step') {
                        <div class="from-step-row">
                          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="step-select">
                            <mat-label>{{ 'workflow.from-step' | t }}</mat-label>
                            <mat-select [value]="getBodyFromStepId(key)" (selectionChange)="setBodyFromStepId(key, $event.value)">
                              @for (ps of previousSteps(); track ps.id) {
                                <mat-option [value]="ps.id">{{ getStepIndex(ps.id) + 1 }}. {{ getNodeLabel(ps) }}</mat-option>
                              }
                            </mat-select>
                          </mat-form-field>
                          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="field-input">
                            <mat-label>{{ 'workflow.field-path' | t }}</mat-label>
                            <input matInput [value]="getBodyFromStepField(key)"
                              (input)="onAcFieldInput($any($event.target), acSetBodyFromStepField.bind(this, key))"
                              (keydown)="onAcKeydown($event)"
                              (blur)="closeAutocomplete()"
                              placeholder="e.g. id … type {{ for refs" />
                            <mat-hint>{{ 'workflow.dot-notation-hint' | t }}</mat-hint>
                          </mat-form-field>
                        </div>
                      }
                    </div>
                  }
                  <div class="add-field-row">
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                      <mat-label>{{ 'workflow.field-name' | t }}</mat-label>
                      <input matInput #newKeyInput [(ngModel)]="newBodyKey" placeholder="e.g. name" (keydown.enter)="addBodyKey()" />
                    </mat-form-field>
                    <button mat-stroked-button (click)="addBodyKey()" [disabled]="!newBodyKey.trim()">
                      <mat-icon>add</mat-icon> {{ 'workflow.add' | t }}
                    </button>
                  </div>
                }

                <!-- ── TEXT MODE (raw JSON with intellisense) ── -->
                @if (getBodyMode(ep) === 'text') {
                  <button mat-stroked-button class="generate-btn" (click)="generateWfTextTemplate()"
                          matTooltip="{{ 'workflow.generate-hint' | t }}">
                    <mat-icon>auto_fix_high</mat-icon> {{ 'workflow.generate-template' | t }}
                  </button>
                  <div class="raw-body-wrapper">
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                      <mat-label>{{ 'workflow.request-body-json' | t }}</mat-label>
                      <textarea matInput rows="10" [value]="ep.rawBody ?? '{}'"
                        (input)="onRawBodyInput($any($event.target))"
                        (keydown)="onAcKeydown($event)"
                        (blur)="closeAutocomplete()"
                        #rawBodyTextarea
                        placeholder='{ "key": "value" }' class="raw-body-textarea"></textarea>
                      <mat-hint>{{ 'workflow.type-hint' | t }}</mat-hint>
                    </mat-form-field>
                  </div>
                }

                <!-- ── FORM MODE (FormViewComponent) ── -->
                @if (getBodyMode(ep) === 'form') {
                  @if (getEndpointDef(ep); as epDef) {
                    <div class="form-view-embed">
                      <app-form-view
                        [endpoint]="epDef"
                        [apiPrefix]="ep.moduleApiPrefix"
                        [showSubmit]="false"
                        [initialValues]="getFormInitialValues(ep)"
                        [stepRefs]="getStepRefSuggestions()"
                        (valuesChange)="setRawBody($event)"
                      />
                    </div>
                  } @else {
                    <div class="no-config">
                      <mat-icon>warning</mat-icon>
                      <p>{{ 'workflow.endpoint-not-found' | t }}</p>
                    </div>
                  }
                }
              }

              @if (!ep.hasBody && ep.pathParamNames.length === 0) {
                <div class="no-config">
                  <mat-icon>check_circle_outline</mat-icon>
                  <p>{{ 'workflow.no-config' | t }}</p>
                </div>
              }
            }

            <!-- ── TRY / CATCH CONFIG ─────────────────────────────────────── -->
            @if (selectedStep()!.kind === 'try-catch') {
              @let block = asTryCatch(selectedStep()!);
              <div class="config-section-label">{{ 'workflow.label' | t }}</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'workflow.block-label' | t }}</mat-label>
                <input matInput [value]="block.label ?? ''" (input)="mutateBlock(block.id, $any($event.target).value, 'label')" placeholder="e.g. Fetch and handle errors" />
              </mat-form-field>

              <mat-divider class="section-divider" />
              <div class="config-section-label">{{ 'workflow.try-steps' | t }}</div>
              <div class="branch-step-list">
                @for (s of block.trySteps; track s.id) {
                  <div class="branch-step-item" (click)="selectStep(s.id)">
                    <mat-icon class="branch-step-kind">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                    <span>{{ getNodeLabel(s) }}</span>
                    <button mat-icon-button (click)="$event.stopPropagation(); removeFromBranch(block.id, 'trySteps', s.id)" matTooltip="{{ 'workflow.remove-step' | t }}"><mat-icon>remove_circle_outline</mat-icon></button>
                  </div>
                }
                @if (block.trySteps.length === 0) { <p class="branch-empty">{{ 'workflow.no-steps-drag' | t }}</p> }
              </div>
              <div class="add-inner-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                  <mat-label>{{ 'workflow.add-endpoint-try' | t }}</mat-label>
                  <mat-select (selectionChange)="addToBranch(block.id, 'trySteps', $event.value); $event.source.writeValue(null)">
                    <mat-optgroup label="{{ 'workflow.endpoints' | t }}">
                      @for (ref of allEndpointRefs(); track ref.endpoint.id) {
                        <mat-option [value]="ref">{{ ref.module.label }} › {{ ref.endpoint.label }}</mat-option>
                      }
                    </mat-optgroup>
                    <mat-optgroup label="{{ 'workflow.blocks' | t }}">
                      @for (cf of controlFlowItems; track cf.kind) {
                        <mat-option [value]="cf"><mat-icon class="block-opt-icon">{{ cf.icon }}</mat-icon> {{ cf.label }}</mat-option>
                      }
                    </mat-optgroup>
                  </mat-select>
                </mat-form-field>
              </div>

              <mat-divider class="section-divider" />
              <div class="config-section-label">{{ 'workflow.catch-steps' | t }}</div>
              <div class="branch-step-list">
                @for (s of block.catchSteps; track s.id) {
                  <div class="branch-step-item" (click)="selectStep(s.id)">
                    <mat-icon class="branch-step-kind">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                    <span>{{ getNodeLabel(s) }}</span>
                    <button mat-icon-button (click)="$event.stopPropagation(); removeFromBranch(block.id, 'catchSteps', s.id)" matTooltip="{{ 'workflow.remove-step' | t }}"><mat-icon>remove_circle_outline</mat-icon></button>
                  </div>
                }
                @if (block.catchSteps.length === 0) { <p class="branch-empty">{{ 'workflow.no-steps-add' | t }}</p> }
              </div>
              <div class="add-inner-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                  <mat-label>{{ 'workflow.add-endpoint-catch' | t }}</mat-label>
                  <mat-select (selectionChange)="addToBranch(block.id, 'catchSteps', $event.value); $event.source.writeValue(null)">
                    <mat-optgroup label="{{ 'workflow.endpoints' | t }}">
                      @for (ref of allEndpointRefs(); track ref.endpoint.id) {
                        <mat-option [value]="ref">{{ ref.module.label }} › {{ ref.endpoint.label }}</mat-option>
                      }
                    </mat-optgroup>
                    <mat-optgroup label="{{ 'workflow.blocks' | t }}">
                      @for (cf of controlFlowItems; track cf.kind) {
                        <mat-option [value]="cf"><mat-icon class="block-opt-icon">{{ cf.icon }}</mat-icon> {{ cf.label }}</mat-option>
                      }
                    </mat-optgroup>
                  </mat-select>
                </mat-form-field>
              </div>
            }

            <!-- ── LOOP CONFIG ────────────────────────────────────────────── -->
            @if (selectedStep()!.kind === 'loop') {
              @let block = asLoop(selectedStep()!);
              <div class="config-section-label">{{ 'workflow.label' | t }}</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'workflow.block-label' | t }}</mat-label>
                <input matInput [value]="block.label ?? ''" (input)="mutateBlock(block.id, $any($event.target).value, 'label')" placeholder="e.g. Process each record" />
              </mat-form-field>

              <mat-divider class="section-divider" />
              <div class="config-section-label">{{ 'workflow.loop-settings' | t }}</div>

              <!-- Loop mode toggle -->
              <div class="loop-mode-toggle">
                <button mat-stroked-button [class.active-source]="(block.loopMode ?? 'count') === 'count'" (click)="setLoopMode(block.id, 'count')">
                  <mat-icon>repeat</mat-icon> {{ 'workflow.loop-repeat' | t }}
                </button>
                <button mat-stroked-button [class.active-source]="block.loopMode === 'for-each'" (click)="setLoopMode(block.id, 'for-each')">
                  <mat-icon>format_list_numbered</mat-icon> {{ 'workflow.loop-for-each' | t }}
                </button>
              </div>

              @if ((block.loopMode ?? 'count') === 'count') {
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>{{ 'workflow.repeat-count' | t }}</mat-label>
                  <input matInput type="number" min="1" [value]="block.loopCount ?? 1"
                         (input)="mutateBlock(block.id, +$any($event.target).value || 1, 'loopCount')" />
                  <mat-hint>{{ 'workflow.repeat-hint' | t }}</mat-hint>
                </mat-form-field>
              }

              @if (block.loopMode === 'for-each') {
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>{{ 'workflow.source-step' | t }}</mat-label>
                  <mat-select [value]="block.loopSourceStepId ?? ''" (selectionChange)="mutateBlock(block.id, $event.value, 'loopSourceStepId')">
                    @for (ps of previousSteps(); track ps.id) {
                      <mat-option [value]="ps.id">{{ getStepIndex(ps.id) + 1 }}. {{ getNodeLabel(ps) }}</mat-option>
                    }
                  </mat-select>
                  <mat-hint>{{ 'workflow.loop-source-hint' | t }}</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                  <mat-label>{{ 'workflow.field-path' | t }}</mat-label>
                  <input matInput [value]="block.loopSourceField ?? ''"
                    (input)="onAcFieldInput($any($event.target), acMutateBlock.bind(this, block.id, 'loopSourceField'))"
                    (keydown)="onAcKeydown($event)"
                    (blur)="closeAutocomplete()"
                    placeholder="e.g. data … type {{ for refs" />
                  <mat-hint>{{ 'workflow.loop-field-hint' | t }}</mat-hint>
                </mat-form-field>
                <p class="loop-foreach-info">
                  <mat-icon>info</mat-icon>
                  {{ 'workflow.loop-item-hint' | t }}
                </p>
              }

              <mat-divider class="section-divider" />
              <div class="config-section-label">{{ 'workflow.body-steps' | t }}</div>
              <div class="branch-step-list">
                @for (s of block.bodySteps; track s.id) {
                  <div class="branch-step-item" (click)="selectStep(s.id)">
                    <mat-icon class="branch-step-kind">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                    <span>{{ getNodeLabel(s) }}</span>
                    <button mat-icon-button (click)="$event.stopPropagation(); removeFromBranch(block.id, 'bodySteps', s.id)" matTooltip="{{ 'workflow.remove-step' | t }}"><mat-icon>remove_circle_outline</mat-icon></button>
                  </div>
                }
                @if (block.bodySteps.length === 0) { <p class="branch-empty">{{ 'workflow.no-steps-add' | t }}</p> }
              </div>
              <div class="add-inner-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                  <mat-label>{{ 'workflow.add-endpoint-body' | t }}</mat-label>
                  <mat-select (selectionChange)="addToBranch(block.id, 'bodySteps', $event.value); $event.source.writeValue(null)">
                    <mat-optgroup label="{{ 'workflow.endpoints' | t }}">
                      @for (ref of allEndpointRefs(); track ref.endpoint.id) {
                        <mat-option [value]="ref">{{ ref.module.label }} › {{ ref.endpoint.label }}</mat-option>
                      }
                    </mat-optgroup>
                    <mat-optgroup label="{{ 'workflow.blocks' | t }}">
                      @for (cf of controlFlowItems; track cf.kind) {
                        <mat-option [value]="cf"><mat-icon class="block-opt-icon">{{ cf.icon }}</mat-icon> {{ cf.label }}</mat-option>
                      }
                    </mat-optgroup>
                  </mat-select>
                </mat-form-field>
              </div>
            }

            <!-- ── IF / ELSE CONFIG ───────────────────────────────────────── -->
            @if (selectedStep()!.kind === 'if-else') {
              @let block = asIfElse(selectedStep()!);
              <div class="config-section-label">{{ 'workflow.label' | t }}</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'workflow.block-label' | t }}</mat-label>
                <input matInput [value]="block.label ?? ''" (input)="mutateBlock(block.id, $any($event.target).value, 'label')" placeholder="e.g. Check balance" />
              </mat-form-field>

              <mat-divider class="section-divider" />
              <div class="config-section-label">{{ 'workflow.condition' | t }}</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'workflow.from-step' | t }}</mat-label>
                <mat-select [value]="block.conditionStepId ?? ''" (selectionChange)="mutateBlock(block.id, $event.value, 'conditionStepId')">
                  @for (ps of previousSteps(); track ps.id) {
                    <mat-option [value]="ps.id">{{ getStepIndex(ps.id) + 1 }}. {{ getNodeLabel(ps) }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'workflow.field-path' | t }}</mat-label>
                <input matInput [value]="block.conditionField ?? ''"
                  (input)="onAcFieldInput($any($event.target), acMutateBlock.bind(this, block.id, 'conditionField'))"
                  (keydown)="onAcKeydown($event)"
                  (blur)="closeAutocomplete()"
                  placeholder="e.g. data.status … type {{ for refs" />
              </mat-form-field>
              <div class="from-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="step-select">
                  <mat-label>{{ 'workflow.operator' | t }}</mat-label>
                  <mat-select [value]="block.conditionOperator ?? '=='" (selectionChange)="mutateBlock(block.id, $event.value, 'conditionOperator')">
                    <mat-option value="==">{{ 'workflow.op-equals' | t }}</mat-option>
                    <mat-option value="!=">{{ 'workflow.op-not-equals' | t }}</mat-option>
                    <mat-option value=">">{{ 'workflow.op-greater-than' | t }}</mat-option>
                    <mat-option value="<">{{ 'workflow.op-less-than' | t }}</mat-option>
                    <mat-option value="contains">{{ 'workflow.op-contains' | t }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="field-input">
                  <mat-label>{{ 'workflow.value' | t }}</mat-label>
                  <input matInput [value]="block.conditionValue ?? ''"
                    (input)="onAcFieldInput($any($event.target), acMutateBlock.bind(this, block.id, 'conditionValue'))"
                    (keydown)="onAcKeydown($event)"
                    (blur)="closeAutocomplete()"
                    placeholder="e.g. active … type {{ for refs" />
                </mat-form-field>
              </div>

              <mat-divider class="section-divider" />
              <div class="config-section-label">{{ 'workflow.then-steps' | t }}</div>
              <div class="branch-step-list">
                @for (s of block.thenSteps; track s.id) {
                  <div class="branch-step-item" (click)="selectStep(s.id)">
                    <mat-icon class="branch-step-kind">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                    <span>{{ getNodeLabel(s) }}</span>
                    <button mat-icon-button (click)="$event.stopPropagation(); removeFromBranch(block.id, 'thenSteps', s.id)" matTooltip="{{ 'workflow.remove-step' | t }}"><mat-icon>remove_circle_outline</mat-icon></button>
                  </div>
                }
                @if (block.thenSteps.length === 0) { <p class="branch-empty">{{ 'workflow.no-steps-add' | t }}</p> }
              </div>
              <div class="add-inner-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                  <mat-label>{{ 'workflow.add-endpoint-then' | t }}</mat-label>
                  <mat-select (selectionChange)="addToBranch(block.id, 'thenSteps', $event.value); $event.source.writeValue(null)">
                    <mat-optgroup label="{{ 'workflow.endpoints' | t }}">
                      @for (ref of allEndpointRefs(); track ref.endpoint.id) {
                        <mat-option [value]="ref">{{ ref.module.label }} › {{ ref.endpoint.label }}</mat-option>
                      }
                    </mat-optgroup>
                    <mat-optgroup label="{{ 'workflow.blocks' | t }}">
                      @for (cf of controlFlowItems; track cf.kind) {
                        <mat-option [value]="cf"><mat-icon class="block-opt-icon">{{ cf.icon }}</mat-icon> {{ cf.label }}</mat-option>
                      }
                    </mat-optgroup>
                  </mat-select>
                </mat-form-field>
              </div>

              <mat-divider class="section-divider" />
              <div class="config-section-label">{{ 'workflow.else-steps' | t }}</div>
              <div class="branch-step-list">
                @for (s of block.elseSteps; track s.id) {
                  <div class="branch-step-item" (click)="selectStep(s.id)">
                    <mat-icon class="branch-step-kind">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                    <span>{{ getNodeLabel(s) }}</span>
                    <button mat-icon-button (click)="$event.stopPropagation(); removeFromBranch(block.id, 'elseSteps', s.id)" matTooltip="{{ 'workflow.remove-step' | t }}"><mat-icon>remove_circle_outline</mat-icon></button>
                  </div>
                }
                @if (block.elseSteps.length === 0) { <p class="branch-empty">{{ 'workflow.no-steps-add' | t }}</p> }
              </div>
              <div class="add-inner-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                  <mat-label>{{ 'workflow.add-endpoint-else' | t }}</mat-label>
                  <mat-select (selectionChange)="addToBranch(block.id, 'elseSteps', $event.value); $event.source.writeValue(null)">
                    <mat-optgroup label="{{ 'workflow.endpoints' | t }}">
                      @for (ref of allEndpointRefs(); track ref.endpoint.id) {
                        <mat-option [value]="ref">{{ ref.module.label }} › {{ ref.endpoint.label }}</mat-option>
                      }
                    </mat-optgroup>
                    <mat-optgroup label="{{ 'workflow.blocks' | t }}">
                      @for (cf of controlFlowItems; track cf.kind) {
                        <mat-option [value]="cf"><mat-icon class="block-opt-icon">{{ cf.icon }}</mat-icon> {{ cf.label }}</mat-option>
                      }
                    </mat-optgroup>
                  </mat-select>
                </mat-form-field>
              </div>
            }

            <!-- ── MAPPER CONFIG ─────────────────────────────────────────── -->
            @if (selectedStep()!.kind === 'mapper') {
              @let block = asMapper(selectedStep()!);
              <div class="config-section-label">{{ 'workflow.label' | t }}</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'workflow.block-label' | t }}</mat-label>
                <input matInput [value]="block.label ?? ''" (input)="mutateBlock(block.id, $any($event.target).value, 'label')" placeholder="e.g. Build contact payload" />
              </mat-form-field>

              <mat-divider class="section-divider" />
              <div class="config-section-label">{{ 'workflow.mappings' | t }}</div>

              @for (m of block.mappings; track $index; let idx = $index) {
                <div class="mapper-row">
                  <div class="mapper-row-header">
                    <span class="mapper-row-num">#{{ idx + 1 }}</span>
                    <button mat-icon-button (click)="removeMapping(block.id, idx)" color="warn" matTooltip="{{ 'workflow.remove-mapping' | t }}">
                      <mat-icon>remove_circle_outline</mat-icon>
                    </button>
                  </div>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                    <mat-label>{{ 'workflow.output-field' | t }}</mat-label>
                    <input matInput [value]="m.outputField"
                      (input)="onAcFieldInput($any($event.target), acUpdateMappingOutput.bind(this, block.id, idx))"
                      (keydown)="onAcKeydown($event)"
                      (blur)="closeAutocomplete()"
                      placeholder="e.g. contact_name" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                    <mat-label>{{ 'workflow.source-step' | t }}</mat-label>
                    <mat-select [value]="m.source.type === 'from-step' ? m.source.stepId : ''" (selectionChange)="updateMappingSource(block.id, idx, $event.value, m.source.type === 'from-step' ? m.source.field : '')">
                      @for (ps of previousSteps(); track ps.id) {
                        <mat-option [value]="ps.id">{{ getStepIndex(ps.id) + 1 }}. {{ getNodeLabel(ps) }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                    <mat-label>{{ 'workflow.field-path' | t }}</mat-label>
                    <input matInput [value]="m.source.type === 'from-step' ? m.source.field : ''"
                      (input)="onAcFieldInput($any($event.target), acUpdateMappingField.bind(this, block.id, idx, m))"
                      (keydown)="onAcKeydown($event)"
                      (blur)="closeAutocomplete()"
                      placeholder="e.g. data.first_name … type {{ for refs" />
                    <mat-hint>{{ 'workflow.dot-notation-hint' | t }}</mat-hint>
                  </mat-form-field>
                </div>
              }

              @if (block.mappings.length === 0) {
                <p class="branch-empty">{{ 'workflow.no-mappings' | t }}</p>
              }

              <button mat-stroked-button class="add-mapping-btn" (click)="addMapping(block.id)" [disabled]="previousSteps().length === 0">
                <mat-icon>add</mat-icon> {{ 'workflow.add-mapping' | t }}
              </button>
            }

            <!-- ── FILTER CONFIG ──────────────────────────────────────────── -->
            @if (selectedStep()!.kind === 'filter') {
              @let block = asFilter(selectedStep()!);
              <div class="config-section-label">{{ 'workflow.label' | t }}</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'workflow.block-label' | t }}</mat-label>
                <input matInput [value]="block.label ?? ''" (input)="mutateBlock(block.id, $any($event.target).value, 'label')" placeholder="e.g. Active contacts only" />
              </mat-form-field>

              <mat-divider class="section-divider" />
              <div class="config-section-label">{{ 'workflow.filter-source' | t }}</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'workflow.source-step' | t }}</mat-label>
                <mat-select [value]="block.sourceStepId ?? ''" (selectionChange)="mutateBlock(block.id, $event.value, 'sourceStepId')">
                  @for (ps of previousSteps(); track ps.id) {
                    <mat-option [value]="ps.id">{{ getStepIndex(ps.id) + 1 }}. {{ getNodeLabel(ps) }}</mat-option>
                  }
                </mat-select>
                <mat-hint>{{ 'workflow.filter-source-hint' | t }}</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'workflow.field-path' | t }}</mat-label>
                <input matInput [value]="block.sourceField ?? ''"
                  (input)="onAcFieldInput($any($event.target), acMutateBlock.bind(this, block.id, 'sourceField'))"
                  (keydown)="onAcKeydown($event)"
                  (blur)="closeAutocomplete()"
                  placeholder="e.g. data … type {{ for refs" />
                <mat-hint>{{ 'workflow.filter-array-hint' | t }}</mat-hint>
              </mat-form-field>

              <mat-divider class="section-divider" />
              <div class="config-section-label">{{ 'workflow.condition' | t }}</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'workflow.filter-field' | t }}</mat-label>
                <input matInput [value]="block.filterField ?? ''"
                  (input)="onAcFieldInput($any($event.target), acMutateBlock.bind(this, block.id, 'filterField'))"
                  (keydown)="onAcKeydown($event)"
                  (blur)="closeAutocomplete()"
                  placeholder="e.g. status" />
                <mat-hint>{{ 'workflow.filter-field-hint' | t }}</mat-hint>
              </mat-form-field>
              <div class="from-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="step-select">
                  <mat-label>{{ 'workflow.operator' | t }}</mat-label>
                  <mat-select [value]="block.filterOperator ?? '=='" (selectionChange)="mutateBlock(block.id, $event.value, 'filterOperator')">
                    <mat-option value="==">{{ 'workflow.op-equals' | t }}</mat-option>
                    <mat-option value="!=">{{ 'workflow.op-not-equals' | t }}</mat-option>
                    <mat-option value=">">{{ 'workflow.op-greater-than' | t }}</mat-option>
                    <mat-option value="<">{{ 'workflow.op-less-than' | t }}</mat-option>
                    <mat-option value="contains">{{ 'workflow.op-contains' | t }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="field-input">
                  <mat-label>{{ 'workflow.value' | t }}</mat-label>
                  <input matInput [value]="block.filterValue ?? ''"
                    (input)="onAcFieldInput($any($event.target), acMutateBlock.bind(this, block.id, 'filterValue'))"
                    (keydown)="onAcKeydown($event)"
                    (blur)="closeAutocomplete()"
                    placeholder="e.g. active … type {{ for refs" />
                </mat-form-field>
              </div>
              <p class="loop-foreach-info">
                <mat-icon>info</mat-icon>
                {{ 'workflow.filter-result-hint' | t }}
              </p>
            }

            <!-- ── SUB-WORKFLOW CONFIG ─────────────────────────────────────── -->
            @if (selectedStep()!.kind === 'sub-workflow') {
              @let block = asSubWorkflow(selectedStep()!);

              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'workflow.label' | t }}</mat-label>
                <input matInput [value]="block.label ?? ''" (input)="mutateBlock(block.id, $any($event.target).value, 'label')" />
              </mat-form-field>

              <div class="config-section-label">{{ 'workflow.select-workflow' | t }}</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>{{ 'workflow.target-workflow' | t }}</mat-label>
                <mat-select [value]="block.workflowId ?? ''"
                            (selectionChange)="setSubWorkflowTarget(block.id, $event.value)">
                  @for (wf of availableSubWorkflows(); track wf.id) {
                    <mat-option [value]="wf.id">
                      {{ wf.name }}
                      @if ((wf.inputs ?? []).length > 0) {
                        <span class="sub-wf-input-count">({{ (wf.inputs ?? []).length }} inputs)</span>
                      }
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <!-- Input bindings -->
              @if (block.workflowId) {
                @let targetInputs = getSubWorkflowInputDefs(block.workflowId);
                @if (targetInputs.length > 0) {
                  <mat-divider class="section-divider" />
                  <div class="config-section-label">{{ 'workflow.bind-inputs' | t }}</div>
                  @for (inp of targetInputs; track inp.name) {
                    <div class="field-block">
                      <div class="field-name-row">
                        <mat-icon>input</mat-icon>
                        <code>{{ inp.name }}</code>
                        @if (inp.defaultValue) {
                          <span class="default-hint">(default: {{ inp.defaultValue }})</span>
                        }
                      </div>
                      <div class="source-toggle">
                        <button mat-stroked-button
                                [class.active-mode]="getSubWfBindingType(block, inp.name) === 'hardcoded'"
                                (click)="setSubWfBindingType(block.id, inp.name, 'hardcoded')">
                          <mat-icon>text_fields</mat-icon> {{ 'workflow.hardcoded' | t }}
                        </button>
                        <button mat-stroked-button
                                [class.active-mode]="getSubWfBindingType(block, inp.name) === 'from-step'"
                                (click)="setSubWfBindingType(block.id, inp.name, 'from-step')">
                          <mat-icon>link</mat-icon> {{ 'workflow.from-step' | t }}
                        </button>
                      </div>
                      @if (getSubWfBindingType(block, inp.name) === 'hardcoded') {
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                          <mat-label>{{ 'workflow.value' | t }}</mat-label>
                          <input matInput [value]="getSubWfBindingValue(block, inp.name)"
                                 (input)="setSubWfBindingHardcoded(block.id, inp.name, $any($event.target).value)" />
                        </mat-form-field>
                      }
                      @if (getSubWfBindingType(block, inp.name) === 'from-step') {
                        <div class="from-step-row">
                          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="step-select">
                            <mat-label>{{ 'workflow.step' | t }}</mat-label>
                            <mat-select [value]="getSubWfBindingStepId(block, inp.name)"
                                        (selectionChange)="setSubWfBindingStep(block.id, inp.name, $event.value)">
                              @for (prev of previousSteps(); track prev.id; let si = $index) {
                                <mat-option [value]="prev.id">Step {{ si + 1 }}: {{ getStepLabel(prev) }}</mat-option>
                              }
                            </mat-select>
                          </mat-form-field>
                          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="field-input">
                            <mat-label>{{ 'workflow.field-path' | t }}</mat-label>
                            <input matInput [value]="getSubWfBindingField(block, inp.name)"
                                   (input)="setSubWfBindingField(block.id, inp.name, $any($event.target).value)"
                                   placeholder="e.g. data.id" />
                          </mat-form-field>
                        </div>
                      }
                    </div>
                  }
                }

                @let targetOutputNames = getSubWorkflowOutputNames(block.workflowId);
                @if (targetOutputNames.length > 0) {
                  <mat-divider class="section-divider" />
                  <div class="config-section-label">{{ 'workflow.output-preview' | t }}</div>
                  <p class="config-hint">{{ 'workflow.sub-wf-output-hint' | t }}</p>
                  @for (o of targetOutputNames; track o) {
                    <div class="io-preview-chip">
                      <mat-icon style="font-size:14px;width:14px;height:14px">output</mat-icon>
                      {{ o }}
                    </div>
                  }
                }
              }
            }

          </div>
        </div>
      }
    </div>

    <!-- ── Bottom result panel ─────────────────────────────────────────────── -->
    @if (runLog() && resultPanelOpen()) {
      <div class="result-resize-handle" (mousedown)="onResizeStart($event)">
        <div class="resize-grip"></div>
      </div>
      <div class="result-bottom" [style.height.px]="resultPanelHeight()"
           [class.result-bottom--fail]="!runLog()!.success">
        <div class="result-bottom-header">
          <mat-icon class="result-status-icon">{{ runLog()!.success ? 'check_circle' : 'error' }}</mat-icon>
          <span class="result-bottom-title">{{ runLog()!.success ? ('workflow.completed' | t) : ('workflow.failed' | t) }}</span>
          <span class="result-step-counter">{{ runLog()!.steps.length }} step{{ runLog()!.steps.length === 1 ? '' : 's' }}</span>
          <button mat-icon-button (click)="resultPanelOpen.set(false)" matTooltip="{{ 'workflow.collapse-results' | t }}">
            <mat-icon>expand_more</mat-icon>
          </button>
        </div>
        <div class="result-bottom-body">
          @for (sl of runLog()!.steps; track sl.stepId) {
            <div class="result-step" [class.result-step--fail]="!sl.success">
              <div class="result-step-header">
                <mat-icon>{{ sl.success ? 'check_circle' : 'cancel' }}</mat-icon>
                <strong>{{ sl.label }}</strong>
              </div>
              @if (sl.error) {
                <div class="result-step-error">
                  <mat-icon>warning</mat-icon>
                  <span>{{ sl.error }}</span>
                </div>
              }
              @if (sl.response !== undefined && sl.response !== null) {
                <div class="result-view-toggle">
                  <mat-button-toggle-group [value]="getViewMode(sl.stepId)" (change)="setViewMode(sl.stepId, $event.value)" hideSingleSelectionIndicator>
                    <mat-button-toggle value="json"><mat-icon>code</mat-icon> {{ 'workflow.json' | t }}</mat-button-toggle>
                    <mat-button-toggle value="list"><mat-icon>table_rows</mat-icon> {{ 'workflow.list' | t }}</mat-button-toggle>
                    <mat-button-toggle value="form"><mat-icon>list_alt</mat-icon> {{ 'workflow.form' | t }}</mat-button-toggle>
                  </mat-button-toggle-group>

                  <!-- When response is an object with multiple array properties, let user pick -->
                  @if (getViewMode(sl.stepId) === 'list' && getArrayPaths(sl.response).length > 1) {
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="list-path-select">
                      <mat-select [value]="getListPath(sl.stepId)" (selectionChange)="setListPath(sl.stepId, $event.value)">
                        @if (isArray(sl.response)) {
                          <mat-option value="">(root array)</mat-option>
                        }
                        @for (p of getArrayPaths(sl.response); track p) {
                          <mat-option [value]="p">{{ p }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  }
                </div>

                @switch (getViewMode(sl.stepId)) {
                  @case ('json') {
                    <pre class="result-step-resp">{{ sl.response | json }}</pre>
                  }
                  @case ('list') {
                    <div class="result-list-view">
                      @if (getListRows(sl.stepId, sl.response); as rows) {
                        @if (rows.length === 0) {
                          <p class="result-empty-hint">{{ 'workflow.no-array-data' | t }}</p>
                        }
                        @if (rows.length > 0 && isObject(rows[0])) {
                          <div class="result-table-info">
                            <mat-icon>info</mat-icon>
                            <span>{{ rows.length }} {{ rows.length === 1 ? 'item' : 'items' }}
                              @if (getListPath(sl.stepId); as lp) { &middot; {{ lp }} }
                            </span>
                          </div>
                          <table class="result-table">
                            <thead>
                              <tr>
                                @for (col of objectKeys(rows[0]); track col) {
                                  <th>{{ col }}</th>
                                }
                              </tr>
                            </thead>
                            <tbody>
                              @for (row of rows; track $index) {
                                <tr>
                                  @for (col of objectKeys(rows[0]); track col) {
                                    <td [title]="cellText(asRecord(row)[col])">{{ cellText(asRecord(row)[col]) }}</td>
                                  }
                                </tr>
                              }
                            </tbody>
                          </table>
                        }
                        @if (rows.length > 0 && !isObject(rows[0])) {
                          <ul class="result-simple-list">
                            @for (item of rows; track $index) {
                              <li>{{ item }}</li>
                            }
                          </ul>
                        }
                      }
                    </div>
                  }
                  @case ('form') {
                    <div class="result-form-view">
                      @if (getFormEntries(sl.response); as entries) {
                        @if (entries.length === 0) {
                          <p class="result-empty-hint">{{ 'workflow.no-object-data' | t }}</p>
                        }
                        @for (entry of entries; track entry.key) {
                          <div class="form-row">
                            <span class="form-label">{{ entry.key }}</span>
                            @if (isArray(entry.value)) {
                              <span class="form-value form-value--array">
                                <mat-icon class="form-type-icon">data_array</mat-icon>
                                Array[{{ asArray(entry.value).length }}]
                              </span>
                            } @else if (isObject(entry.value) && entry.value !== null) {
                              <span class="form-value form-value--obj">
                                <mat-icon class="form-type-icon">data_object</mat-icon>
                                {{ entry.value | json }}
                              </span>
                            } @else {
                              <span class="form-value">{{ entry.value }}</span>
                            }
                          </div>
                        }
                      }
                    </div>
                  }
                }
              }
            </div>
          }
        </div>
      </div>
    }

    <!-- Shared autocomplete overlay (root-level, not clipped by overflow:hidden) -->
    @if (acSuggestions().length > 0) {
      <div class="ac-overlay ac-overlay--panel" [ngStyle]="acOverlayStyle()">
        @for (s of acSuggestions(); track s.insertText; let i = $index) {
          <div class="ac-item" [class.ac-item--active]="i === acSelectedIndex()"
               (mousedown)="insertSuggestion(s, $event)">
            <mat-icon class="ac-icon ac-icon--{{ s.icon }}">{{ s.icon }}</mat-icon>
            <div class="ac-text">
              <span class="ac-label">{{ s.label }}
                @if (s.typeHint) {
                  <span class="ac-type ac-type--{{ s.typeHint }}">{{ s.typeHint }}</span>
                }
              </span>
              <span class="ac-detail">{{ s.detail }}</span>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; gap: 0; overflow: hidden; }

    /* ── Top bar ── */
    .topbar {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
      padding: 8px 0 12px;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .name-field { flex: 1 1 200px; min-width: 180px; }
    .schedule-field { width: 200px; min-width: 180px; }
    .schedule-field { flex: 1 1 200px; min-width: 200px; }
    .topbar-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
    .active-io { background: #ede9fe !important; border-color: #7c3aed !important; color: #7c3aed; }

    /* ── I/O Panel ── */
    .io-panel {
      display: flex; gap: 0; padding: 12px 24px;
      background: #fafbfc; border-bottom: 1px solid #e2e8f0;
    }
    .io-section { flex: 1; padding: 0 12px; }
    .io-divider { width: 1px; background: #e2e8f0; margin: 0 8px; }
    .io-section-header {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;
    }
    .io-section-header button { margin-left: auto; width: 24px; height: 24px; line-height: 24px; }
    .io-section-header button mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .io-row { display: flex; gap: 6px; align-items: center; margin-bottom: 4px; }
    .io-name-field { flex: 1; }
    .io-default-field { flex: 1; }
    .io-step-field { flex: 1; }
    .io-field-field { flex: 1; }
    .io-empty { font-size: 11px; color: #94a3b8; font-style: italic; margin: 0; }

    .sub-wf-io-preview {
      padding: 4px 12px 8px; display: flex; gap: 6px; flex-wrap: wrap;
    }
    .sub-wf-io-label {
      display: flex; align-items: center; gap: 4px;
      font-size: 10px; color: #64748b; background: #f1f5f9;
      padding: 2px 8px; border-radius: 4px;
    }
    .sub-wf-input-count { font-size: 10px; color: #64748b; margin-left: 4px; }
    .default-hint { font-size: 10px; color: #94a3b8; margin-left: 4px; }
    .io-preview-chip {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; background: #f1f5f9; padding: 4px 10px;
      border-radius: 6px; margin: 2px 4px 2px 0; color: #1e293b;
    }

    /* ── Layout ── */
    .builder-layout {
      display: flex; flex: 1 1 0; overflow: hidden; gap: 0;
      min-height: 0;
    }

    /* ── Browser ── */
    .browser-panel {
      width: 260px; min-width: 220px; flex-shrink: 0;
      border-right: 1px solid #e2e8f0;
      display: flex; flex-direction: column;
      background: #f8fafc;
      overflow: hidden;
    }
    .browser-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px 6px;
      font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
      color: #64748b;
    }
    .browser-header mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .search-field { margin: 0 8px 4px; }
    .module-list { flex: 1; overflow-y: auto; padding-bottom: 8px; }

    .module-group { border-bottom: 1px solid #e2e8f0; }
    .module-toggle {
      display: flex; align-items: center; gap: 8px; width: 100%;
      padding: 8px 12px; border: none; background: none; cursor: pointer;
      font-size: 12px; font-weight: 600; color: #374151; text-align: left;
    }
    .module-toggle mat-icon { font-size: 16px; width: 16px; height: 16px; color: #0284c7; }
    .module-toggle .chevron { margin-left: auto; color: #9ca3af; }
    .module-toggle:hover { background: #f1f5f9; }

    .ep-item {
      padding: 4px 8px 4px 24px;
      cursor: grab;
    }
    .ep-item-content {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 8px; border-radius: 6px;
      border: 1px solid transparent;
      background: white;
      font-size: 11px; color: #374151;
      transition: all .15s;
    }
    .ep-item:hover .ep-item-content {
      border-color: #bae6fd; background: #f0f9ff;
      box-shadow: 0 1px 4px rgba(2,132,199,.12);
    }
    .ep-name { flex: 1; }
    .drag-handle { font-size: 16px; width: 16px; height: 16px; color: #cbd5e1 !important; cursor: grab; }

    .drag-preview {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 6px;
      background: white; box-shadow: 0 4px 16px rgba(0,0,0,.15);
      font-size: 12px;
    }
    .drag-placeholder-browser {
      height: 32px; border-radius: 6px;
      background: #e0f2fe; border: 2px dashed #7dd3fc; margin: 2px 8px;
    }

    /* ── Canvas ── */
    .canvas-panel {
      flex: 1; overflow-y: auto; padding: 16px;
      background: #fafafa;
      display: flex; flex-direction: column; gap: 0;
    }
    .canvas-header {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 12px;
      font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
      color: #64748b;
    }
    .canvas-header mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .step-count {
      margin-left: 4px; background: #0284c7; color: white;
      border-radius: 99px; padding: 1px 7px; font-size: 10px; font-weight: 700;
    }

    .canvas-empty {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 12px;
      min-height: 200px;
      border: 2px dashed #cbd5e1; border-radius: 12px;
      color: #94a3b8; font-size: 14px;
    }
    .canvas-empty mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .canvas-empty.cdk-drop-list-dragging,
    .canvas-empty:has(.cdk-drag-placeholder) {
      border-color: #7dd3fc; background: #f0f9ff;
    }

    .step-list { display: flex; flex-direction: column; min-height: 100px; }

    .step-card {
      display: flex; flex-direction: column;
    }
    .step-card-inner {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 10px 12px;
      border: 1px solid #e2e8f0; border-radius: 10px;
      background: white; cursor: pointer;
      transition: border-color .15s, box-shadow .15s;
    }
    .step-card-inner:hover { border-color: #7dd3fc; box-shadow: 0 2px 8px rgba(2,132,199,.1); }
    .step-card--selected .step-card-inner {
      border-color: #0284c7; box-shadow: 0 0 0 2px rgba(2,132,199,.2);
    }

    .step-num {
      width: 24px; height: 24px; border-radius: 99px;
      background: #e0f2fe; color: #0284c7;
      font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 2px;
    }
    .step-info { flex: 1; min-width: 0; }
    .step-header-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .step-label { font-size: 13px; font-weight: 600; color: #1e293b; }
    .step-sub { display: flex; align-items: center; gap: 8px; }
    .step-module { font-size: 11px; color: #64748b; }
    .step-path { font-size: 10px; color: #94a3b8; }
    .step-config-summary { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
    .cfg-chip {
      padding: 1px 7px; border-radius: 6px; font-size: 10px;
      background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;
    }
    .cfg-chip--set { background: #dcfce7; border-color: #86efac; color: #15803d; }
    .cfg-chip--body { background: #ede9fe; border-color: #c4b5fd; color: #7c3aed; }

    .step-card-actions {
      display: flex; align-items: center; gap: 2px; flex-shrink: 0;
    }

    .connector {
      display: flex; flex-direction: column; align-items: center;
      padding: 0; margin: -2px 0;
    }
    .connector-line { width: 2px; height: 12px; background: #cbd5e1; }
    .connector-arrow {
      font-size: 16px; width: 16px; height: 16px;
      color: #94a3b8 !important; margin: -2px 0;
    }

    .drag-placeholder-canvas {
      height: 56px; border-radius: 10px;
      background: #e0f2fe; border: 2px dashed #7dd3fc; margin: 4px 0;
    }

    /* ── Config panel ── */
    .config-panel {
      width: 320px; min-width: 280px; flex-shrink: 0;
      border-left: 1px solid #e2e8f0;
      display: flex; flex-direction: column;
      background: white; overflow: hidden;
    }
    .config-header {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 12px 10px;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc; flex-shrink: 0;
    }
    .config-title { flex: 1; font-weight: 600; font-size: 13px; color: #1e293b; }
    .config-body { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; }

    .config-section-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; color: #64748b; margin-bottom: -4px;
    }
    .section-divider { margin: 4px 0 8px !important; }

    .field-block { display: flex; flex-direction: column; gap: 6px; }
    .field-name {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 600; color: #374151;
    }
    .field-name mat-icon { font-size: 14px; width: 14px; height: 14px; color: #0284c7; }
    .remove-key-btn { width: 24px !important; height: 24px !important; line-height: 24px !important; margin-left: auto; }

    .source-toggle { display: flex; gap: 6px; }
    .source-toggle button { font-size: 11px; padding: 0 10px !important; height: 30px; }
    .active-source { background: #e0f2fe !important; color: #0284c7 !important; border-color: #0284c7 !important; }

    .full-width { width: 100%; }
    .from-step-row { display: flex; gap: 6px; }
    .step-select { flex: 1; }
    .field-input { flex: 1; }

    .add-field-row { display: flex; gap: 8px; align-items: flex-start; margin-top: 4px; }
    .add-key-input { flex: 1; }

    /* ── Body mode toggle ── */
    .body-mode-toggle {
      display: flex; gap: 6px; margin-bottom: 8px;
    }
    .body-mode-toggle button { font-size: 11px; padding: 0 10px !important; height: 30px; }

    /* ── Loop mode toggle ── */
    .loop-mode-toggle {
      display: flex; gap: 6px; margin-bottom: 12px;
    }
    .loop-mode-toggle button { font-size: 11px; padding: 0 10px !important; height: 30px; }
    .loop-foreach-info {
      display: flex; align-items: flex-start; gap: 6px;
      font-size: 11px; color: #64748b; margin: 4px 0 0;
      background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px;
      padding: 8px 10px;
    }
    .loop-foreach-info mat-icon {
      font-size: 14px; width: 14px; height: 14px; color: #0284c7; flex-shrink: 0; margin-top: 1px;
    }
    .raw-body-textarea { font-family: 'Fira Code', 'Consolas', monospace; font-size: 12px; line-height: 1.5; }
    .raw-body-wrapper { position: relative; }
    .generate-btn {
      margin-bottom: 8px; font-size: 12px; height: 32px;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .generate-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ac-overlay {
      position: absolute; z-index: 100; left: 12px; right: 12px;
      top: calc(100% - 24px);
      background: #fff; border: 1px solid #cbd5e1; border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,.12); max-height: 220px; overflow-y: auto;
      padding: 4px 0;
    }
    .ac-item {
      display: flex; align-items: center; gap: 8px; padding: 6px 12px;
      cursor: pointer; font-size: 12px; transition: background .1s;
    }
    .ac-item:hover, .ac-item--active { background: #eff6ff; }
    .ac-field-wrapper { position: relative; }
    .ac-overlay--panel {
      position: fixed; z-index: 1000;
      width: 320px;
      background: #fff; border: 1px solid #cbd5e1; border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,.15); max-height: 240px; overflow-y: auto;
      padding: 4px 0;
      pointer-events: auto;
    }
    .ac-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; }
    .ac-icon--data_object { color: #0284c7; }
    .ac-icon--link { color: #7c3aed; }
    .ac-text { display: flex; flex-direction: column; min-width: 0; }
    .ac-label { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
    .ac-detail { font-size: 10px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ac-type {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
      padding: 1px 5px; border-radius: 4px; flex-shrink: 0;
    }
    .ac-type--array   { background: #dbeafe; color: #1d4ed8; }
    .ac-type--object  { background: #fef3c7; color: #92400e; }
    .ac-type--string  { background: #dcfce7; color: #166534; }
    .ac-type--number  { background: #ede9fe; color: #5b21b6; }
    .ac-type--boolean { background: #fce7f3; color: #9d174d; }
    .form-view-embed {
      border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;
      background: #fafafa; margin-top: 4px;
    }
    .form-view-embed ::ng-deep .form-card { padding: 8px !important; }
    .form-view-embed ::ng-deep mat-card-header { display: none !important; }

    .no-config {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 32px 16px; color: #94a3b8; font-size: 12px; text-align: center;
    }
    .no-config mat-icon { font-size: 32px; width: 32px; height: 32px; }

    /* ── Method badges ── */
    .method-badge {
      padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700;
      letter-spacing: .04em; flex-shrink: 0;
    }
    .method-get    { background: #dcfce7; color: #15803d; }
    .method-post   { background: #dbeafe; color: #1d4ed8; }
    .method-put    { background: #fef9c3; color: #ca8a04; }
    .method-patch  { background: #ede9fe; color: #7c3aed; }
    .method-delete { background: #fee2e2; color: #dc2626; }

    /* ── Results button ── */
    .results-btn { color: #0284c7 !important; border-color: #0284c7 !important; }
    .share-url-chip {
      display: flex; align-items: center; gap: 4px; padding: 4px 10px;
      background: #dbeafe; color: #1d4ed8; border-radius: 6px; font-size: 11px;
      cursor: pointer; max-width: 260px; overflow: hidden;
    }
    .share-url-chip:hover { background: #bfdbfe; }
    .share-url-chip mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .share-url-chip span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .results-btn mat-icon { font-size: 18px; }

    /* ── Bottom result panel ── */
    .result-resize-handle {
      height: 6px; flex-shrink: 0; cursor: ns-resize;
      background: #e2e8f0; position: relative;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s;
    }
    .result-resize-handle:hover,
    .result-resize-handle:active { background: #bae6fd; }
    .resize-grip {
      width: 40px; height: 3px; border-radius: 2px;
      background: #94a3b8;
    }
    .result-resize-handle:hover .resize-grip { background: #0284c7; }

    .result-bottom {
      flex-shrink: 0; display: flex; flex-direction: column;
      border-top: 1px solid #e2e8f0;
      background: white; overflow: hidden;
      min-height: 0;
    }

    .result-bottom-header {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 16px; flex-shrink: 0;
      border-bottom: 1px solid #e2e8f0;
      background: #f0fdf4;
    }
    .result-bottom--fail .result-bottom-header { background: #fff1f2; }
    .result-status-icon { font-size: 20px; width: 20px; height: 20px; color: #16a34a !important; }
    .result-bottom--fail .result-status-icon { color: #dc2626 !important; }
    .result-bottom-title { flex: 1; font-size: 14px; font-weight: 700; color: #1e293b; }
    .result-step-counter {
      font-size: 11px; color: #64748b;
      background: #f1f5f9; padding: 2px 8px; border-radius: 99px;
    }

    .result-bottom-body {
      flex: 1; overflow-y: scroll; padding: 12px 16px;
      display: flex; flex-direction: column; gap: 10px;
      min-height: 0;
      scrollbar-width: thin;
      scrollbar-color: #94a3b8 #f1f5f9;
    }
    .result-bottom-body::-webkit-scrollbar { width: 10px; }
    .result-bottom-body::-webkit-scrollbar-thumb {
      background: #94a3b8; border-radius: 5px;
      border: 2px solid #f1f5f9;
    }
    .result-bottom-body::-webkit-scrollbar-thumb:hover { background: #64748b; }
    .result-bottom-body::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 5px; }

    .result-step {
      border: 1px solid #e2e8f0; border-radius: 10px;
      overflow: hidden; background: white;
      transition: border-color .15s;
      flex-shrink: 0;
    }
    .result-step:hover { border-color: #bae6fd; }
    .result-step--fail { border-color: #fecaca; }
    .result-step--fail:hover { border-color: #f87171; }

    .result-step-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
    }
    .result-step-header mat-icon { font-size: 18px; width: 18px; height: 18px; color: #16a34a; flex-shrink: 0; }
    .result-step--fail .result-step-header mat-icon { color: #dc2626; }
    .result-step-header strong { font-size: 13px; color: #1e293b; }

    .result-step-error {
      display: flex; align-items: flex-start; gap: 6px;
      padding: 8px 14px; background: #fff1f2;
      font-size: 12px; color: #dc2626;
    }
    .result-step-error mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; }

    .result-step-resp {
      margin: 0; padding: 10px 14px; font-size: 11px;
      background: #fafafa; overflow: auto;
      white-space: pre-wrap; word-break: break-all;
      font-family: 'Fira Code', 'Consolas', monospace;
      line-height: 1.5; color: #374151;
    }

    /* ── View toggle ── */
    .result-view-toggle {
      padding: 6px 14px; display: flex; align-items: center;
      border-bottom: 1px solid #f1f5f9;
    }
    .result-view-toggle mat-button-toggle-group {
      height: 28px; font-size: 11px;
    }
    .result-view-toggle mat-button-toggle { font-size: 11px; }
    .result-view-toggle mat-icon { font-size: 14px; width: 14px; height: 14px; margin-right: 4px; }
    .list-path-select {
      margin-left: 8px;
    }
    .list-path-select .mat-mdc-select { font-size: 11px; }
    .result-table-info {
      display: flex; align-items: center; gap: 4px;
      padding: 4px 10px; font-size: 11px; color: #64748b;
    }
    .result-table-info mat-icon { font-size: 14px; width: 14px; height: 14px; color: #94a3b8; }
    .result-empty-hint {
      padding: 12px; font-size: 12px; color: #94a3b8; font-style: italic; text-align: center; margin: 0;
    }
    .form-value--array, .form-value--obj {
      display: flex; align-items: center; gap: 4px; color: #64748b; font-size: 11px;
      max-height: 60px; overflow: hidden; text-overflow: ellipsis;
    }
    .form-type-icon { font-size: 14px; width: 14px; height: 14px; color: #94a3b8; flex-shrink: 0; }

    /* ── List / Table view ── */
    .result-list-view { padding: 0; overflow: auto; }
    .result-table {
      width: 100%; border-collapse: collapse; font-size: 11px;
    }
    .result-table th {
      position: sticky; top: 0; z-index: 1;
      background: #f1f5f9; padding: 6px 10px; text-align: left;
      font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }
    .result-table td {
      padding: 5px 10px; border-bottom: 1px solid #f1f5f9;
      color: #334155; max-width: 200px; overflow: hidden;
      text-overflow: ellipsis; white-space: nowrap;
    }
    .result-table tbody tr:hover td { background: #f8fafc; }
    .result-simple-list {
      margin: 0; padding: 8px 14px 8px 28px; font-size: 12px;
      color: #334155; list-style: disc;
    }
    .result-simple-list li { padding: 2px 0; }

    /* ── Form view ── */
    .result-form-view {
      padding: 8px 14px; display: flex; flex-direction: column; gap: 4px;
      overflow: auto;
    }
    .form-row {
      display: flex; gap: 12px; padding: 4px 0;
      border-bottom: 1px solid #f8fafc; font-size: 12px;
    }
    .form-row:last-child { border-bottom: none; }
    .form-label {
      min-width: 140px; max-width: 180px; font-weight: 600;
      color: #475569; flex-shrink: 0;
    }
    .form-value {
      color: #1e293b; word-break: break-all; flex: 1;
    }

    /* ── Control Flow browser section ── */
    .cf-section { border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .cf-section-label {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 12px 4px;
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #6d28d9;
    }
    .cf-section-label mat-icon { font-size: 14px; width: 14px; height: 14px; color: #6d28d9; }
    .cf-list { padding: 2px 8px 6px; display: flex; flex-direction: column; gap: 2px; }
    .cf-item { cursor: grab; }
    .cf-item-inner {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 8px; border-radius: 6px; border-left: 3px solid transparent;
      background: white; border: 1px solid #e9d5ff; font-size: 11px; color: #374151;
      transition: all .15s;
    }
    .cf-item-inner mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .cf-item-inner span { flex: 1; font-weight: 600; }
    .cf-item:hover .cf-item-inner { background: #faf5ff; border-color: #a78bfa; box-shadow: 0 1px 4px rgba(109,40,217,.12); }

    /* ── Block cards on canvas ── */
    .step-card--block .block-card {
      border: 1px solid #e2e8f0; border-radius: 10px;
      background: white; cursor: pointer;
      transition: border-color .15s, box-shadow .15s; overflow: hidden;
    }
    .step-card--selected .block-card { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,.2); }
    .block-card:hover { border-color: #a78bfa; box-shadow: 0 2px 8px rgba(124,58,237,.1); }

    .block-card--try { border-left: 3px solid #f59e0b !important; }
    .block-card--loop { border-left: 3px solid #8b5cf6 !important; }
    .block-card--ifelse { border-left: 3px solid #0284c7 !important; }
    .block-card--mapper { border-left: 3px solid #059669 !important; }
    .block-card--filter { border-left: 3px solid #dc2626 !important; }
    .block-card--sub-workflow { border-left: 3px solid #7c3aed !important; }

    .block-header {
      display: flex; align-items: center; gap: 8px; padding: 8px 12px;
    }
    .block-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    .block-title { flex: 1; font-size: 13px; font-weight: 600; color: #1e293b; }
    .block-badge {
      font-size: 9px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
      padding: 2px 7px; border-radius: 99px;
      background: #f1f5f9; color: #64748b;
    }
    .block-branches {
      display: flex; gap: 0; border-top: 1px solid #e2e8f0; background: #f8fafc;
    }
    .branch {
      flex: 1; display: flex; align-items: center; gap: 6px;
      padding: 5px 10px; font-size: 10px;
    }
    .branch + .branch { border-left: 1px solid #e2e8f0; }
    .branch-label { font-weight: 700; letter-spacing: .06em; }
    .branch-count { color: #64748b; }
    .branch--try .branch-label { color: #f59e0b; }
    .branch--catch .branch-label { color: #dc2626; }
    .branch--body .branch-label { color: #8b5cf6; }
    .branch--then .branch-label { color: #16a34a; }
    .branch--else .branch-label { color: #dc2626; }

    /* ── Block config in right panel ── */
    .branch-step-list { display: flex; flex-direction: column; gap: 4px; }
    .branch-step-item {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 8px; background: #f8fafc; border-radius: 6px;
      border: 1px solid #e2e8f0; font-size: 11px; cursor: pointer;
      transition: border-color .15s, background .15s;
    }
    .branch-step-item:hover { border-color: #a78bfa; background: #f5f3ff; }
    .branch-step-item span { flex: 1; }
    .branch-step-kind { font-size: 14px; width: 14px; height: 14px; color: #0284c7; }
    .branch-empty { font-size: 11px; color: #94a3b8; margin: 0; padding: 8px 0; }
    .add-inner-step-row { margin-top: 4px; }
    .add-inner-step-row mat-form-field { width: 100%; }
    .block-opt-icon { font-size: 18px; width: 18px; height: 18px; vertical-align: middle; margin-right: 4px; }

    /* ── Mapper preview on canvas card ── */
    .mapper-preview { padding: 4px 12px 8px; border-top: 1px solid #e2e8f0; }
    .mapper-preview-row {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: #475569; padding: 1px 0;
    }
    .mapper-arrow-icon { font-size: 14px; width: 14px; height: 14px; color: #059669; }
    .mapper-output-field { font-family: monospace; font-weight: 600; }

    /* ── Mapper config rows ── */
    .mapper-row {
      border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px;
      margin-bottom: 10px; background: #f8fafc;
    }
    .mapper-row-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;
    }
    .mapper-row-num { font-size: 11px; font-weight: 700; color: #059669; }
    .add-mapping-btn { margin-top: 4px; }

    /* CDK drag active */
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0,0,.2,1); }
    .step-list.cdk-drop-list-dragging .step-card:not(.cdk-drag-placeholder) { transition: transform 250ms cubic-bezier(0,0,.2,1); }

    /* ── Inline branch drop zones on canvas cards ── */
    .block-branches-expanded {
      display: flex; border-top: 1px solid #e2e8f0;
    }
    .branch-col {
      flex: 1; display: flex; flex-direction: column; min-width: 0;
    }
    .branch-col + .branch-col { border-left: 1px solid #e2e8f0; }
    .branch-col-header {
      display: flex; align-items: center; gap: 4px;
      padding: 3px 8px 2px; background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .branch-col-header .branch-label {
      font-size: 9px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase;
    }
    .branch-col-header .branch-count {
      font-size: 9px; color: #94a3b8; margin-left: auto;
    }
    .branch-col--try   .branch-col-header .branch-label { color: #d97706; }
    .branch-col--catch .branch-col-header .branch-label { color: #dc2626; }
    .branch-col--body  .branch-col-header .branch-label { color: #7c3aed; }
    .branch-col--then  .branch-col-header .branch-label { color: #16a34a; }
    .branch-col--else  .branch-col-header .branch-label { color: #dc2626; }

    .branch-drop {
      flex: 1; padding: 4px; min-height: 40px;
      display: flex; flex-direction: column; gap: 2px;
      transition: background .15s;
    }
    .branch-drop.cdk-drop-list-receiving {
      background: #eff6ff;
      outline: 2px dashed #7dd3fc;
      outline-offset: -2px;
      border-radius: 4px;
    }
    .branch-drop.cdk-drop-list-dragging {
      background: #f0fdf4;
    }
    .branch-drop-hint {
      font-size: 10px; color: #94a3b8; text-align: center;
      padding: 6px 4px; border-radius: 4px;
      border: 1px dashed #d1d5db; margin: 2px;
    }
    .inner-step {
      display: flex; align-items: center; gap: 4px;
      padding: 3px 4px 3px 6px; border-radius: 4px;
      background: white; border: 1px solid #e2e8f0;
      font-size: 10px; color: #374151; cursor: default;
    }
    .inner-step:hover { border-color: #93c5fd; background: #eff6ff; }
    .inner-step-icon { font-size: 12px; width: 12px; height: 12px; color: #0284c7; flex-shrink: 0; }
    .inner-step-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .inner-remove-btn {
      width: 20px !important; height: 20px !important; line-height: 20px !important; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .inner-remove-btn mat-icon { font-size: 12px; width: 12px; height: 12px; }
    .inner-drag-placeholder {
      height: 22px; border-radius: 4px;
      background: #dbeafe; border: 1px dashed #93c5fd;
    }
  `]
})
export class WorkflowBuilderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(WorkflowService);
  private readonly shareSvc = inject(ShareService);
  private readonly snack = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  // ── Workflow state ────────────────────────────────────────────────────────
  private workflowId: string | null = null;
  wfName = '';
  scheduledAt = '';
  newBodyKey = '';
  running = signal(false);
  runLog = signal<{ success: boolean; steps: { stepId: string; label: string; response?: unknown; error?: string; success: boolean }[] } | null>(null);
  resultPanelOpen = signal(false);
  resultPanelHeight = signal(220);
  private resizing = false;
  private resizeStartY = 0;
  private resizeStartH = 0;
  stepViewModes: Record<string, 'json' | 'list' | 'form'> = {};

  readonly steps = signal<WorkflowNode[]>([]);
  readonly wfInputs = signal<WorkflowInput[]>([]);
  readonly wfOutputs = signal<WorkflowOutput[]>([]);
  readonly ioPanelOpen = signal(false);
  readonly selectedStepId = signal<string | null>(null);
  readonly selectedStep = computed<WorkflowNode | null>(() => this.findNodeById(this.steps(), this.selectedStepId()));

  // ── Control flow panel items ───────────────────────────────────────────────
  readonly controlFlowItems: ControlFlowRef[] = [
    { kind: 'try-catch', label: 'Try / Catch', icon: 'shield',     color: '#f59e0b' },
    { kind: 'loop',      label: 'Loop',        icon: 'loop',       color: '#8b5cf6' },
    { kind: 'if-else',   label: 'If / Else',   icon: 'call_split', color: '#0284c7' },
    { kind: 'mapper',    label: 'Mapper',       icon: 'swap_horiz', color: '#059669' },
    { kind: 'filter',    label: 'Filter',       icon: 'filter_list', color: '#dc2626' },
    { kind: 'sub-workflow', label: 'Sub-Workflow', icon: 'account_tree', color: '#7c3aed' },
  ];

  // ── Browser state ─────────────────────────────────────────────────────────
  browserSearch = '';
  readonly expandedModules = signal<Set<string>>(new Set(MODULES.slice(0, 2).map(m => m.id)));

  readonly groupedEndpoints = computed(() => {
    const q = this.browserSearch.toLowerCase();
    return MODULES.map(mod => ({
      module: mod,
      endpoints: mod.endpoints
        .filter(ep => !q || ep.label.toLowerCase().includes(q) || mod.label.toLowerCase().includes(q))
        .map(ep => ({ module: mod, endpoint: ep } as EndpointRef)),
    })).filter(g => g.endpoints.length > 0);
  });

  readonly flatEndpoints = computed<EndpointRef[]>(() =>
    this.groupedEndpoints().flatMap(g => g.endpoints)
  );

  readonly previousSteps = computed(() => {
    const selId = this.selectedStepId();
    if (!selId) return [];
    // Top-level steps before the selected one (or its parent block)
    const topIdx = this.steps().findIndex(s => s.id === selId);
    if (topIdx >= 0) return this.steps().slice(0, topIdx);
    // Selected step is nested inside a block — include all top-level steps
    // up to and including the parent block
    const loop = this.parentLoop();
    if (loop) {
      const loopIdx = this.steps().findIndex(s => s.id === loop.id);
      return this.steps().slice(0, loopIdx + 1);
    }
    // Fallback: include all top-level steps
    return this.steps();
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.workflowId = id;
      const wf = this.svc.getById(id);
      if (wf) {
        this.wfName = wf.name;
        if (wf.scheduledAt) {
          // Format as local time for datetime-local input (not UTC via toISOString)
          const d = new Date(wf.scheduledAt);
          const pad = (n: number) => String(n).padStart(2, '0');
          this.scheduledAt = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } else {
          this.scheduledAt = '';
        }
        // Migrate legacy steps that lack a kind (old localStorage data)
        this.steps.set(wf.steps.map(s => ({
          ...s,
          kind: (s as WorkflowNode).kind ?? 'endpoint',
        })) as WorkflowNode[]);
        this.wfInputs.set(wf.inputs ?? []);
        this.wfOutputs.set(wf.outputs ?? []);
      }
    }
  }

  // ── Browser interactions ──────────────────────────────────────────────────
  toggleModule(id: string) {
    this.expandedModules.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── DnD ──────────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBrowserDrop(_event: CdkDragDrop<any>) {
    // Prevent items from being dragged back into browser – no-op
  }

  onCanvasDrop(event: CdkDragDrop<WorkflowNode[]>) {
    console.log('[workflow] onCanvasDrop', event.item.data);
    if (event.previousContainer === event.container) {
      // Reorder within canvas
      const arr = [...this.steps()];
      moveItemInArray(arr, event.previousIndex, event.currentIndex);
      this.steps.set(arr);
    } else if (this.isWorkflowNode(event.item.data)) {
      // Moved from a branch zone → canvas (cdkDropListGroup cross-container)
      const node = event.item.data as WorkflowNode;
      this.removeNodeFromContainer(event.previousContainer.id, node.id);
      const arr = [...this.steps()];
      arr.splice(event.currentIndex, 0, node);
      this.steps.set(arr);
      this.selectedStepId.set(node.id);
    } else {
      // From browser — EndpointRef or ControlFlowRef
      const data = event.item.data as EndpointRef | ControlFlowRef;
      let newNode: WorkflowNode;
      if ('kind' in data && data.kind !== undefined && !('endpoint' in data)) {
        newNode = this.makeBlock(data as ControlFlowRef);
      } else {
        newNode = this.makeStep(data as EndpointRef);
      }
      const arr = [...this.steps()];
      arr.splice(event.currentIndex, 0, newNode);
      this.steps.set(arr);
      this.selectedStepId.set(newNode.id);
    }
  }

  private makeStep(ref: EndpointRef): WorkflowStep {
    return {
      id: WorkflowService.newId(),
      kind: 'endpoint',
      moduleId: ref.module.id,
      moduleLabel: ref.module.label,
      moduleApiPrefix: ref.module.apiPrefix,
      endpointId: ref.endpoint.id,
      endpointLabel: ref.endpoint.label,
      method: ref.endpoint.method,
      pathTemplate: ref.endpoint.pathTemplate,
      pathParamNames: extractPathParams(ref.endpoint.pathTemplate),
      hasBody: ref.endpoint.hasBody ?? false,
      paramSources: {},
      bodyKeys: [],
      bodySources: {},
      ...this.autoFillPayload(ref.module.id, ref.endpoint.id, ref.endpoint.hasBody ?? false),
    };
  }

  private makeBlock(ref: ControlFlowRef): WorkflowNode {
    const id = WorkflowService.newId();
    if (ref.kind === 'try-catch') {
      return { id, kind: 'try-catch', trySteps: [], catchSteps: [] } as TryCatchBlock;
    } else if (ref.kind === 'loop') {
      return { id, kind: 'loop', loopCount: 1, bodySteps: [] } as LoopBlock;
    } else if (ref.kind === 'mapper') {
      return { id, kind: 'mapper', mappings: [] } as MapperBlock;
    } else if (ref.kind === 'filter') {
      return { id, kind: 'filter', filterOperator: '==' } as FilterBlock;
    } else if (ref.kind === 'sub-workflow') {
      return { id, kind: 'sub-workflow', inputBindings: {} } as SubWorkflowBlock;
    } else {
      return { id, kind: 'if-else', conditionOperator: '==', thenSteps: [], elseSteps: [] } as IfElseBlock;
    }
  }

  /** Drop handler for inner branch zones (try/catch/body/then/else). */
  onBranchDrop(event: CdkDragDrop<WorkflowNode[]>, blockId: string, branch: string) {
    if (event.previousContainer === event.container) {
      // Reorder within the same branch
      this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => {
        const blk = n as unknown as Record<string, unknown>;
        const arr = [...(blk[branch] as WorkflowNode[])];
        moveItemInArray(arr, event.previousIndex, event.currentIndex);
        return { ...n, [branch]: arr };
      }));
    } else if (this.isWorkflowNode(event.item.data)) {
      // Moved from canvas or another branch (cdkDropListGroup cross-container)
      const node = event.item.data as WorkflowNode;
      this.removeNodeFromContainer(event.previousContainer.id, node.id);
      this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => {
        const blk = n as unknown as Record<string, unknown>;
        const existing = [...((blk[branch] as WorkflowNode[]) ?? [])];
        existing.splice(event.currentIndex, 0, node);
        return { ...n, [branch]: existing };
      }));
    } else {
      // From browser — EndpointRef or ControlFlowRef
      const data = event.item.data as EndpointRef | ControlFlowRef;
      let newStep: WorkflowNode;
      if ('kind' in data && !('endpoint' in data)) {
        newStep = this.makeBlock(data as ControlFlowRef);
      } else {
        newStep = this.makeStep(data as EndpointRef);
      }
      this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => {
        const blk = n as unknown as Record<string, unknown>;
        const existing = [...((blk[branch] as WorkflowNode[]) ?? [])];
        existing.splice(event.currentIndex, 0, newStep);
        return { ...n, [branch]: existing };
      }));
    }
  }

  /** True when data is an already-existing WorkflowNode (not a browser ref). */
  private isWorkflowNode(data: unknown): data is WorkflowNode {
    return typeof data === 'object' && data !== null &&
      'id' in data && 'kind' in data &&
      !('module' in data) && !('color' in data);
  }

  /** Remove a node from wherever it currently lives (canvas or a branch). */
  private removeNodeFromContainer(containerId: string, nodeId: string) {
    if (containerId === 'workflowCanvas') {
      this.steps.update(ss => ss.filter(s => s.id !== nodeId));
    } else {
      // container IDs are 'block-{blockId}-(try|catch|body|then|else)'
      const match = containerId.match(/^block-(.+)-(try|catch|body|then|else)$/);
      if (!match) return;
      const [, blockId, suffix] = match;
      const branchMap: Record<string, string> = {
        try: 'trySteps', catch: 'catchSteps', body: 'bodySteps',
        then: 'thenSteps', else: 'elseSteps',
      };
      const branchKey = branchMap[suffix];
      if (!branchKey) return;
      this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => {
        const blk = n as unknown as Record<string, unknown>;
        return { ...n, [branchKey]: (blk[branchKey] as WorkflowNode[]).filter(nd => nd.id !== nodeId) };
      }));
    }
  }

  removeStep(id: string) {
    this.steps.update(ss => ss.filter(s => s.id !== id));
    if (this.selectedStepId() === id) this.selectedStepId.set(null);
  }

  selectStep(id: string) {
    this.selectedStepId.set(this.selectedStepId() === id ? null : id);
    this.newBodyKey = '';
  }

  /** Recursively find a node by ID across all nested branches. */
  private findNodeById(nodes: WorkflowNode[], id: string | null): WorkflowNode | null {
    if (!id) return null;
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.kind === 'try-catch') {
        const b = node as TryCatchBlock;
        const found = this.findNodeById(b.trySteps, id) ?? this.findNodeById(b.catchSteps, id);
        if (found) return found;
      } else if (node.kind === 'loop') {
        const found = this.findNodeById((node as LoopBlock).bodySteps, id);
        if (found) return found;
      } else if (node.kind === 'if-else') {
        const b = node as IfElseBlock;
        const found = this.findNodeById(b.thenSteps, id) ?? this.findNodeById(b.elseSteps, id);
        if (found) return found;
      }
    }
    return null;
  }

  /** Find the enclosing for-each loop block for a given step ID, if any. */
  private findParentLoop(nodes: WorkflowNode[], targetId: string): LoopBlock | null {
    for (const node of nodes) {
      if (node.kind === 'loop') {
        const loop = node as LoopBlock;
        if (loop.bodySteps.some(s => s.id === targetId)) return loop;
        const deeper = this.findParentLoop(loop.bodySteps, targetId);
        if (deeper) return deeper;
      } else if (node.kind === 'try-catch') {
        const b = node as TryCatchBlock;
        const found = this.findParentLoop(b.trySteps, targetId) ?? this.findParentLoop(b.catchSteps, targetId);
        if (found) return found;
      } else if (node.kind === 'if-else') {
        const b = node as IfElseBlock;
        const found = this.findParentLoop(b.thenSteps, targetId) ?? this.findParentLoop(b.elseSteps, targetId);
        if (found) return found;
      }
    }
    return null;
  }

  /** The parent for-each loop of the currently selected step (if any). */
  readonly parentLoop = computed<LoopBlock | null>(() => {
    const selId = this.selectedStepId();
    if (!selId) return null;
    return this.findParentLoop(this.steps(), selId);
  });

  getStepIndex(stepId: string): number {
    return this.steps().findIndex(s => s.id === stepId);
  }

  // ── Type cast helpers ─────────────────────────────────────────────────────
  asEndpoint(node: WorkflowNode): WorkflowStep  { return node as WorkflowStep; }
  asTryCatch(node: WorkflowNode): TryCatchBlock { return node as TryCatchBlock; }
  asLoop(node: WorkflowNode): LoopBlock         { return node as LoopBlock; }
  asIfElse(node: WorkflowNode): IfElseBlock     { return node as IfElseBlock; }
  asMapper(node: WorkflowNode): MapperBlock     { return node as MapperBlock; }
  asFilter(node: WorkflowNode): FilterBlock     { return node as FilterBlock; }
  asSubWorkflow(node: WorkflowNode): SubWorkflowBlock { return node as SubWorkflowBlock; }

  getNodeLabel(node: WorkflowNode): string {
    if (node.kind === 'endpoint') return (node as WorkflowStep).endpointLabel;
    if (node.kind === 'try-catch') return (node as TryCatchBlock).label || 'Try / Catch';
    if (node.kind === 'loop') return (node as LoopBlock).label || 'Loop';
    if (node.kind === 'if-else') return (node as IfElseBlock).label || 'If / Else';
    if (node.kind === 'mapper') return (node as MapperBlock).label || 'Mapper';
    if (node.kind === 'filter') return (node as FilterBlock).label || 'Filter';
    if (node.kind === 'sub-workflow') return (node as SubWorkflowBlock).label || (node as SubWorkflowBlock).workflowName || 'Sub-Workflow';
    return 'Step';
  }

  getStepLabel(node: WorkflowNode): string { return this.getNodeLabel(node); }

  readonly allEndpointRefs = computed<EndpointRef[]>(() =>
    MODULES.flatMap(mod => mod.endpoints.map(ep => ({ module: mod, endpoint: ep })))
  );

  /** All cdkDropList IDs that the browser panel can drop into (canvas + every branch zone). */
  /** Collect all branch drop-list IDs recursively so drag-drop works for nested blocks. */
  readonly allBranchDropIds = computed<string[]>(() => {
    const ids: string[] = ['workflowCanvas'];
    const collect = (nodes: WorkflowNode[]) => {
      for (const node of nodes) {
        if (node.kind === 'try-catch') {
          const b = node as TryCatchBlock;
          ids.push(`block-${node.id}-try`, `block-${node.id}-catch`);
          collect(b.trySteps); collect(b.catchSteps);
        } else if (node.kind === 'loop') {
          const b = node as LoopBlock;
          ids.push(`block-${node.id}-body`);
          collect(b.bodySteps);
        } else if (node.kind === 'if-else') {
          const b = node as IfElseBlock;
          ids.push(`block-${node.id}-then`, `block-${node.id}-else`);
          collect(b.thenSteps); collect(b.elseSteps);
        }
      }
    };
    collect(this.steps());
    return ids;
  });

  // ── Block mutation helpers ────────────────────────────────────────────────

  /** Recursively update a node by ID anywhere in the tree. */
  private updateNodeDeep(nodes: WorkflowNode[], id: string, fn: (n: WorkflowNode) => WorkflowNode): WorkflowNode[] {
    return nodes.map(n => {
      if (n.id === id) return fn(n);
      if (n.kind === 'try-catch') {
        const b = n as TryCatchBlock;
        return { ...b, trySteps: this.updateNodeDeep(b.trySteps, id, fn), catchSteps: this.updateNodeDeep(b.catchSteps, id, fn) };
      } else if (n.kind === 'loop') {
        const b = n as LoopBlock;
        return { ...b, bodySteps: this.updateNodeDeep(b.bodySteps, id, fn) };
      } else if (n.kind === 'if-else') {
        const b = n as IfElseBlock;
        return { ...b, thenSteps: this.updateNodeDeep(b.thenSteps, id, fn), elseSteps: this.updateNodeDeep(b.elseSteps, id, fn) };
      }
      return n;
    });
  }

  mutateBlock(id: string, value: unknown, field: string) {
    this.steps.update(ss => this.updateNodeDeep(ss, id, n => ({ ...n, [field]: value })));
  }

  /** Switch loop mode between 'count' and 'for-each' */
  setLoopMode(blockId: string, mode: LoopMode) {
    this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => ({ ...n, loopMode: mode })));
  }

  addToBranch(blockId: string, branch: string, ref: EndpointRef | ControlFlowRef) {
    const newNode = ('kind' in ref && !('endpoint' in ref))
      ? this.makeBlock(ref as ControlFlowRef)
      : this.makeStep(ref as EndpointRef);
    this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => {
      const blk = n as unknown as Record<string, unknown>;
      const existing = (blk[branch] as WorkflowNode[]) ?? [];
      return { ...n, [branch]: [...existing, newNode] };
    }));
  }

  removeFromBranch(blockId: string, branch: string, stepId: string) {
    this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => {
      const blk = n as unknown as Record<string, unknown>;
      const existing = (blk[branch] as WorkflowNode[]) ?? [];
      return { ...n, [branch]: existing.filter(c => (c as WorkflowNode).id !== stepId) };
    }));
  }

  // ── Mapper mapping helpers ────────────────────────────────────────────────
  addMapping(blockId: string) {
    this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => {
      const block = n as MapperBlock;
      const newMapping: FieldMapping = { outputField: '', source: { type: 'from-step', stepId: '', field: '' } };
      return { ...block, mappings: [...block.mappings, newMapping] };
    }));
  }

  removeMapping(blockId: string, index: number) {
    this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => {
      const block = n as MapperBlock;
      return { ...block, mappings: block.mappings.filter((_, i) => i !== index) };
    }));
  }

  updateMapping(blockId: string, index: number, field: string, value: string) {
    this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => {
      const block = n as MapperBlock;
      const mappings = block.mappings.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      );
      return { ...block, mappings };
    }));
  }

  updateMappingSource(blockId: string, index: number, stepId: string, field: string) {
    this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => {
      const block = n as MapperBlock;
      const mappings = block.mappings.map((m, i) =>
        i === index ? { ...m, source: { type: 'from-step' as const, stepId, field } } : m
      );
      return { ...block, mappings };
    }));
  }

  // ── Step config helpers ───────────────────────────────────────────────────
  private mutateStep(id: string, fn: (s: WorkflowStep) => WorkflowStep) {
    this.steps.update(ss => this.updateNodeDeep(ss, id, n => fn({ ...(n as WorkflowStep) })));
  }

  // Param sources
  // convenience accessor for the selected step as an endpoint step
  private selEp(): WorkflowStep | null {
    const s = this.selectedStep();
    return s?.kind === 'endpoint' ? (s as WorkflowStep) : null;
  }

  // Param sources
  getParamSourceType(param: string): 'hardcoded' | 'from-step' {
    return this.selEp()?.paramSources[param]?.type ?? 'hardcoded';
  }
  getParamValue(param: string): string {
    const s = this.selEp()?.paramSources[param];
    return s?.type === 'hardcoded' ? s.value : '';
  }
  getParamFromStepId(param: string): string {
    const s = this.selEp()?.paramSources[param];
    return s?.type === 'from-step' ? s.stepId : '';
  }
  getParamFromStepField(param: string): string {
    const s = this.selEp()?.paramSources[param];
    return s?.type === 'from-step' ? s.field : '';
  }

  setParamSourceType(param: string, type: 'hardcoded' | 'from-step') {
    const id = this.selectedStepId()!;
    const src: PayloadSource = type === 'hardcoded'
      ? { type: 'hardcoded', value: '' }
      : { type: 'from-step', stepId: '', field: '' };
    this.mutateStep(id, s => ({ ...s, paramSources: { ...s.paramSources, [param]: src } }));
  }
  setParamHardcoded(param: string, value: string) {
    const id = this.selectedStepId()!;
    this.mutateStep(id, s => ({
      ...s, paramSources: { ...s.paramSources, [param]: { type: 'hardcoded', value } },
    }));
  }
  setParamFromStepId(param: string, stepId: string) {
    const id = this.selectedStepId()!;
    this.mutateStep(id, s => {
      const old = s.paramSources[param];
      const field = old?.type === 'from-step' ? old.field : '';
      return { ...s, paramSources: { ...s.paramSources, [param]: { type: 'from-step', stepId, field } } };
    });
  }
  setParamFromStepField(param: string, field: string) {
    const id = this.selectedStepId()!;
    this.mutateStep(id, s => {
      const old = s.paramSources[param];
      const stepId = old?.type === 'from-step' ? old.stepId : '';
      return { ...s, paramSources: { ...s.paramSources, [param]: { type: 'from-step', stepId, field } } };
    });
  }

  // Body sources
  getBodySourceType(key: string): 'hardcoded' | 'from-step' {
    return this.selEp()?.bodySources[key]?.type ?? 'hardcoded';
  }
  getBodyValue(key: string): string {
    const s = this.selEp()?.bodySources[key];
    return s?.type === 'hardcoded' ? s.value : '';
  }
  getBodyFromStepId(key: string): string {
    const s = this.selEp()?.bodySources[key];
    return s?.type === 'from-step' ? s.stepId : '';
  }
  getBodyFromStepField(key: string): string {
    const s = this.selEp()?.bodySources[key];
    return s?.type === 'from-step' ? s.field : '';
  }

  setBodySourceType(key: string, type: 'hardcoded' | 'from-step') {
    const id = this.selectedStepId()!;
    const src: PayloadSource = type === 'hardcoded'
      ? { type: 'hardcoded', value: '' }
      : { type: 'from-step', stepId: '', field: '' };
    this.mutateStep(id, s => ({ ...s, bodySources: { ...s.bodySources, [key]: src } }));
  }
  setBodyHardcoded(key: string, value: string) {
    const id = this.selectedStepId()!;
    this.mutateStep(id, s => ({
      ...s, bodySources: { ...s.bodySources, [key]: { type: 'hardcoded', value } },
    }));
  }
  setBodyFromStepId(key: string, stepId: string) {
    const id = this.selectedStepId()!;
    this.mutateStep(id, s => {
      const old = s.bodySources[key];
      const field = old?.type === 'from-step' ? old.field : '';
      return { ...s, bodySources: { ...s.bodySources, [key]: { type: 'from-step', stepId, field } } };
    });
  }
  setBodyFromStepField(key: string, field: string) {
    const id = this.selectedStepId()!;
    this.mutateStep(id, s => {
      const old = s.bodySources[key];
      const stepId = old?.type === 'from-step' ? old.stepId : '';
      return { ...s, bodySources: { ...s.bodySources, [key]: { type: 'from-step', stepId, field } } };
    });
  }

  addBodyKey() {
    const key = this.newBodyKey.trim();
    if (!key) return;
    const id = this.selectedStepId()!;
    this.mutateStep(id, s => ({
      ...s,
      bodyKeys: s.bodyKeys.includes(key) ? s.bodyKeys : [...s.bodyKeys, key],
      bodySources: { ...s.bodySources, [key]: s.bodySources[key] ?? { type: 'hardcoded', value: '' } },
    }));
    this.newBodyKey = '';
  }
  removeBodyKey(key: string) {
    const id = this.selectedStepId()!;
    this.mutateStep(id, s => {
      const bodySources = { ...s.bodySources };
      delete bodySources[key];
      return { ...s, bodyKeys: s.bodyKeys.filter(k => k !== key), bodySources };
    });
  }

  // ── Body mode helpers (for POST / PUT / PATCH) ────────────────────────────
  getBodyMode(ep: WorkflowStep): BodyMode {
    return ep.bodyMode ?? 'fields';
  }

  setBodyMode(mode: BodyMode) {
    const id = this.selectedStepId()!;
    this.mutateStep(id, s => ({ ...s, bodyMode: mode }));
  }

  private readonly schemaService = inject(SchemaService);

  setRawBody(value: string) {
    const id = this.selectedStepId()!;
    this.mutateStep(id, s => ({ ...s, rawBody: value }));
  }

  // ── Autocomplete for step output references ────────────────────────────────
  acSuggestions = signal<AutocompleteSuggestion[]>([]);
  acSelectedIndex = signal(0);
  acOverlayStyle = signal<{ [key: string]: string }>({});
  private acInput: HTMLInputElement | HTMLTextAreaElement | null = null;
  private acCallback: ((value: string) => void) | null = null;
  /** 'json' = raw body textarea (field + value suggestions), 'ref' = any input (step ref suggestions only) */
  private acMode: 'json' | 'ref' = 'ref';
  /** Debounce timer for raw body updates (prevents change detection resetting textarea during typing) */
  private rawBodyTimer: ReturnType<typeof setTimeout> | null = null;

  /** Update the step's rawBody with debounce to prevent textarea flicker during typing */
  private setRawBodyDebounced(value: string) {
    if (this.rawBodyTimer) clearTimeout(this.rawBodyTimer);
    this.rawBodyTimer = setTimeout(() => {
      const id = this.selectedStepId();
      if (id) this.mutateStep(id, s => ({ ...s, rawBody: value }));
    }, 400);
  }

  private updateOverlayPosition(savedCursorPos?: number) {
    if (!this.acInput) return;
    const rect = this.acInput.getBoundingClientRect();

    // For textareas: estimate cursor Y from line number so overlay appears near the caret
    let top = rect.bottom + 4;
    if (this.acInput instanceof HTMLTextAreaElement) {
      const ta = this.acInput;
      const pos = savedCursorPos ?? ta.selectionStart ?? 0;
      const textBefore = ta.value.substring(0, pos);
      const lineNumber = textBefore.split('\n').length;
      const lineHeight = parseFloat(getComputedStyle(ta).lineHeight) || 18;
      const paddingTop = parseFloat(getComputedStyle(ta).paddingTop) || 8;
      top = rect.top + paddingTop + lineNumber * lineHeight + 4;
    }

    // Clamp so the overlay stays within the viewport
    const maxTop = window.innerHeight - 260;
    if (top > maxTop) top = maxTop;

    this.acOverlayStyle.set({
      top: top + 'px',
      left: rect.left + 'px',
      width: Math.max(rect.width, 280) + 'px',
    });
  }

  /** Build step output reference suggestions (used by all fields) */
  private buildStepRefSuggestions(filter: string): AutocompleteSuggestion[] {
    const suggestions: AutocompleteSuggestion[] = [];
    const prev = this.previousSteps();
    const log = this.runLog();
    for (const ps of prev) {
      const idx = this.getStepIndex(ps.id) + 1;
      const label = ps.kind === 'endpoint'
        ? `Step ${idx}: ${(ps as WorkflowStep).endpointLabel}`
        : `Step ${idx}: ${this.getNodeLabel(ps)}`;

      // Look up last-run response for this step
      const stepLog = log?.steps.find(sl => sl.stepId === ps.id);
      const resp = stepLog?.response;

      // Whole step output
      const ref = `{{steps.${idx}}}`;
      if (!filter || ref.toLowerCase().includes(filter.toLowerCase()) || label.toLowerCase().includes(filter.toLowerCase())) {
        // Show run-data type preview, or fall back to schema-derived label
        let stepDetail = label;
        let stepTypeHint = this.detectType(resp);
        if (resp != null) {
          stepDetail += this.typePreview(resp);
        } else if (ps.kind === 'endpoint') {
          const outLabel = getEndpointOutputLabel((ps as WorkflowStep).moduleId, (ps as WorkflowStep).endpointId);
          const outSchema = getEndpointOutputSchema((ps as WorkflowStep).moduleId, (ps as WorkflowStep).endpointId);
          if (outLabel) {
            stepDetail += ` — ${outLabel}`;
          }
          if (outSchema) {
            stepTypeHint = Array.isArray(outSchema) ? 'array' : 'object';
          }
        }
        suggestions.push({ label: `steps.${idx}`, insertText: ref, detail: stepDetail, icon: 'link', typeHint: stepTypeHint });
      }

      if (ps.kind === 'endpoint') {
        const step = ps as WorkflowStep;
        // Schema-derived sub-paths
        const stepFields = this.schemaService.getFields(step.moduleApiPrefix, step.endpointId);
        for (const f of stepFields) {
          const subRef = `{{steps.${idx}.${f.key}}}`;
          if (!filter || subRef.toLowerCase().includes(filter.toLowerCase()) || f.key.toLowerCase().includes(filter.toLowerCase())) {
            const subVal = resp != null ? this.resolvePath(resp, f.key) : undefined;
            suggestions.push({ label: `steps.${idx}.${f.key}`, insertText: subRef, detail: `${label} → ${f.key}${this.typePreview(subVal)}`, icon: 'link', typeHint: this.detectType(subVal) });
          }
        }

        // Output schema-derived sub-paths (when no schema service fields)
        if (stepFields.length === 0) {
          const outSchema = getEndpointOutputSchema(step.moduleId, step.endpointId);
          if (outSchema) {
            const schemaPaths = flattenSchemaKeys(outSchema);
            for (const sp of schemaPaths.slice(0, 15)) {
              const subRef = `{{steps.${idx}.${sp}}}`;
              if (suggestions.find(s => s.insertText === subRef)) continue;
              if (filter && !subRef.toLowerCase().includes(filter.toLowerCase()) && !sp.toLowerCase().includes(filter.toLowerCase())) continue;
              const subVal = resp != null ? this.resolvePath(resp, sp) : undefined;
              suggestions.push({ label: `steps.${idx}.${sp}`, insertText: subRef, detail: `${label} → ${sp}${this.typePreview(subVal)}`, icon: 'link', typeHint: this.detectType(subVal) });
            }
          }
        }
      }

      // Common response paths
      for (const common of ['data', 'data.id', 'data.name', 'id', 'message']) {
        const subRef = `{{steps.${idx}.${common}}}`;
        if (!filter || subRef.toLowerCase().includes(filter.toLowerCase()) || common.includes(filter.toLowerCase())) {
          if (!suggestions.find(s => s.insertText === subRef)) {
            const subVal = resp != null ? this.resolvePath(resp, common) : undefined;
            suggestions.push({ label: `steps.${idx}.${common}`, insertText: subRef, detail: `${label} → ${common}${this.typePreview(subVal)}`, icon: 'link', typeHint: this.detectType(subVal) });
          }
        }
      }
    }

    // ── Loop current-item suggestions ──────────────────────────────────────
    const loop = this.parentLoop();
    if (loop && loop.loopMode === 'for-each') {
      const loopIdx = this.getStepIndex(loop.id) + 1;
      const loopLabel = loop.label || `Step ${loopIdx}: Loop`;
      const loopLog = log?.steps.find(sl => sl.stepId === loop.id);

      // Resolve a sample item from the last-run array (first element)
      let sampleItem: unknown;
      if (loopLog?.response) {
        const arr = Array.isArray(loopLog.response) ? loopLog.response : [];
        sampleItem = arr[0];
      }

      // Whole current item
      const itemRef = `{{steps.${loopIdx}}}`;
      const itemLabel = `🔄 ${loopLabel} — current item`;
      if (!suggestions.find(s => s.insertText === itemRef)) {
        if (!filter || itemRef.toLowerCase().includes(filter.toLowerCase()) || 'current item'.includes(filter.toLowerCase())) {
          suggestions.unshift({ label: `loop item`, insertText: itemRef, detail: itemLabel + this.typePreview(sampleItem), icon: 'loop', typeHint: this.detectType(sampleItem) });
        }
      }

      // If sample item is an object, suggest its fields
      if (sampleItem && typeof sampleItem === 'object' && !Array.isArray(sampleItem)) {
        const keys = Object.keys(sampleItem as Record<string, unknown>);
        for (const key of keys.slice(0, 12)) {
          const fieldRef = `{{steps.${loopIdx}.${key}}}`;
          if (suggestions.find(s => s.insertText === fieldRef)) continue;
          if (filter && !fieldRef.toLowerCase().includes(filter.toLowerCase()) && !key.toLowerCase().includes(filter.toLowerCase())) continue;
          const fieldVal = (sampleItem as Record<string, unknown>)[key];
          suggestions.splice(1, 0, { label: `loop.${key}`, insertText: fieldRef, detail: `${itemLabel} → ${key}${this.typePreview(fieldVal)}`, icon: 'loop', typeHint: this.detectType(fieldVal) });
        }
      }
    }

    return suggestions.slice(0, 20);
  }

  /** Traverse dot-notation path on an object to get the raw value */
  private resolvePath(obj: unknown, path: string): unknown {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let cur: unknown = obj;
    for (const part of parts) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = (cur as Record<string, unknown>)[part];
    }
    return cur;
  }

  /** Detect the runtime type of a value */
  private detectType(v: unknown): 'array' | 'object' | 'string' | 'number' | 'boolean' | undefined {
    if (v === undefined || v === null) return undefined;
    if (Array.isArray(v)) return 'array';
    if (typeof v === 'object') return 'object';
    if (typeof v === 'number') return 'number';
    if (typeof v === 'boolean') return 'boolean';
    if (typeof v === 'string') return 'string';
    return undefined;
  }

  /** Build a short type preview for the detail text */
  private typePreview(v: unknown): string {
    if (v === undefined || v === null) return '';
    if (Array.isArray(v)) return ` — Array[${v.length}]`;
    if (typeof v === 'object') return ` — {${Object.keys(v).slice(0, 3).join(', ')}${Object.keys(v).length > 3 ? ', …' : ''}}`;
    if (typeof v === 'string') return v.length <= 30 ? ` — "${v}"` : ` — "${v.substring(0, 27)}…"`;
    return ` — ${v}`;
  }

  /** Build field + step-ref suggestions for the raw JSON body textarea */
  private buildJsonSuggestions(ep: WorkflowStep, trigger: 'field' | 'value', filter: string): AutocompleteSuggestion[] {
    if (trigger === 'field') {
      const suggestions: AutocompleteSuggestion[] = [];
      const fields = this.schemaService.getFields(ep.moduleApiPrefix, ep.endpointId);

      // Get payload template for type-aware defaults
      const payload = getEndpointPayload(ep.moduleId, ep.endpointId) as Record<string, unknown> | null;

      if (fields.length > 0) {
        for (const f of fields) {
          if (filter && !f.key.toLowerCase().includes(filter.toLowerCase())) continue;
          const templateVal = payload?.[f.key];
          const defaultVal = this.jsonDefaultValue(templateVal, f.type);
          suggestions.push({
            label: f.key,
            insertText: `"${f.key}": ${defaultVal}`,
            detail: `${f.type}${f.required ? ' (required)' : ''}`,
            icon: 'data_object',
            typeHint: templateVal !== undefined ? this.detectType(templateVal) : 'string',
          });
        }
      } else if (payload) {
        // Fallback: use payload template keys when schema is empty
        for (const [key, val] of Object.entries(payload)) {
          if (filter && !key.toLowerCase().includes(filter.toLowerCase())) continue;
          const defaultVal = this.jsonDefaultValue(val);
          const type = Array.isArray(val) ? 'array' : typeof val === 'object' && val !== null ? 'object'
            : typeof val === 'number' ? 'number' : typeof val === 'boolean' ? 'boolean' : 'string';
          suggestions.push({
            label: key,
            insertText: `"${key}": ${defaultVal}`,
            detail: type,
            icon: 'data_object',
            typeHint: type as AutocompleteSuggestion['typeHint'],
          });
        }
      }

      // Fallback: use input schema from endpoint-schemas config
      if (suggestions.length === 0) {
        const inputSchema = getEndpointInputSchema(ep.moduleId, ep.endpointId);
        if (inputSchema) {
          for (const [key, val] of Object.entries(inputSchema)) {
            if (filter && !key.toLowerCase().includes(filter.toLowerCase())) continue;
            const defaultVal = this.jsonDefaultValue(val);
            const type = Array.isArray(val) ? 'array' : typeof val === 'object' && val !== null ? 'object'
              : typeof val === 'number' ? 'number' : typeof val === 'boolean' ? 'boolean' : 'string';
            suggestions.push({
              label: key,
              insertText: `"${key}": ${defaultVal}`,
              detail: type + ' (schema)',
              icon: 'data_object',
              typeHint: type as AutocompleteSuggestion['typeHint'],
            });
          }
        }
      }

      // Last fallback: parse existing rawBody JSON for key suggestions
      if (suggestions.length === 0 && ep.rawBody) {
        try {
          const obj = JSON.parse(ep.rawBody);
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
              if (filter && !key.toLowerCase().includes(filter.toLowerCase())) continue;
              suggestions.push({
                label: key,
                insertText: `"${key}": ${this.jsonDefaultValue(val)}`,
                detail: typeof val === 'string' ? 'string' : typeof val === 'number' ? 'number' : 'object',
                icon: 'data_object',
              });
            }
          }
        } catch { /* not valid JSON yet, skip */ }
      }

      // Also add step ref suggestions for quick access
      if (this.previousSteps().length > 0) {
        const refs = this.buildStepRefSuggestions(filter);
        suggestions.push(...refs.slice(0, 5));
      }

      return suggestions.slice(0, 25);
    }

    // Value trigger — show step refs
    return this.buildStepRefSuggestions(filter);
  }

  /** Produce a sensible JSON default for insertion based on template value or field type */
  private jsonDefaultValue(templateVal?: unknown, fieldType?: string): string {
    if (templateVal !== undefined && templateVal !== null) {
      if (typeof templateVal === 'string') return '""';
      if (typeof templateVal === 'number') return '0';
      if (typeof templateVal === 'boolean') return 'false';
      if (Array.isArray(templateVal)) return JSON.stringify(templateVal, null, 2);
      if (typeof templateVal === 'object') return JSON.stringify(templateVal, null, 2);
    }
    if (fieldType === 'number') return '0';
    if (fieldType === 'boolean') return 'false';
    return '""';
  }

  /** Check for {{ trigger in an input value and show step ref suggestions */
  private checkRefTrigger(input: HTMLInputElement | HTMLTextAreaElement): boolean {
    const pos = input.selectionStart ?? 0;
    const textBefore = input.value.substring(0, pos);

    if (textBefore.endsWith('{{')) {
      this.acSuggestions.set(this.buildStepRefSuggestions(''));
      this.acSelectedIndex.set(0);
      return true;
    }

    const openIdx = textBefore.lastIndexOf('{{');
    const closeIdx = textBefore.lastIndexOf('}}');
    if (openIdx > closeIdx && openIdx >= 0) {
      const partial = textBefore.substring(openIdx + 2);
      this.acSuggestions.set(this.buildStepRefSuggestions(partial));
      this.acSelectedIndex.set(0);
      return true;
    }

    return false;
  }

  /** Auto-fill rawBody + bodyKeys/bodySources from endpoint-payloads when creating a step */
  private autoFillPayload(moduleId: string, endpointId: string, hasBody: boolean): Partial<WorkflowStep> {
    if (!hasBody) return {};
    const payload = getEndpointPayload(moduleId, endpointId);
    if (!payload || typeof payload !== 'object') return {};
    const rawBody = JSON.stringify(payload, null, 2);
    const keys = Object.keys(payload as Record<string, unknown>);
    const bodySources: Record<string, PayloadSource> = {};
    for (const key of keys) {
      const val = (payload as Record<string, unknown>)[key];
      bodySources[key] = { type: 'hardcoded', value: typeof val === 'string' ? val : JSON.stringify(val) };
    }
    return { rawBody, bodyMode: 'text' as BodyMode, bodyKeys: keys, bodySources };
  }

  /** Generate the default JSON template for the current endpoint step */
  generateWfTextTemplate() {
    const step = this.selectedStep();
    if (!step || step.kind !== 'endpoint') return;
    const ep = step as WorkflowStep;
    const payload = getEndpointPayload(ep.moduleId, ep.endpointId);
    if (payload && typeof payload === 'object') {
      const json = JSON.stringify(payload, null, 2);
      this.setRawBody(json);
    }
  }

  // ── Raw body textarea (JSON mode) handlers ────────────────────────────────

  /** Detect context from cursor position and show suggestions */
  onRawBodyInput(textarea: HTMLTextAreaElement) {
    const cursorPos = textarea.selectionStart ?? 0;
    const fullText = textarea.value;

    this.acInput = textarea;
    this.acCallback = (v: string) => this.setRawBody(v);
    this.acMode = 'json';

    // Debounce the signal update so Angular doesn't run change detection
    // and re-render (reset) the textarea while the user is typing
    this.setRawBodyDebounced(fullText);
    this.updateOverlayPosition(cursorPos);

    const textBefore = fullText.substring(0, cursorPos);

    // Check {{ trigger first
    if (textBefore.endsWith('{{')) {
      this.acSuggestions.set(this.buildStepRefSuggestions(''));
      this.acSelectedIndex.set(0);
      return;
    }
    const openIdx = textBefore.lastIndexOf('{{');
    const closeIdx = textBefore.lastIndexOf('}}');
    if (openIdx > closeIdx && openIdx >= 0) {
      const partial = textBefore.substring(openIdx + 2);
      this.acSuggestions.set(this.buildStepRefSuggestions(partial));
      this.acSelectedIndex.set(0);
      return;
    }

    const lineStart = textBefore.lastIndexOf('\n') + 1;
    const line = textBefore.substring(lineStart).trimStart();

    // Check if typing a JSON key (cursor inside key before colon)
    if (line.startsWith('"') && !line.includes(':')) {
      const partial = line.substring(1).replace(/"$/, '');
      const ep = this.selectedStep() as WorkflowStep | undefined;
      if (ep?.kind === 'endpoint') {
        this.acSuggestions.set(this.buildJsonSuggestions(ep, 'field', partial));
        this.acSelectedIndex.set(0);
      }
      return;
    }

    // Check if typing a JSON value (cursor after colon) → show step ref suggestions
    const colonMatch = line.match(/^"[^"]+"\s*:\s*"?(.*)$/);
    if (colonMatch) {
      const ep = this.selectedStep() as WorkflowStep | undefined;
      if (ep?.kind === 'endpoint' && this.previousSteps().length > 0) {
        const partial = colonMatch[1];
        const suggestions = this.buildStepRefSuggestions(partial);
        if (suggestions.length > 0) {
          this.acSuggestions.set(suggestions);
          this.acSelectedIndex.set(0);
          return;
        }
      }
    }

    this.acSuggestions.set([]);
  }

  // ── Generic field input handlers (path params, body values, loop, if-else, mapper) ──

  onAcFieldInput(input: HTMLInputElement, callback: (value: string) => void) {
    this.acInput = input;
    this.acCallback = callback;
    this.acMode = 'ref';
    callback(input.value);
    this.updateOverlayPosition();

    if (this.previousSteps().length === 0 && !this.parentLoop()) { this.acSuggestions.set([]); return; }
    if (!this.checkRefTrigger(input)) {
      this.acSuggestions.set([]);
    }
  }

  onAcKeydown(event: KeyboardEvent) {
    const suggestions = this.acSuggestions();
    if (suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.acSelectedIndex.update(i => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.acSelectedIndex.update(i => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      this.insertSuggestion(suggestions[this.acSelectedIndex()]);
    } else if (event.key === 'Escape') {
      this.acSuggestions.set([]);
    }
  }

  insertSuggestion(suggestion: AutocompleteSuggestion, event?: MouseEvent) {
    if (event) event.preventDefault();
    const input = this.acInput;
    if (!input) { this.acSuggestions.set([]); return; }

    const pos = input.selectionStart ?? 0;
    const text = input.value;
    const before = text.substring(0, pos);

    if (suggestion.icon === 'link') {
      // Step reference — replace from {{ onwards, or insert at cursor if no {{ found
      const openIdx = before.lastIndexOf('{{');
      const closeIdx = before.lastIndexOf('}}');
      if (openIdx >= 0 && openIdx > closeIdx) {
        const afterCursor = text.substring(pos);
        const closeMatch = afterCursor.match(/^[^}]*}}/);
        const replaceEnd = closeMatch ? pos + closeMatch[0].length : pos;
        const newText = text.substring(0, openIdx) + suggestion.insertText + text.substring(replaceEnd);
        input.value = newText;
        const cursorPos = openIdx + suggestion.insertText.length;
        input.setSelectionRange(cursorPos, cursorPos);
      } else {
        // No {{ in text — insert the full token at cursor position
        // If cursor is inside quotes (after : "...), replace partial text to end of value
        const lineStart = before.lastIndexOf('\n') + 1;
        const lineText = before.substring(lineStart);
        const colonQuoteMatch = lineText.match(/^(\s*"[^"]+"\s*:\s*")(.*)$/);
        if (colonQuoteMatch) {
          const insertAt = lineStart + colonQuoteMatch[1].length;
          const afterCursor = text.substring(pos);
          // Find closing quote of the value
          const closeQuoteIdx = afterCursor.indexOf('"');
          const replaceEnd = closeQuoteIdx >= 0 ? pos + closeQuoteIdx : pos;
          const newText = text.substring(0, insertAt) + suggestion.insertText + text.substring(replaceEnd);
          input.value = newText;
          const cursorPos = insertAt + suggestion.insertText.length;
          input.setSelectionRange(cursorPos, cursorPos);
        } else {
          // Fallback: just insert at cursor
          const newText = before + suggestion.insertText + text.substring(pos);
          input.value = newText;
          const cursorPos = pos + suggestion.insertText.length;
          input.setSelectionRange(cursorPos, cursorPos);
        }
      }
    } else if (this.acMode === 'json') {
      // JSON field suggestion — smart insertion based on context
      const lineStart = before.lastIndexOf('\n') + 1;
      const lineText = before.substring(lineStart);
      const quoteIdx = lineText.indexOf('"');
      if (quoteIdx >= 0) {
        const replaceFrom = lineStart + quoteIdx;
        const afterCursor = text.substring(pos);
        // Check if the rest of the line already has ": <value>" (existing key-value line)
        const hasExistingColon = /^\s*"?\s*:/.test(afterCursor.split('\n')[0] ?? '');

        if (hasExistingColon) {
          // Only replace the key portion (from opening " to just before the closing " or :)
          // Find the end of the current key: next unescaped " after cursor, or the : 
          const restOfLine = afterCursor.split('\n')[0] ?? '';
          const keyEndMatch = restOfLine.match(/^[^"]*"/);
          const replaceEnd = keyEndMatch ? pos + keyEndMatch[0].length : pos;
          // Extract just the key name from insertText (strip surrounding quotes and `: value`)
          const keyOnly = suggestion.label;
          const newText = text.substring(0, replaceFrom) + '"' + keyOnly + '"' + text.substring(replaceEnd);
          input.value = newText;
          const cursorPos = replaceFrom + keyOnly.length + 2; // after closing "
          input.setSelectionRange(cursorPos, cursorPos);
        } else {
          // Fresh line — insert full "key": defaultValue
          const insertText = suggestion.insertText.includes(': ') ? suggestion.insertText : suggestion.insertText + ': ';
          const newText = text.substring(0, replaceFrom) + insertText + text.substring(pos);
          input.value = newText;
          const cursorPos = replaceFrom + insertText.length;
          input.setSelectionRange(cursorPos, cursorPos);
        }
      }
    }

    if (this.acCallback) {
      // Cancel debounce and save immediately
      if (this.rawBodyTimer) { clearTimeout(this.rawBodyTimer); this.rawBodyTimer = null; }
      const savedPos = input.selectionStart ?? 0;
      this.acCallback(input.value);
      // Restore cursor after Angular change detection may reset it via [value] binding
      input.setSelectionRange(savedPos, savedPos);
    }
    this.acSuggestions.set([]);
    input.focus();
  }

  closeAutocomplete() {
    // Flush any pending debounced rawBody update
    if (this.rawBodyTimer && this.acInput) {
      clearTimeout(this.rawBodyTimer);
      this.rawBodyTimer = null;
      const id = this.selectedStepId();
      if (id) this.mutateStep(id, s => ({ ...s, rawBody: this.acInput!.value }));
    }
    setTimeout(() => { this.acSuggestions.set([]); this.acInput = null; }, 150);
  }

  // ── AC callback wrappers for each field type ──────────────────────────────
  acSetParamHardcoded(param: string, value: string) { this.setParamHardcoded(param, value); }
  acSetParamFromStepField(param: string, value: string) { this.setParamFromStepField(param, value); }
  acSetBodyHardcoded(key: string, value: string) { this.setBodyHardcoded(key, value); }
  acSetBodyFromStepField(key: string, value: string) { this.setBodyFromStepField(key, value); }
  acMutateBlock(blockId: string, field: string, value: string) { this.mutateBlock(blockId, value, field); }
  acUpdateMappingOutput(blockId: string, index: number, value: string) { this.updateMapping(blockId, index, 'outputField', value); }
  acUpdateMappingField(blockId: string, index: number, m: FieldMapping, value: string) {
    const stepId = m.source.type === 'from-step' ? m.source.stepId : '';
    this.updateMappingSource(blockId, index, stepId, value);
  }

  /** Resolve the EndpointDef from MODULES for a step so FormViewComponent can use it */
  getEndpointDef(ep: WorkflowStep): EndpointDef | null {
    const mod = MODULES.find(m => m.id === ep.moduleId);
    return mod?.endpoints.find(e => e.id === ep.endpointId) ?? null;
  }

  /** Convert the step's rawBody JSON into initialValues for FormViewComponent */
  getFormInitialValues(ep: WorkflowStep): Record<string, string> {
    if (!ep.rawBody) return {};
    try {
      const parsed = JSON.parse(ep.rawBody);
      const vals: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        vals['body.' + k] = typeof v === 'string' ? v : JSON.stringify(v);
      }
      return vals;
    } catch {
      return {};
    }
  }

  /** Build step ref suggestions for the FormViewComponent autocomplete */
  getStepRefSuggestions(): StepRefSuggestion[] {
    return this.buildStepRefSuggestions('').map(s => ({
      label: s.label,
      insertText: s.insertText,
      detail: s.detail,
      typeHint: s.typeHint,
    }));
  }

  // ── Summary chip helper ───────────────────────────────────────────────────
  getSourceSummary(step: WorkflowStep, key: string, area: 'param' | 'body'): string {
    const src = area === 'param' ? step.paramSources[key] : step.bodySources[key];
    if (!src) return '?';
    if (src.type === 'hardcoded') return src.value || '?';
    const idx = this.steps().findIndex(s => s.id === src.stepId);
    return `step${idx + 1}.${src.field || '?'}`;
  }

  // ── I/O management ────────────────────────────────────────────────────────

  addInput() {
    this.wfInputs.update(arr => [...arr, { name: '', defaultValue: '' }]);
  }
  removeInput(i: number) {
    this.wfInputs.update(arr => arr.filter((_, idx) => idx !== i));
  }
  updateInput(i: number, field: 'name' | 'defaultValue', value: string) {
    this.wfInputs.update(arr => arr.map((inp, idx) => idx === i ? { ...inp, [field]: value } : inp));
  }

  addOutput() {
    this.wfOutputs.update(arr => [...arr, { name: '', source: { type: 'from-step', stepId: '', field: '' } }]);
  }
  removeOutput(i: number) {
    this.wfOutputs.update(arr => arr.filter((_, idx) => idx !== i));
  }
  updateOutput(i: number, field: 'name', value: string) {
    this.wfOutputs.update(arr => arr.map((o, idx) => idx === i ? { ...o, [field]: value } : o));
  }
  setOutputSourceStep(i: number, stepId: string) {
    this.wfOutputs.update(arr => arr.map((o, idx) =>
      idx === i ? { ...o, source: { type: 'from-step' as const, stepId, field: o.source.type === 'from-step' ? o.source.field : '' } } : o
    ));
  }
  setOutputSourceField(i: number, field: string) {
    this.wfOutputs.update(arr => arr.map((o, idx) =>
      idx === i && o.source.type === 'from-step' ? { ...o, source: { ...o.source, field } } : o
    ));
  }

  // ── Sub-workflow helpers ──────────────────────────────────────────────────

  /** Workflows that can be used as sub-workflows (all except current) */
  readonly availableSubWorkflows = computed(() =>
    this.svc.workflows().filter(w => w.id !== this.workflowId)
  );

  setSubWorkflowTarget(blockId: string, workflowId: string) {
    const wf = this.svc.getById(workflowId);
    this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => ({
      ...n,
      workflowId,
      workflowName: wf?.name ?? '',
      inputBindings: {},
    })));
  }

  getSubWorkflowInputDefs(workflowId: string | undefined): WorkflowInput[] {
    if (!workflowId) return [];
    return this.svc.getById(workflowId)?.inputs ?? [];
  }

  getSubWorkflowInputNames(workflowId: string | undefined): string[] {
    return this.getSubWorkflowInputDefs(workflowId).map(i => i.name).filter(Boolean);
  }

  getSubWorkflowOutputNames(workflowId: string | undefined): string[] {
    if (!workflowId) return [];
    return (this.svc.getById(workflowId)?.outputs ?? []).map(o => o.name).filter(Boolean);
  }

  getSubWfBindingType(block: SubWorkflowBlock, inputName: string): 'hardcoded' | 'from-step' {
    return block.inputBindings[inputName]?.type ?? 'hardcoded';
  }
  getSubWfBindingValue(block: SubWorkflowBlock, inputName: string): string {
    const b = block.inputBindings[inputName];
    return b?.type === 'hardcoded' ? b.value : '';
  }
  getSubWfBindingStepId(block: SubWorkflowBlock, inputName: string): string {
    const b = block.inputBindings[inputName];
    return b?.type === 'from-step' ? b.stepId : '';
  }
  getSubWfBindingField(block: SubWorkflowBlock, inputName: string): string {
    const b = block.inputBindings[inputName];
    return b?.type === 'from-step' ? b.field : '';
  }

  setSubWfBindingType(blockId: string, inputName: string, type: 'hardcoded' | 'from-step') {
    const src: PayloadSource = type === 'hardcoded'
      ? { type: 'hardcoded', value: '' }
      : { type: 'from-step', stepId: '', field: '' };
    this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => ({
      ...n,
      inputBindings: { ...(n as SubWorkflowBlock).inputBindings, [inputName]: src },
    })));
  }
  setSubWfBindingHardcoded(blockId: string, inputName: string, value: string) {
    this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => ({
      ...n,
      inputBindings: { ...(n as SubWorkflowBlock).inputBindings, [inputName]: { type: 'hardcoded' as const, value } },
    })));
  }
  setSubWfBindingStep(blockId: string, inputName: string, stepId: string) {
    this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => {
      const existing = (n as SubWorkflowBlock).inputBindings[inputName];
      const field = existing?.type === 'from-step' ? existing.field : '';
      return { ...n, inputBindings: { ...(n as SubWorkflowBlock).inputBindings, [inputName]: { type: 'from-step' as const, stepId, field } } };
    }));
  }
  setSubWfBindingField(blockId: string, inputName: string, field: string) {
    this.steps.update(ss => this.updateNodeDeep(ss, blockId, n => {
      const existing = (n as SubWorkflowBlock).inputBindings[inputName];
      const stepId = existing?.type === 'from-step' ? existing.stepId : '';
      return { ...n, inputBindings: { ...(n as SubWorkflowBlock).inputBindings, [inputName]: { type: 'from-step' as const, stepId, field } } };
    }));
  }

  // ── Save / Run ────────────────────────────────────────────────────────────
  save() {
    if (!this.wfName.trim()) {
      this.snack.open('Please enter a workflow name', '', { duration: 2500 });
      return;
    }
    const now = new Date().toISOString();
    const id = this.workflowId ?? WorkflowService.newId();
    const scheduledAt = this.scheduledAt ? new Date(this.scheduledAt).toISOString() : null;
    const wf: Workflow = {
      id,
      name: this.wfName.trim(),
      inputs: this.wfInputs(),
      outputs: this.wfOutputs(),
      steps: this.steps(),
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt,
      createdAt: now,
      updatedAt: now,
    };
    this.svc.upsert(wf);
    this.workflowId = id;
    this.snack.open(`Workflow "${wf.name}" saved (${wf.status})`, '', { duration: 2000 });
  }

  async runNow() {
    // Auto-save first
    const name = this.wfName.trim() || 'Untitled';
    this.wfName = name;
    this.save();
    const id = this.workflowId!;

    this.running.set(true);
    this.runLog.set(null);
    try {
      const log = await this.svc.execute(id);
      this.runLog.set(log);
      this.resultPanelOpen.set(true);
    } catch (e) {
      this.snack.open(`Execution error: ${e}`, '', { duration: 4000 });
    } finally {
      this.running.set(false);
    }
  }

  /* ── Result view helpers ──────────────────────────────────────────────── */
  isArray(v: unknown): boolean { return Array.isArray(v); }
  isObject(v: unknown): boolean { return v !== null && typeof v === 'object'; }
  objectKeys(v: unknown): string[] { return v && typeof v === 'object' ? Object.keys(v) : []; }
  asArray(v: unknown): unknown[] { return Array.isArray(v) ? v : []; }
  asRecord(v: unknown): Record<string, unknown> { return (v && typeof v === 'object' ? v : {}) as Record<string, unknown>; }

  /** Render any cell value as text (handles nested objects/arrays gracefully) */
  cellText(v: unknown): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }

  /** Find top-level keys whose value is an array (for the list path selector) */
  getArrayPaths(response: unknown): string[] {
    if (Array.isArray(response)) return [];
    if (!response || typeof response !== 'object') return [];
    return Object.entries(response as Record<string, unknown>)
      .filter(([, v]) => Array.isArray(v))
      .map(([k]) => k);
  }

  private stepListPaths: Record<string, string> = {};

  getListPath(stepId: string): string {
    if (this.stepListPaths[stepId]) return this.stepListPaths[stepId];
    // auto-detect first array prop
    const step = this.runLog()?.steps.find(s => s.stepId === stepId);
    if (step?.response) {
      if (Array.isArray(step.response)) return '';
      const paths = this.getArrayPaths(step.response);
      return paths[0] ?? '';
    }
    return '';
  }

  setListPath(stepId: string, path: string) { this.stepListPaths[stepId] = path; }

  /** Resolve the rows to show in list mode (handles both direct arrays and object-wrapped arrays) */
  getListRows(stepId: string, response: unknown): unknown[] {
    if (Array.isArray(response)) return response;
    if (!response || typeof response !== 'object') return [];
    const path = this.getListPath(stepId);
    if (!path) {
      // auto-detect: pick first array property
      const entry = Object.values(response as Record<string, unknown>).find(v => Array.isArray(v));
      return Array.isArray(entry) ? entry : [];
    }
    const val = (response as Record<string, unknown>)[path];
    return Array.isArray(val) ? val : [];
  }

  /** Resolve entries for form view (handles both objects and first-element-of-array) */
  getFormEntries(response: unknown): { key: string; value: unknown }[] {
    let obj: Record<string, unknown>;
    if (Array.isArray(response)) {
      if (response.length === 0) return [];
      const first = response[0];
      if (first && typeof first === 'object' && !Array.isArray(first)) {
        obj = first as Record<string, unknown>;
      } else {
        return [{ key: '0', value: first }];
      }
    } else if (response && typeof response === 'object') {
      obj = response as Record<string, unknown>;
    } else {
      return [];
    }
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }

  getViewMode(stepId: string): string {
    if (this.stepViewModes[stepId]) return this.stepViewModes[stepId];
    const step = this.runLog()?.steps.find(s => s.stepId === stepId);
    if (step?.response !== undefined && step.response !== null) {
      if (Array.isArray(step.response)) return 'list';
      if (typeof step.response === 'object') {
        // If the object contains arrays, default to list; otherwise form
        const hasArray = Object.values(step.response as Record<string, unknown>).some(v => Array.isArray(v));
        return hasArray ? 'list' : 'form';
      }
    }
    return 'json';
  }

  setViewMode(stepId: string, mode: string) {
    this.stepViewModes[stepId] = mode as 'json' | 'list' | 'form';
  }

  /* ── Resize bottom panel ─────────────────────────────────────────────── */
  onResizeStart(e: MouseEvent) {
    e.preventDefault();
    this.resizing = true;
    this.resizeStartY = e.clientY;
    this.resizeStartH = this.resultPanelHeight();

    const onMove = (ev: MouseEvent) => {
      if (!this.resizing) return;
      const delta = this.resizeStartY - ev.clientY;
      const next = Math.max(100, Math.min(this.resizeStartH + delta, window.innerHeight - 200));
      this.resultPanelHeight.set(next);
      this.cdr.markForCheck();
    };
    const onUp = () => {
      this.resizing = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ── Share ─────────────────────────────────────────────────────────────────

  readonly shareUrl = signal<string>('');

  hasWorkflowId(): boolean { return !!this.workflowId; }

  async shareWorkflow() {
    if (!this.workflowId) return;
    try {
      const links = await this.shareSvc.createShare('workflow', this.workflowId);
      if (links.length > 0) {
        this.shareUrl.set(this.shareSvc.getShareUrl(links[0].token));
      }
    } catch { /* ignore */ }
  }

  copyShareUrl() {
    const url = this.shareUrl();
    if (url) navigator.clipboard.writeText(url);
  }
}
