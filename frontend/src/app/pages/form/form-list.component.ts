import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormService } from '../../services/form.service';
import { FormDefinition } from '../../config/form.types';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-form-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-header">
      <div class="page-title">
        <mat-icon class="title-icon">edit_note</mat-icon>
        <div>
          <h1>{{ 'form.list-title' | t }}</h1>
          <p>{{ 'form.list-subtitle' | t }}</p>
        </div>
      </div>
      <button mat-flat-button color="primary" routerLink="/forms/new">
        <mat-icon>add</mat-icon> {{ 'form.new' | t }}
      </button>
    </div>

    @if (svc.forms().length === 0) {
      <div class="empty-state">
        <mat-icon class="empty-icon">edit_note</mat-icon>
        <p>{{ 'form.no-forms' | t }}</p>
        <button mat-flat-button color="primary" routerLink="/forms/new">
          {{ 'form.create-first' | t }}
        </button>
      </div>
    } @else {
      <div class="form-grid">
        @for (frm of svc.forms(); track frm.id) {
          <div class="frm-card">
            <div class="frm-card-header">
              <div class="frm-name">{{ frm.name || ('form.untitled' | t) }}</div>
              <span class="status-chip status-{{ frm.status }}">{{ frm.status }}</span>
            </div>

            <div class="frm-meta">
              <span class="meta-item">
                <mat-icon>text_fields</mat-icon> {{ frm.fields.length }} {{ 'form.fields' | t }}
              </span>
              <span class="meta-item">
                <mat-icon>send</mat-icon> {{ frm.submitActions.length }} {{ 'form.actions' | t }}
              </span>
              <span class="meta-item">
                <mat-icon>update</mat-icon> {{ frm.updatedAt | date:'MMM d' }}
              </span>
            </div>

            <div class="field-pills">
              @for (f of frm.fields.slice(0, 6); track f.id) {
                <span class="field-pill kind-{{ f.kind }}">
                  @if (f.kind === 'text') { <mat-icon style="font-size:10px;width:10px;height:10px">text_fields</mat-icon> }
                  @else if (f.kind === 'date') { <mat-icon style="font-size:10px;width:10px;height:10px">calendar_today</mat-icon> }
                  @else if (f.kind === 'select') { <mat-icon style="font-size:10px;width:10px;height:10px">arrow_drop_down_circle</mat-icon> }
                  @else if (f.kind === 'datatable') { <mat-icon style="font-size:10px;width:10px;height:10px">table_chart</mat-icon> }
                  {{ f.label || f.kind }}
                </span>
              }
              @if (frm.fields.length > 6) {
                <span class="field-pill more">+{{ frm.fields.length - 6 }}</span>
              }
            </div>

            <div class="frm-actions">
              <button mat-stroked-button [routerLink]="['/forms', frm.id, 'edit']">
                <mat-icon>edit</mat-icon> {{ 'form.edit-btn' | t }}
              </button>
              <button mat-icon-button color="warn"
                      (click)="delete(frm)"
                      [matTooltip]="'form.delete-form' | t">
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
                  linear-gradient(90deg, #0891b2, #67e8f9) border-box;
      margin-bottom: 20px;
    }
    .page-title { display: flex; align-items: center; gap: 12px; }
    .title-icon { font-size: 32px; width: 32px; height: 32px; color: #0891b2; }
    h1 { margin: 0; font-size: 18px; font-weight: 700; color: #1e293b; }
    p  { margin: 2px 0 0; font-size: 12px; color: #64748b; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 60px 20px; color: #94a3b8; gap: 12px;
    }
    .empty-icon { font-size: 48px; width: 48px; height: 48px; opacity: .5; }

    .form-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
    }
    .frm-card {
      border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;
      background: white; transition: box-shadow .15s;
    }
    .frm-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.07); }
    .frm-card-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
    }
    .frm-name { font-weight: 700; font-size: 14px; color: #1e293b; }
    .status-chip {
      font-size: 10px; padding: 2px 8px; border-radius: 99px; font-weight: 600;
      text-transform: uppercase; letter-spacing: .03em;
    }
    .status-draft     { background: #fef9c3; color: #ca8a04; }
    .status-published { background: #dcfce7; color: #15803d; }

    .frm-meta {
      display: flex; gap: 12px; margin-bottom: 8px;
    }
    .meta-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: #64748b;
    }
    .meta-item mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .field-pills { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
    .field-pill {
      display: inline-flex; align-items: center; gap: 3px;
      font-size: 10px; padding: 2px 8px; border-radius: 99px;
      background: #f1f5f9; color: #475569;
    }
    .field-pill.kind-text       { border-left: 3px solid #2563eb; }
    .field-pill.kind-date       { border-left: 3px solid #d97706; }
    .field-pill.kind-select     { border-left: 3px solid #7c3aed; }
    .field-pill.kind-datatable  { border-left: 3px solid #16a34a; }
    .field-pill.more { background: #e2e8f0; }

    .frm-actions { display: flex; align-items: center; gap: 8px; }
  `],
})
export class FormListComponent {
  readonly svc = inject(FormService);
  private readonly i18n = inject(TranslateService);

  delete(form: FormDefinition) {
    if (confirm(this.i18n.t('form.confirm-delete' as any, { name: form.name }))) {
      this.svc.remove(form.id);
    }
  }
}
