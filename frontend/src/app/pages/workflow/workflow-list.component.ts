import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { WorkflowService } from '../../services/workflow.service';
import { ApiService } from '../../services/api.service';
import { Workflow, WorkflowStatus } from '../../config/workflow.types';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-workflow-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatTableModule, MatChipsModule,
    MatTooltipModule, MatProgressSpinnerModule, MatExpansionModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-header">
      <div class="page-title">
        <mat-icon class="title-icon">account_tree</mat-icon>
        <div>
          <h1>{{ 'workflow.list-title' | t }}</h1>
          <p>{{ 'workflow.list-subtitle' | t }}</p>
        </div>
      </div>
      <button mat-flat-button color="primary" routerLink="/workflows/new">
        <mat-icon>add</mat-icon> {{ 'workflow.new' | t }}
      </button>
    </div>

    @if (svc.workflows().length === 0) {
      <div class="empty-state">
        <mat-icon class="empty-icon">account_tree</mat-icon>
        <p>{{ 'workflow.no-workflows' | t }}</p>
        <button mat-flat-button color="primary" routerLink="/workflows/new">
          {{ 'workflow.create-first' | t }}
        </button>
      </div>
    } @else {
      <div class="workflow-grid">
        @for (wf of svc.workflows(); track wf.id) {
          <div class="wf-card">
            <div class="wf-card-header">
              <div class="wf-name">{{ wf.name || ('workflow.untitled' | t) }}</div>
              <span class="status-chip status-{{ wf.status }}">{{ wf.status }}</span>
            </div>

            <div class="wf-meta">
              <span class="meta-item">
                <mat-icon>view_list</mat-icon> {{ (wf.steps.length === 1 ? 'workflow.step-count' : 'workflow.step-count-plural') | t:{count: wf.steps.length} }}
              </span>
              @if (wf.scheduledAt) {
                <span class="meta-item">
                  <mat-icon>schedule</mat-icon> {{ wf.scheduledAt | date:'MMM d, y HH:mm' }}
                </span>
              }
              <span class="meta-item">
                <mat-icon>update</mat-icon> {{ wf.updatedAt | date:'MMM d' }}
              </span>
            </div>

            <div class="step-pills">
              @for (step of wf.steps.slice(0, 5); track step.id) {
                @if (step.kind === 'endpoint' || !step.kind) {
                  <span class="step-pill method-{{ $any(step).method.toLowerCase() }}">
                    {{ $any(step).method }} {{ $any(step).endpointLabel }}
                  </span>
                } @else {
                  <span class="step-pill step-pill--block">
                    @if (step.kind === 'try-catch') { <mat-icon style="font-size:10px;width:10px;height:10px">shield</mat-icon> Try/Catch }
                    @else if (step.kind === 'loop') { <mat-icon style="font-size:10px;width:10px;height:10px">loop</mat-icon> Loop }
                    @else if (step.kind === 'if-else') { <mat-icon style="font-size:10px;width:10px;height:10px">call_split</mat-icon> If/Else }
                  </span>
                }
              }
              @if (wf.steps.length > 5) {
                <span class="step-pill more">{{ 'workflow.more' | t:{count: wf.steps.length - 5} }}</span>
              }
            </div>

            @if (wf.lastRunLog) {
              <mat-expansion-panel class="log-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon class="{{ wf.lastRunLog.success ? 'ok' : 'err' }}">
                      {{ wf.lastRunLog.success ? 'check_circle' : 'error' }}
                    </mat-icon>
                    {{ 'workflow.last-run' | t }} — {{ wf.lastRunLog.startedAt | date:'MMM d HH:mm' }}
                  </mat-panel-title>
                </mat-expansion-panel-header>
                <div class="log-steps">
                  @for (sl of wf.lastRunLog.steps; track sl.stepId) {
                    <div class="log-step" [class.log-step--fail]="!sl.success">
                      <mat-icon>{{ sl.success ? 'check' : 'close' }}</mat-icon>
                      <span class="log-label">{{ sl.label }}</span>
                      @if (sl.error) { <span class="log-error">{{ sl.error }}</span> }
                      @if (sl.response) {
                        <pre class="log-resp">{{ sl.response | json }}</pre>
                      }
                    </div>
                  }
                </div>
              </mat-expansion-panel>
            }

            <div class="wf-actions">
              <button mat-stroked-button [routerLink]="['/workflows', wf.id, 'edit']">
                <mat-icon>edit</mat-icon> {{ 'workflow.edit-btn' | t }}
              </button>
              <button mat-stroked-button color="accent"
                      (click)="run(wf)"
                      [disabled]="wf.status === 'running'"
                      matTooltip="Execute now">
                @if (runningId() === wf.id) {
                  <mat-spinner diameter="16" />
                } @else {
                  <mat-icon>play_arrow</mat-icon>
                }
                {{ 'workflow.run-now' | t }}
              </button>
              <button mat-stroked-button
                      (click)="runBackend(wf)"
                      [disabled]="wf.status === 'running'"
                      matTooltip="{{ 'workflow.run-backend-hint' | t }}">
                @if (runningBackendId() === wf.id) {
                  <mat-spinner diameter="16" />
                } @else {
                  <mat-icon>cloud_upload</mat-icon>
                }
                {{ 'workflow.run-backend' | t }}
              </button>
              <button mat-icon-button color="warn"
                      (click)="delete(wf)"
                      [matTooltip]="'workflow.delete-wf' | t">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; padding: 0; }

    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 4px 0 20px;
      border-bottom: 2px solid transparent;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(90deg, #0284c7, #06b6d4) border-box;
      margin-bottom: 20px;
    }
    .page-title { display: flex; align-items: center; gap: 12px; }
    .title-icon {
      font-size: 32px; width: 32px; height: 32px;
      color: #0284c7 !important;
    }
    h1 { margin: 0; font-size: 20px; font-weight: 700; color: #1e293b; }
    p { margin: 2px 0 0; color: #64748b; font-size: 12px; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; padding: 80px 24px; color: #94a3b8;
    }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; }

    .workflow-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 16px;
    }

    .wf-card {
      border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 16px; background: white;
      display: flex; flex-direction: column; gap: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
      transition: box-shadow .2s;
    }
    .wf-card:hover { box-shadow: 0 4px 16px rgba(2,132,199,.12); }

    .wf-card-header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .wf-name { font-weight: 700; font-size: 14px; color: #1e293b; }

    .status-chip {
      padding: 2px 10px; border-radius: 99px;
      font-size: 11px; font-weight: 600; letter-spacing: .02em;
    }
    .status-draft     { background: #f1f5f9; color: #64748b; }
    .status-scheduled { background: #fef3c7; color: #d97706; }
    .status-running   { background: #dbeafe; color: #2563eb; }
    .status-completed { background: #dcfce7; color: #16a34a; }
    .status-failed    { background: #fee2e2; color: #dc2626; }

    .wf-meta { display: flex; gap: 12px; flex-wrap: wrap; }
    .meta-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: #64748b;
    }
    .meta-item mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .step-pills { display: flex; flex-wrap: wrap; gap: 4px; }
    .step-pill {
      padding: 2px 8px; border-radius: 6px;
      font-size: 10px; font-weight: 600; max-width: 200px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .method-get    { background: #dcfce7; color: #15803d; }
    .method-post   { background: #dbeafe; color: #1d4ed8; }
    .method-put    { background: #fef9c3; color: #ca8a04; }
    .method-patch  { background: #ede9fe; color: #7c3aed; }
    .method-delete { background: #fee2e2; color: #dc2626; }
    .more          { background: #f1f5f9; color: #64748b; }
    .step-pill--block { background: #ede9fe; color: #7c3aed; display: flex; align-items: center; gap: 3px; }

    .log-panel { box-shadow: none !important; border: 1px solid #e2e8f0; border-radius: 8px !important; }
    .log-steps { display: flex; flex-direction: column; gap: 8px; font-size: 12px; }
    .log-step {
      display: flex; align-items: flex-start; gap: 6px;
      padding: 6px 8px; border-radius: 6px; background: #f8fafc;
    }
    .log-step--fail { background: #fff1f2; }
    .log-step mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; }
    .log-label { font-weight: 600; color: #1e293b; }
    .log-error { color: #dc2626; flex: 1; }
    .log-resp {
      margin: 4px 0 0; font-size: 10px; background: #f1f5f9;
      padding: 4px 6px; border-radius: 4px; max-height: 100px; overflow: auto;
      white-space: pre-wrap; word-break: break-all;
    }

    .ok { color: #16a34a !important; }
    .err { color: #dc2626 !important; }

    .wf-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    mat-spinner { display: inline-block; }
  `]
})
export class WorkflowListComponent {
  readonly svc = inject(WorkflowService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly i18n = inject(TranslateService);
  readonly runningId = signal<string | null>(null);
  readonly runningBackendId = signal<string | null>(null);

  async run(wf: Workflow) {
    this.runningId.set(wf.id);
    try {
      await this.svc.execute(wf.id);
    } catch (e) {
      console.error(e);
    } finally {
      this.runningId.set(null);
    }
  }

  async runBackend(wf: Workflow) {
    this.runningBackendId.set(wf.id);
    try {
      await firstValueFrom(
        this.api.post('/workflows', '/:id/execute', { id: wf.id }, {})
      );
      await this.svc.loadFromApi();
    } catch (e) {
      console.error(e);
    } finally {
      this.runningBackendId.set(null);
    }
  }

  delete(wf: Workflow) {
    if (confirm(this.i18n.t('workflow.confirm-delete', { name: wf.name }))) {
      this.svc.remove(wf.id);
    }
  }

}

