import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardService } from '../../services/dashboard.service';
import { Dashboard } from '../../config/dashboard.types';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-dashboard-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-header">
      <div class="page-title">
        <mat-icon class="title-icon">dashboard</mat-icon>
        <div>
          <h1>{{ 'dashboard.list-title' | t }}</h1>
          <p>{{ 'dashboard.list-subtitle' | t }}</p>
        </div>
      </div>
      <button mat-flat-button color="primary" routerLink="/dashboards/new">
        <mat-icon>add</mat-icon> {{ 'dashboard.new' | t }}
      </button>
    </div>

    @if (svc.dashboards().length === 0) {
      <div class="empty-state">
        <mat-icon class="empty-icon">dashboard</mat-icon>
        <p>{{ 'dashboard.no-dashboards' | t }}</p>
        <button mat-flat-button color="primary" routerLink="/dashboards/new">
          {{ 'dashboard.create-first' | t }}
        </button>
      </div>
    } @else {
      <div class="dashboard-grid">
        @for (db of svc.dashboards(); track db.id) {
          <div class="db-card">
            <div class="db-card-header">
              <div class="db-name">{{ db.name || ('dashboard.untitled' | t) }}</div>
              <span class="status-chip status-{{ db.status }}">{{ db.status }}</span>
            </div>

            <div class="db-meta">
              <span class="meta-item">
                <mat-icon>widgets</mat-icon> {{ db.widgets.length }} {{ 'dashboard.widgets' | t }}
              </span>
              <span class="meta-item">
                <mat-icon>update</mat-icon> {{ db.updatedAt | date:'MMM d' }}
              </span>
            </div>

            <div class="widget-pills">
              @for (w of db.widgets.slice(0, 6); track w.id) {
                <span class="widget-pill kind-{{ w.kind }}">
                  @if (w.kind === 'line-chart') { <mat-icon style="font-size:10px;width:10px;height:10px">show_chart</mat-icon> }
                  @else if (w.kind === 'pie-chart') { <mat-icon style="font-size:10px;width:10px;height:10px">pie_chart</mat-icon> }
                  @else if (w.kind === 'data-table') { <mat-icon style="font-size:10px;width:10px;height:10px">table_chart</mat-icon> }
                  {{ w.label || w.kind }}
                </span>
              }
              @if (db.widgets.length > 6) {
                <span class="widget-pill more">+{{ db.widgets.length - 6 }}</span>
              }
            </div>

            <div class="db-actions">
              <button mat-stroked-button [routerLink]="['/dashboards', db.id, 'edit']">
                <mat-icon>edit</mat-icon> {{ 'dashboard.edit-btn' | t }}
              </button>
              <button mat-icon-button color="warn"
                      (click)="delete(db)"
                      [matTooltip]="'dashboard.delete-db' | t">
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
                  linear-gradient(90deg, #7c3aed, #a78bfa) border-box;
      margin-bottom: 20px;
    }
    .page-title { display: flex; align-items: center; gap: 12px; }
    .title-icon {
      font-size: 32px; width: 32px; height: 32px;
      color: #7c3aed !important;
    }
    h1 { margin: 0; font-size: 20px; font-weight: 700; color: #1e293b; }
    p { margin: 2px 0 0; color: #64748b; font-size: 12px; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; padding: 80px 24px; color: #94a3b8;
    }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 16px;
    }

    .db-card {
      border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 16px; background: white;
      display: flex; flex-direction: column; gap: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
      transition: box-shadow .2s;
    }
    .db-card:hover { box-shadow: 0 4px 16px rgba(124,58,237,.12); }

    .db-card-header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .db-name { font-weight: 700; font-size: 14px; color: #1e293b; }

    .status-chip {
      padding: 2px 10px; border-radius: 99px;
      font-size: 11px; font-weight: 600; letter-spacing: .02em;
    }
    .status-draft     { background: #f1f5f9; color: #64748b; }
    .status-published { background: #dcfce7; color: #16a34a; }

    .db-meta { display: flex; gap: 12px; flex-wrap: wrap; }
    .meta-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: #64748b;
    }
    .meta-item mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .widget-pills { display: flex; flex-wrap: wrap; gap: 4px; }
    .widget-pill {
      padding: 2px 8px; border-radius: 6px;
      font-size: 10px; font-weight: 600; max-width: 160px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      display: flex; align-items: center; gap: 3px;
    }
    .kind-line-chart  { background: #dbeafe; color: #1d4ed8; }
    .kind-pie-chart   { background: #fef3c7; color: #d97706; }
    .kind-data-table  { background: #dcfce7; color: #15803d; }
    .more             { background: #f1f5f9; color: #64748b; }

    .db-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  `]
})
export class DashboardListComponent {
  readonly svc = inject(DashboardService);
  readonly i18n = inject(TranslateService);

  delete(db: Dashboard) {
    if (confirm(this.i18n.t('dashboard.confirm-delete', { name: db.name }))) {
      this.svc.remove(db.id);
    }
  }
}
