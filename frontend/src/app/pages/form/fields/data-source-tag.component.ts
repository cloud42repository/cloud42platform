import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormField } from '../../../config/form.types';

/**
 * Displays a small tag showing where the field's data comes from
 * (table binding, script, or API).
 */
@Component({
  selector: 'app-data-source-tag',
  standalone: true,
  imports: [MatIconModule],
  template: `
    @if (showBinding && field.boundFieldId) {
      <span class="data-source-tag">
        <mat-icon class="tag-icon">table_chart</mat-icon>
        {{ boundTableLabel }} → {{ field.boundColumn || '?' }}
      </span>
    } @else if (field.dataSourceMode === 'script') {
      <span class="data-source-tag">
        <mat-icon class="tag-icon">code</mat-icon>
        Script{{ detailText ? ' → ' + detailText : '' }}
      </span>
    } @else if (field.dataSource) {
      <span class="data-source-tag">
        <mat-icon class="tag-icon">cloud</mat-icon>
        {{ field.dataSource.moduleLabel }} › {{ apiDetailText }}
      </span>
    }
  `,
  styles: [`
    .data-source-tag {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; color: #0284c7; background: #f0f9ff;
      padding: 2px 8px; border-radius: 6px; margin-top: 6px;
    }
    .tag-icon { font-size: 12px; width: 12px; height: 12px; }
  `],
})
export class DataSourceTagComponent {
  @Input() field!: FormField;
  @Input() boundTableLabel = '';

  get showBinding(): boolean {
    const k = this.field.kind;
    return k === 'label' || k === 'text' || k === 'number' || k === 'boolean' || k === 'date';
  }

  get detailText(): string {
    const k = this.field.kind;
    if (k === 'select' || k === 'datatable') return '';
    return this.field.valueField || '?';
  }

  get apiDetailText(): string {
    const k = this.field.kind;
    if (k === 'select' || k === 'datatable') return this.field.dataSource?.endpointLabel || '?';
    return this.field.valueField || '?';
  }
}
