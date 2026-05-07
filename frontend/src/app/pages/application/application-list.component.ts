import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApplicationService } from '../../services/application.service';
import { ApplicationDefinition } from '../../config/application.types';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-header">
      <div class="page-title">
        <mat-icon class="title-icon">apps</mat-icon>
        <div>
          <h1>Applications</h1>
          <p>Build multi-page apps from forms, dashboards & workflows</p>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button mat-stroked-button (click)="fileInput.click()" matTooltip="Import application JSON">
          <mat-icon>upload_file</mat-icon> {{ 'common.import' | t }}
        </button>
        <button mat-flat-button color="primary" routerLink="/applications/new">
          <mat-icon>add</mat-icon> New Application
        </button>
      </div>
      <input #fileInput type="file" accept=".json" hidden (change)="importFile($event)">
    </div>

    @if (svc.apps().length === 0) {
      <div class="empty-state">
        <mat-icon class="empty-icon">apps</mat-icon>
        <p>No applications yet</p>
        <button mat-flat-button color="primary" routerLink="/applications/new">
          Create your first app
        </button>
      </div>
    } @else {
      <div class="app-grid">
        @for (app of svc.apps(); track app.id) {
          <div class="app-card" (click)="open(app)">
            <div class="app-card-header">
              <div class="app-name">{{ app.name || 'Untitled' }}</div>
              <span class="status-chip status-{{ app.status }}">{{ app.status }}</span>
            </div>

            @if (app.description) {
              <div class="app-desc">{{ app.description }}</div>
            }

            <div class="app-meta">
              <span class="meta-item">
                <mat-icon>layers</mat-icon> {{ app.pages.length }} page{{ app.pages.length === 1 ? '' : 's' }}
              </span>
              <span class="meta-item">
                <mat-icon>navigation</mat-icon> {{ app.navigation.style }}
              </span>
              @if (app.updatedAt) {
                <span class="meta-item">
                  <mat-icon>update</mat-icon> {{ app.updatedAt | date:'MMM d' }}
                </span>
              }
            </div>

            <div class="page-pills">
              @for (page of app.pages.slice(0, 5); track page.id) {
                <span class="page-pill type-{{ page.type }}">
                  @if (page.type === 'form') { <mat-icon style="font-size:10px;width:10px;height:10px">edit_note</mat-icon> }
                  @else if (page.type === 'dashboard') { <mat-icon style="font-size:10px;width:10px;height:10px">dashboard</mat-icon> }
                  @else { <mat-icon style="font-size:10px;width:10px;height:10px">account_tree</mat-icon> }
                  {{ page.label }}
                </span>
              }
              @if (app.pages.length > 5) {
                <span class="page-pill more">+{{ app.pages.length - 5 }}</span>
              }
            </div>

            <div class="app-card-actions">
              <button mat-icon-button (click)="open(app); $event.stopPropagation()" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="exportItem(app); $event.stopPropagation()" matTooltip="Export">
                <mat-icon>download</mat-icon>
              </button>
              <button mat-icon-button (click)="duplicate(app); $event.stopPropagation()" matTooltip="Duplicate">
                <mat-icon>content_copy</mat-icon>
              </button>
              <button mat-icon-button (click)="remove(app); $event.stopPropagation()" matTooltip="Delete" class="delete-btn">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; padding: 24px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .page-title { display: flex; align-items: center; gap: 12px; }
    .title-icon { font-size: 32px; width: 32px; height: 32px; color: #6366f1; }
    .page-title h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .page-title p { margin: 2px 0 0; color: #64748b; font-size: 13px; }

    .empty-state { text-align: center; padding: 80px 24px; color: #64748b; }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: #cbd5e1; margin-bottom: 16px; }

    .app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }

    .app-card {
      background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;
      padding: 16px; cursor: pointer; transition: box-shadow 0.15s, border-color 0.15s;
      display: flex; flex-direction: column; gap: 8px;
    }
    .app-card:hover { border-color: #6366f1; box-shadow: 0 2px 12px rgba(99,102,241,0.12); }
    .app-card-header { display: flex; align-items: center; justify-content: space-between; }
    .app-name { font-weight: 600; font-size: 15px; color: #1e293b; }
    .app-desc { font-size: 12px; color: #64748b; line-height: 1.4; }

    .status-chip {
      font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 8px;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .status-draft { background: #fef3c7; color: #92400e; }
    .status-published { background: #d1fae5; color: #065f46; }

    .app-meta { display: flex; gap: 12px; font-size: 11px; color: #64748b; }
    .meta-item { display: flex; align-items: center; gap: 3px; }
    .meta-item mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .page-pills { display: flex; flex-wrap: wrap; gap: 4px; }
    .page-pill {
      font-size: 10px; padding: 2px 8px; border-radius: 6px;
      display: flex; align-items: center; gap: 3px;
    }
    .type-form { background: #ede9fe; color: #6d28d9; }
    .type-dashboard { background: #dbeafe; color: #1d4ed8; }
    .type-workflow { background: #fef3c7; color: #92400e; }
    .page-pill.more { background: #f1f5f9; color: #64748b; }

    .app-card-actions { display: flex; gap: 4px; justify-content: flex-end; margin-top: 4px; }
    .app-card-actions button { width: 32px; height: 32px; line-height: 32px; }
    .app-card-actions mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .delete-btn { color: #ef4444 !important; }

    :host-context(.dark-mode) .app-card { background: #1e293b; border-color: #334155; }
    :host-context(.dark-mode) .app-card:hover { border-color: #818cf8; }
    :host-context(.dark-mode) .app-name { color: #e2e8f0; }
    :host-context(.dark-mode) .app-desc { color: #94a3b8; }
  `],
})
export class ApplicationListComponent {
  readonly svc = inject(ApplicationService);
  private readonly router = inject(Router);

  open(app: ApplicationDefinition) {
    this.router.navigate(['/applications', app.id, 'edit']);
  }

  duplicate(app: ApplicationDefinition) {
    const copy: ApplicationDefinition = {
      ...app,
      id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `${app.name} (copy)`,
      status: 'draft',
      createdAt: undefined,
      updatedAt: undefined,
    };
    this.svc.upsert(copy);
  }

  remove(app: ApplicationDefinition) {
    this.svc.remove(app.id);
  }

  exportItem(app: ApplicationDefinition): void {
    const { createdAt, updatedAt, resolvedPages, ...data } = app as any;
    const blob = new Blob([JSON.stringify({ _type: 'application', ...data }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${app.name || 'application'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        if (json._type && json._type !== 'application') { alert('This file is not an application export.'); return; }
        delete json._type;
        const now = new Date().toISOString();
        const imported: ApplicationDefinition = {
          ...json,
          id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        };
        this.svc.upsert(imported);
        this.router.navigate(['/applications', imported.id, 'edit']);
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }
}
