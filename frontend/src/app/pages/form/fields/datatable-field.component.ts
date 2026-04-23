import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormField } from '../../../config/form.types';
import { DataSourceTagComponent } from './data-source-tag.component';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-datatable-field',
  standalone: true,
  imports: [CommonModule, MatIconModule, DataSourceTagComponent, TranslatePipe],
  template: `
    <app-data-source-tag [field]="field" />
    @if (field.columns) {
      <div class="preview-table-cols">
        @for (col of field.columns.split(','); track $index) {
          <span class="col-tag">{{ col.trim() }}</span>
        }
      </div>
    } @else {
      <span class="no-source">{{ 'form.no-columns' | t }}</span>
    }

    @if (field.lastData && isArray(field.lastData)) {
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              @for (col of columns; track col) {
                <th>{{ col }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track $index) {
              <tr [class.row-selected]="selectedRow?.fieldId === field.id && selectedRow?.rowIndex === $index"
                  (click)="rowSelect.emit({ field: field, rowIndex: $index, row: row }); $event.stopPropagation()">
                @for (col of columns; track col) {
                  <td>{{ row[col] }}</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .preview-table-cols { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
    .col-tag {
      font-size: 10px; padding: 2px 6px; border-radius: 4px;
      background: #ecfdf5; color: #059669; font-family: monospace;
    }
    .no-source { font-size: 11px; color: #94a3b8; font-style: italic; }
    .table-container { margin-top: 10px; overflow-x: auto; max-height: 200px; overflow-y: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 11px; }
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
  `],
})
export class DatatableFieldComponent {
  @Input() field!: FormField;
  @Input() columns: string[] = [];
  @Input() rows: Record<string, string>[] = [];
  @Input() selectedRow: { fieldId: string; rowIndex: number } | null = null;
  @Output() rowSelect = new EventEmitter<{ field: FormField; rowIndex: number; row: Record<string, string> }>();

  isArray(data: unknown): boolean { return Array.isArray(data); }
}
