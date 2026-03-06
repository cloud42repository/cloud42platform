import {
  Component, OnInit, signal, computed, inject, ViewChild, ElementRef,
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
import {
  CdkDragDrop, DragDropModule, moveItemInArray,
} from '@angular/cdk/drag-drop';

import { MODULES, ModuleDef, EndpointDef, extractPathParams } from '../../config/endpoints';
import { WorkflowService } from '../../services/workflow.service';
import {
  Workflow, WorkflowNode, WorkflowStep, TryCatchBlock, LoopBlock, IfElseBlock, PayloadSource, StepKind,
} from '../../config/workflow.types';

interface EndpointRef { module: ModuleDef; endpoint: EndpointDef; }
interface ControlFlowRef { kind: 'try-catch' | 'loop' | 'if-else'; label: string; icon: string; color: string; }

@Component({
  selector: 'app-workflow-builder',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatTooltipModule, MatChipsModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatDividerModule, MatRadioModule,
    DragDropModule,
  ],
  template: `
    <!-- ── Top bar ──────────────────────────────────────────────────────── -->
    <div class="topbar">
      <button mat-icon-button routerLink="/workflows" matTooltip="Back to workflows">
        <mat-icon>arrow_back</mat-icon>
      </button>

      <mat-form-field appearance="outline" class="name-field" subscriptSizing="dynamic">
        <mat-label>Workflow name</mat-label>
        <mat-icon matPrefix>account_tree</mat-icon>
        <input matInput [(ngModel)]="wfName" placeholder="My workflow" />
      </mat-form-field>

      <div class="topbar-actions">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="schedule-field">
          <mat-label>Schedule at</mat-label>
          <mat-icon matPrefix>schedule</mat-icon>
          <input matInput type="datetime-local" [(ngModel)]="scheduledAt" />
          @if (scheduledAt) {
            <button matSuffix mat-icon-button (click)="scheduledAt = ''" matTooltip="Clear schedule">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
        <button mat-stroked-button (click)="save()">
          <mat-icon>save</mat-icon> Save
        </button>
        <button mat-flat-button color="primary"
                (click)="runNow()"
                [disabled]="steps().length === 0 || running()">
          @if (running()) { <mat-spinner diameter="16" /> }
          @else { <mat-icon>play_arrow</mat-icon> }
          Run now
        </button>
      </div>
    </div>

    <!-- ── Three-panel layout ────────────────────────────────────────────── -->
    <div class="builder-layout">

      <!-- LEFT: endpoint browser ─────────────────────────────────────────── -->
      <div class="browser-panel">
        <div class="browser-header">
          <mat-icon>api</mat-icon>
          <span>Endpoints</span>
        </div>
        <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="browserSearch" placeholder="Search…" />
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
            <span>Control Flow</span>
          </div>
          <div class="cf-list"
               cdkDropList
               id="controlFlowList"
               [cdkDropListData]="controlFlowItems"
               [cdkDropListConnectedTo]="['workflowCanvas']"
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
             [cdkDropListConnectedTo]="['workflowCanvas']"
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
      <div class="canvas-panel">
        <div class="canvas-header">
          <mat-icon>account_tree</mat-icon>
          <span>Workflow Steps</span>
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
            <p>Drag endpoints or control-flow blocks here</p>
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
                      @if (step.pathParamNames.length > 0 || step.bodyKeys.length > 0) {
                        <div class="step-config-summary">
                          @for (p of step.pathParamNames; track p) {
                            <span class="cfg-chip" [class.cfg-chip--set]="step.paramSources[p]?.type === 'hardcoded' ? $any(step.paramSources[p])?.value : true">
                              :{{ p }}={{ getSourceSummary(step, p, 'param') }}
                            </span>
                          }
                          @for (k of step.bodyKeys; track k) {
                            <span class="cfg-chip cfg-chip--body">
                              {{ k }}={{ getSourceSummary(step, k, 'body') }}
                            </span>
                          }
                        </div>
                      }
                    </div>
                    <div class="step-card-actions" (click)="$event.stopPropagation()">
                      <button mat-icon-button (click)="selectStep(node.id)" matTooltip="Configure step">
                        <mat-icon>settings</mat-icon>
                      </button>
                      <button mat-icon-button (click)="removeStep(node.id)" color="warn" matTooltip="Remove step">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                      <mat-icon class="drag-handle" cdkDragHandle matTooltip="Drag to reorder">drag_indicator</mat-icon>
                    </div>
                  </div>
                }

                <!-- ── TRY / CATCH BLOCK ── -->
                @if (node.kind === 'try-catch') {
                  @let block = asTryCatch(node);
                  <div class="block-card block-card--try" (click)="selectStep(node.id)">
                    <div class="block-header">
                      <mat-icon class="block-icon">shield</mat-icon>
                      <span class="block-title">{{ block.label || 'Try / Catch' }}</span>
                      <span class="block-badge">try·catch</span>
                      <div class="step-card-actions" (click)="$event.stopPropagation()">
                        <button mat-icon-button (click)="selectStep(node.id)" matTooltip="Configure">
                          <mat-icon>settings</mat-icon>
                        </button>
                        <button mat-icon-button (click)="removeStep(node.id)" color="warn" matTooltip="Remove">
                          <mat-icon>delete_outline</mat-icon>
                        </button>
                        <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                      </div>
                    </div>
                    <div class="block-branches">
                      <div class="branch branch--try">
                        <span class="branch-label">TRY</span>
                        <span class="branch-count">{{ block.trySteps.length }} step{{ block.trySteps.length !== 1 ? 's' : '' }}</span>
                      </div>
                      <div class="branch branch--catch">
                        <span class="branch-label">CATCH</span>
                        <span class="branch-count">{{ block.catchSteps.length }} step{{ block.catchSteps.length !== 1 ? 's' : '' }}</span>
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
                      <span class="block-title">{{ block.label || 'Loop' }}</span>
                      <span class="block-badge">loop × {{ block.loopCount ?? 1 }}</span>
                      <div class="step-card-actions" (click)="$event.stopPropagation()">
                        <button mat-icon-button (click)="selectStep(node.id)" matTooltip="Configure">
                          <mat-icon>settings</mat-icon>
                        </button>
                        <button mat-icon-button (click)="removeStep(node.id)" color="warn" matTooltip="Remove">
                          <mat-icon>delete_outline</mat-icon>
                        </button>
                        <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                      </div>
                    </div>
                    <div class="block-branches">
                      <div class="branch branch--body">
                        <span class="branch-label">BODY</span>
                        <span class="branch-count">{{ block.bodySteps.length }} step{{ block.bodySteps.length !== 1 ? 's' : '' }}</span>
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
                      <span class="block-title">{{ block.label || 'If / Else' }}</span>
                      <span class="block-badge">if·else</span>
                      <div class="step-card-actions" (click)="$event.stopPropagation()">
                        <button mat-icon-button (click)="selectStep(node.id)" matTooltip="Configure">
                          <mat-icon>settings</mat-icon>
                        </button>
                        <button mat-icon-button (click)="removeStep(node.id)" color="warn" matTooltip="Remove">
                          <mat-icon>delete_outline</mat-icon>
                        </button>
                        <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                      </div>
                    </div>
                    <div class="block-branches">
                      <div class="branch branch--then">
                        <span class="branch-label">THEN</span>
                        <span class="branch-count">{{ block.thenSteps.length }} step{{ block.thenSteps.length !== 1 ? 's' : '' }}</span>
                      </div>
                      <div class="branch branch--else">
                        <span class="branch-label">ELSE</span>
                        <span class="branch-count">{{ block.elseSteps.length }} step{{ block.elseSteps.length !== 1 ? 's' : '' }}</span>
                      </div>
                    </div>
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
              <span class="config-title">{{ asTryCatch(selectedStep()!).label || 'Try / Catch' }}</span>
            } @else if (selectedStep()!.kind === 'loop') {
              <mat-icon style="color:#8b5cf6">loop</mat-icon>
              <span class="config-title">{{ asLoop(selectedStep()!).label || 'Loop' }}</span>
            } @else if (selectedStep()!.kind === 'if-else') {
              <mat-icon style="color:#0284c7">call_split</mat-icon>
              <span class="config-title">{{ asIfElse(selectedStep()!).label || 'If / Else' }}</span>
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
                <div class="config-section-label">Path Parameters</div>
                @for (param of ep.pathParamNames; track param) {
                  <div class="field-block">
                    <div class="field-name"><mat-icon>tag</mat-icon><code>:{{ param }}</code></div>
                    <div class="source-toggle">
                      <button mat-stroked-button [class.active-source]="getParamSourceType(param) === 'hardcoded'" (click)="setParamSourceType(param, 'hardcoded')">
                        <mat-icon>text_fields</mat-icon> Hardcoded
                      </button>
                      <button mat-stroked-button [class.active-source]="getParamSourceType(param) === 'from-step'" [disabled]="previousSteps().length === 0" (click)="setParamSourceType(param, 'from-step')" matTooltip="{{ previousSteps().length === 0 ? 'No previous steps' : 'Use a previous step response' }}">
                        <mat-icon>link</mat-icon> From step
                      </button>
                    </div>
                    @if (getParamSourceType(param) === 'hardcoded') {
                      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                        <mat-label>Value for :{{ param }}</mat-label>
                        <input matInput [value]="getParamValue(param)" (input)="setParamHardcoded(param, $any($event.target).value)" placeholder="e.g. my-account-id" />
                      </mat-form-field>
                    }
                    @if (getParamSourceType(param) === 'from-step') {
                      <div class="from-step-row">
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="step-select">
                          <mat-label>From step</mat-label>
                          <mat-select [value]="getParamFromStepId(param)" (selectionChange)="setParamFromStepId(param, $event.value)">
                            @for (ps of previousSteps(); track ps.id) {
                              <mat-option [value]="ps.id">{{ getStepIndex(ps.id) + 1 }}. {{ getNodeLabel(ps) }}</mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="field-input">
                          <mat-label>Field path</mat-label>
                          <input matInput [value]="getParamFromStepField(param)" (input)="setParamFromStepField(param, $any($event.target).value)" placeholder="e.g. data.0.id" />
                          <mat-hint>Dot-notation path into response</mat-hint>
                        </mat-form-field>
                      </div>
                    }
                  </div>
                }
              }

              <!-- Body fields -->
              @if (ep.hasBody) {
                <mat-divider class="section-divider" />
                <div class="config-section-label">Request Body</div>
                @for (key of ep.bodyKeys; track key) {
                  <div class="field-block">
                    <div class="field-name">
                      <mat-icon>data_object</mat-icon><code>{{ key }}</code>
                      <button mat-icon-button class="remove-key-btn" (click)="removeBodyKey(key)" matTooltip="Remove field"><mat-icon>remove_circle_outline</mat-icon></button>
                    </div>
                    <div class="source-toggle">
                      <button mat-stroked-button [class.active-source]="getBodySourceType(key) === 'hardcoded'" (click)="setBodySourceType(key, 'hardcoded')">
                        <mat-icon>text_fields</mat-icon> Hardcoded
                      </button>
                      <button mat-stroked-button [class.active-source]="getBodySourceType(key) === 'from-step'" [disabled]="previousSteps().length === 0" (click)="setBodySourceType(key, 'from-step')" matTooltip="{{ previousSteps().length === 0 ? 'No previous steps' : 'Use a previous step response' }}">
                        <mat-icon>link</mat-icon> From step
                      </button>
                    </div>
                    @if (getBodySourceType(key) === 'hardcoded') {
                      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                        <mat-label>Value for {{ key }}</mat-label>
                        <input matInput [value]="getBodyValue(key)" (input)="setBodyHardcoded(key, $any($event.target).value)" placeholder="Value…" />
                      </mat-form-field>
                    }
                    @if (getBodySourceType(key) === 'from-step') {
                      <div class="from-step-row">
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="step-select">
                          <mat-label>From step</mat-label>
                          <mat-select [value]="getBodyFromStepId(key)" (selectionChange)="setBodyFromStepId(key, $event.value)">
                            @for (ps of previousSteps(); track ps.id) {
                              <mat-option [value]="ps.id">{{ getStepIndex(ps.id) + 1 }}. {{ getNodeLabel(ps) }}</mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="field-input">
                          <mat-label>Field path</mat-label>
                          <input matInput [value]="getBodyFromStepField(key)" (input)="setBodyFromStepField(key, $any($event.target).value)" placeholder="e.g. id" />
                          <mat-hint>Dot-notation path into response</mat-hint>
                        </mat-form-field>
                      </div>
                    }
                  </div>
                }
                <div class="add-field-row">
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                    <mat-label>Field name</mat-label>
                    <input matInput #newKeyInput [(ngModel)]="newBodyKey" placeholder="e.g. name" (keydown.enter)="addBodyKey()" />
                  </mat-form-field>
                  <button mat-stroked-button (click)="addBodyKey()" [disabled]="!newBodyKey.trim()">
                    <mat-icon>add</mat-icon> Add
                  </button>
                </div>
              }

              @if (!ep.hasBody && ep.pathParamNames.length === 0) {
                <div class="no-config">
                  <mat-icon>check_circle_outline</mat-icon>
                  <p>This endpoint has no parameters to configure.</p>
                </div>
              }
            }

            <!-- ── TRY / CATCH CONFIG ─────────────────────────────────────── -->
            @if (selectedStep()!.kind === 'try-catch') {
              @let block = asTryCatch(selectedStep()!);
              <div class="config-section-label">Label</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>Block label (optional)</mat-label>
                <input matInput [value]="block.label ?? ''" (input)="mutateBlock(block.id, $any($event.target).value, 'label')" placeholder="e.g. Fetch and handle errors" />
              </mat-form-field>

              <mat-divider class="section-divider" />
              <div class="config-section-label">Try Steps</div>
              <div class="branch-step-list">
                @for (s of block.trySteps; track s.id) {
                  <div class="branch-step-item">
                    <mat-icon class="branch-step-kind">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                    <span>{{ getNodeLabel(s) }}</span>
                    <button mat-icon-button (click)="removeFromBranch(block.id, 'trySteps', s.id)" matTooltip="Remove"><mat-icon>remove_circle_outline</mat-icon></button>
                  </div>
                }
                @if (block.trySteps.length === 0) { <p class="branch-empty">No steps — drag endpoints from browser</p> }
              </div>
              <div class="add-inner-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                  <mat-label>Add endpoint to Try</mat-label>
                  <mat-select (selectionChange)="addToBranch(block.id, 'trySteps', $event.value); $event.source.writeValue(null)">
                    @for (ref of allEndpointRefs(); track ref.endpoint.id) {
                      <mat-option [value]="ref">{{ ref.module.label }} › {{ ref.endpoint.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>

              <mat-divider class="section-divider" />
              <div class="config-section-label">Catch Steps</div>
              <div class="branch-step-list">
                @for (s of block.catchSteps; track s.id) {
                  <div class="branch-step-item">
                    <mat-icon class="branch-step-kind">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                    <span>{{ getNodeLabel(s) }}</span>
                    <button mat-icon-button (click)="removeFromBranch(block.id, 'catchSteps', s.id)" matTooltip="Remove"><mat-icon>remove_circle_outline</mat-icon></button>
                  </div>
                }
                @if (block.catchSteps.length === 0) { <p class="branch-empty">No steps — add below</p> }
              </div>
              <div class="add-inner-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                  <mat-label>Add endpoint to Catch</mat-label>
                  <mat-select (selectionChange)="addToBranch(block.id, 'catchSteps', $event.value); $event.source.writeValue(null)">
                    @for (ref of allEndpointRefs(); track ref.endpoint.id) {
                      <mat-option [value]="ref">{{ ref.module.label }} › {{ ref.endpoint.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            }

            <!-- ── LOOP CONFIG ────────────────────────────────────────────── -->
            @if (selectedStep()!.kind === 'loop') {
              @let block = asLoop(selectedStep()!);
              <div class="config-section-label">Label</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>Block label (optional)</mat-label>
                <input matInput [value]="block.label ?? ''" (input)="mutateBlock(block.id, $any($event.target).value, 'label')" placeholder="e.g. Process each record" />
              </mat-form-field>

              <mat-divider class="section-divider" />
              <div class="config-section-label">Loop settings</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>Repeat count</mat-label>
                <input matInput type="number" min="1" [value]="block.loopCount ?? 1"
                       (input)="mutateBlock(block.id, +$any($event.target).value || 1, 'loopCount')" />
                <mat-hint>Number of times to repeat the body steps</mat-hint>
              </mat-form-field>

              <mat-divider class="section-divider" />
              <div class="config-section-label">Body Steps</div>
              <div class="branch-step-list">
                @for (s of block.bodySteps; track s.id) {
                  <div class="branch-step-item">
                    <mat-icon class="branch-step-kind">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                    <span>{{ getNodeLabel(s) }}</span>
                    <button mat-icon-button (click)="removeFromBranch(block.id, 'bodySteps', s.id)" matTooltip="Remove"><mat-icon>remove_circle_outline</mat-icon></button>
                  </div>
                }
                @if (block.bodySteps.length === 0) { <p class="branch-empty">No steps — add below</p> }
              </div>
              <div class="add-inner-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                  <mat-label>Add endpoint to Body</mat-label>
                  <mat-select (selectionChange)="addToBranch(block.id, 'bodySteps', $event.value); $event.source.writeValue(null)">
                    @for (ref of allEndpointRefs(); track ref.endpoint.id) {
                      <mat-option [value]="ref">{{ ref.module.label }} › {{ ref.endpoint.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            }

            <!-- ── IF / ELSE CONFIG ───────────────────────────────────────── -->
            @if (selectedStep()!.kind === 'if-else') {
              @let block = asIfElse(selectedStep()!);
              <div class="config-section-label">Label</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>Block label (optional)</mat-label>
                <input matInput [value]="block.label ?? ''" (input)="mutateBlock(block.id, $any($event.target).value, 'label')" placeholder="e.g. Check balance" />
              </mat-form-field>

              <mat-divider class="section-divider" />
              <div class="config-section-label">Condition</div>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>From step</mat-label>
                <mat-select [value]="block.conditionStepId ?? ''" (selectionChange)="mutateBlock(block.id, $event.value, 'conditionStepId')">
                  @for (ps of previousSteps(); track ps.id) {
                    <mat-option [value]="ps.id">{{ getStepIndex(ps.id) + 1 }}. {{ getNodeLabel(ps) }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
                <mat-label>Field path</mat-label>
                <input matInput [value]="block.conditionField ?? ''" (input)="mutateBlock(block.id, $any($event.target).value, 'conditionField')" placeholder="e.g. data.status" />
              </mat-form-field>
              <div class="from-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="step-select">
                  <mat-label>Operator</mat-label>
                  <mat-select [value]="block.conditionOperator ?? '=='" (selectionChange)="mutateBlock(block.id, $event.value, 'conditionOperator')">
                    <mat-option value="==">== equals</mat-option>
                    <mat-option value="!=">!= not equals</mat-option>
                    <mat-option value=">">> greater than</mat-option>
                    <mat-option value="<">{{ '<' }} less than</mat-option>
                    <mat-option value="contains">contains</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="field-input">
                  <mat-label>Value</mat-label>
                  <input matInput [value]="block.conditionValue ?? ''" (input)="mutateBlock(block.id, $any($event.target).value, 'conditionValue')" placeholder="e.g. active" />
                </mat-form-field>
              </div>

              <mat-divider class="section-divider" />
              <div class="config-section-label">Then Steps</div>
              <div class="branch-step-list">
                @for (s of block.thenSteps; track s.id) {
                  <div class="branch-step-item">
                    <mat-icon class="branch-step-kind">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                    <span>{{ getNodeLabel(s) }}</span>
                    <button mat-icon-button (click)="removeFromBranch(block.id, 'thenSteps', s.id)" matTooltip="Remove"><mat-icon>remove_circle_outline</mat-icon></button>
                  </div>
                }
                @if (block.thenSteps.length === 0) { <p class="branch-empty">No steps — add below</p> }
              </div>
              <div class="add-inner-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                  <mat-label>Add endpoint to Then</mat-label>
                  <mat-select (selectionChange)="addToBranch(block.id, 'thenSteps', $event.value); $event.source.writeValue(null)">
                    @for (ref of allEndpointRefs(); track ref.endpoint.id) {
                      <mat-option [value]="ref">{{ ref.module.label }} › {{ ref.endpoint.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>

              <mat-divider class="section-divider" />
              <div class="config-section-label">Else Steps</div>
              <div class="branch-step-list">
                @for (s of block.elseSteps; track s.id) {
                  <div class="branch-step-item">
                    <mat-icon class="branch-step-kind">{{ s.kind === 'endpoint' ? 'api' : 'device_hub' }}</mat-icon>
                    <span>{{ getNodeLabel(s) }}</span>
                    <button mat-icon-button (click)="removeFromBranch(block.id, 'elseSteps', s.id)" matTooltip="Remove"><mat-icon>remove_circle_outline</mat-icon></button>
                  </div>
                }
                @if (block.elseSteps.length === 0) { <p class="branch-empty">No steps — add below</p> }
              </div>
              <div class="add-inner-step-row">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-key-input">
                  <mat-label>Add endpoint to Else</mat-label>
                  <mat-select (selectionChange)="addToBranch(block.id, 'elseSteps', $event.value); $event.source.writeValue(null)">
                    @for (ref of allEndpointRefs(); track ref.endpoint.id) {
                      <mat-option [value]="ref">{{ ref.module.label }} › {{ ref.endpoint.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            }

          </div>
        </div>
      }
    </div>

    <!-- ── Run result ─────────────────────────────────────────────────────── -->
    @if (runLog()) {
      <div class="run-result" [class.run-result--fail]="!runLog()!.success">
        <div class="run-result-header">
          <mat-icon>{{ runLog()!.success ? 'check_circle' : 'error' }}</mat-icon>
          <span>{{ runLog()!.success ? 'Workflow completed successfully' : 'Workflow failed' }}</span>
          <button mat-icon-button (click)="runLog.set(null)"><mat-icon>close</mat-icon></button>
        </div>
        <div class="run-steps">
          @for (sl of runLog()!.steps; track sl.stepId) {
            <div class="run-step" [class.run-step--fail]="!sl.success">
              <mat-icon>{{ sl.success ? 'check' : 'close' }}</mat-icon>
              <strong>{{ sl.label }}</strong>
              @if (sl.error) { <span class="run-error">{{ sl.error }}</span> }
              @if (sl.response) {
                <pre class="run-resp">{{ sl.response | json }}</pre>
              }
            </div>
          }
        </div>
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

    /* ── Layout ── */
    .builder-layout {
      display: flex; flex: 1; overflow: hidden; gap: 0;
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

    /* ── Run result ── */
    .run-result {
      flex-shrink: 0; border-top: 1px solid #e2e8f0;
      max-height: 260px; overflow-y: auto;
      background: #f0fdf4;
    }
    .run-result--fail { background: #fff1f2; }
    .run-result-header {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; font-size: 13px; font-weight: 600;
      position: sticky; top: 0; background: inherit; border-bottom: 1px solid #e2e8f0;
    }
    .run-result-header mat-icon { color: #16a34a !important; }
    .run-result--fail .run-result-header mat-icon { color: #dc2626 !important; }
    .run-steps { padding: 8px 12px; display: flex; flex-direction: column; gap: 6px; }
    .run-step {
      display: flex; align-items: flex-start; gap: 6px; font-size: 12px;
      padding: 4px 0;
    }
    .run-step mat-icon { font-size: 16px; flex-shrink: 0; color: #16a34a; }
    .run-step--fail mat-icon { color: #dc2626; }
    .run-error { color: #dc2626; flex: 1; }
    .run-resp {
      margin: 4px 0 0; width: 100%; font-size: 10px; background: rgba(0,0,0,.04);
      padding: 4px 6px; border-radius: 4px; max-height: 80px; overflow: auto;
      white-space: pre-wrap; word-break: break-all;
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
      border: 1px solid #e2e8f0; font-size: 11px;
    }
    .branch-step-item span { flex: 1; }
    .branch-step-kind { font-size: 14px; width: 14px; height: 14px; color: #0284c7; }
    .branch-empty { font-size: 11px; color: #94a3b8; margin: 0; padding: 8px 0; }
    .add-inner-step-row { margin-top: 4px; }
    .add-inner-step-row mat-form-field { width: 100%; }

    /* CDK drag active */
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0,0,.2,1); }
    .step-list.cdk-drop-list-dragging .step-card:not(.cdk-drag-placeholder) { transition: transform 250ms cubic-bezier(0,0,.2,1); }
  `]
})
export class WorkflowBuilderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(WorkflowService);
  private readonly snack = inject(MatSnackBar);

  // ── Workflow state ────────────────────────────────────────────────────────
  private workflowId: string | null = null;
  wfName = '';
  scheduledAt = '';
  newBodyKey = '';
  running = signal(false);
  runLog = signal<{ success: boolean; steps: { stepId: string; label: string; response?: unknown; error?: string; success: boolean }[] } | null>(null);

  readonly steps = signal<WorkflowNode[]>([]);
  readonly selectedStepId = signal<string | null>(null);
  readonly selectedStep = computed<WorkflowNode | null>(() => this.steps().find(s => s.id === this.selectedStepId()) ?? null);

  // ── Control flow panel items ───────────────────────────────────────────────
  readonly controlFlowItems: ControlFlowRef[] = [
    { kind: 'try-catch', label: 'Try / Catch', icon: 'shield',     color: '#f59e0b' },
    { kind: 'loop',      label: 'Loop',        icon: 'loop',       color: '#8b5cf6' },
    { kind: 'if-else',   label: 'If / Else',   icon: 'call_split', color: '#0284c7' },
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
    const idx = this.steps().findIndex(s => s.id === selId);
    return this.steps().slice(0, idx);
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.workflowId = id;
      const wf = this.svc.getById(id);
      if (wf) {
        this.wfName = wf.name;
        this.scheduledAt = wf.scheduledAt
          ? new Date(wf.scheduledAt).toISOString().slice(0, 16)
          : '';
        // Migrate legacy steps that lack a kind (old localStorage data)
        this.steps.set(wf.steps.map(s => ({
          ...s,
          kind: (s as WorkflowNode).kind ?? 'endpoint',
        })) as WorkflowNode[]);
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
    if (event.previousContainer === event.container) {
      const arr = [...this.steps()];
      moveItemInArray(arr, event.previousIndex, event.currentIndex);
      this.steps.set(arr);
    } else {
      // Coming from browser — could be EndpointRef or ControlFlowRef
      const data = event.item.data as EndpointRef | ControlFlowRef;
      let newNode: WorkflowNode;
      if ('kind' in data && data.kind !== undefined && !('endpoint' in data)) {
        // It's a ControlFlowRef
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
    };
  }

  private makeBlock(ref: ControlFlowRef): WorkflowNode {
    const id = WorkflowService.newId();
    if (ref.kind === 'try-catch') {
      return { id, kind: 'try-catch', trySteps: [], catchSteps: [] } as TryCatchBlock;
    } else if (ref.kind === 'loop') {
      return { id, kind: 'loop', loopCount: 1, bodySteps: [] } as LoopBlock;
    } else {
      return { id, kind: 'if-else', conditionOperator: '==', thenSteps: [], elseSteps: [] } as IfElseBlock;
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

  getStepIndex(stepId: string): number {
    return this.steps().findIndex(s => s.id === stepId);
  }

  // ── Type cast helpers ─────────────────────────────────────────────────────
  asEndpoint(node: WorkflowNode): WorkflowStep  { return node as WorkflowStep; }
  asTryCatch(node: WorkflowNode): TryCatchBlock { return node as TryCatchBlock; }
  asLoop(node: WorkflowNode): LoopBlock         { return node as LoopBlock; }
  asIfElse(node: WorkflowNode): IfElseBlock     { return node as IfElseBlock; }

  getNodeLabel(node: WorkflowNode): string {
    if (node.kind === 'endpoint') return (node as WorkflowStep).endpointLabel;
    if (node.kind === 'try-catch') return (node as TryCatchBlock).label || 'Try / Catch';
    if (node.kind === 'loop') return (node as LoopBlock).label || 'Loop';
    if (node.kind === 'if-else') return (node as IfElseBlock).label || 'If / Else';
    return 'Step';
  }

  readonly allEndpointRefs = computed<EndpointRef[]>(() =>
    MODULES.flatMap(mod => mod.endpoints.map(ep => ({ module: mod, endpoint: ep })))
  );

  // ── Block mutation helpers ────────────────────────────────────────────────
  mutateBlock(id: string, value: unknown, field: string) {
    this.steps.update(ss => ss.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  }

  addToBranch(blockId: string, branch: string, ref: EndpointRef) {
    const newStep = this.makeStep(ref);
    this.steps.update(ss => ss.map(s => {
      if (s.id !== blockId) return s;
      const block = s as unknown as Record<string, unknown>;
      const existing = (block[branch] as WorkflowNode[]) ?? [];
      return { ...s, [branch]: [...existing, newStep] };
    }));
  }

  removeFromBranch(blockId: string, branch: string, stepId: string) {
    this.steps.update(ss => ss.map(s => {
      if (s.id !== blockId) return s;
      const block = s as unknown as Record<string, unknown>;
      const existing = (block[branch] as WorkflowNode[]) ?? [];
      return { ...s, [branch]: existing.filter(n => n.id !== stepId) };
    }));
  }

  // ── Step config helpers ───────────────────────────────────────────────────
  private mutateStep(id: string, fn: (s: WorkflowStep) => WorkflowStep) {
    this.steps.update(ss => ss.map(s => s.id === id ? fn({ ...(s as WorkflowStep) }) : s));
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

  // ── Summary chip helper ───────────────────────────────────────────────────
  getSourceSummary(step: WorkflowStep, key: string, area: 'param' | 'body'): string {
    const src = area === 'param' ? step.paramSources[key] : step.bodySources[key];
    if (!src) return '?';
    if (src.type === 'hardcoded') return src.value || '?';
    const idx = this.steps().findIndex(s => s.id === src.stepId);
    return `step${idx + 1}.${src.field || '?'}`;
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
    } catch (e) {
      this.snack.open(`Execution error: ${e}`, '', { duration: 4000 });
    } finally {
      this.running.set(false);
    }
  }
}
