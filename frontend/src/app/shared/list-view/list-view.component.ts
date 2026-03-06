import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { EndpointDef, extractPathParams } from '../../config/endpoints';
import { FormViewComponent } from '../form-view/form-view.component';
import { ApiService } from '../../services/api.service';
import { SchemaService } from '../../services/schema.service';

/** Recursively find the first array in a response object (Zoho envelope). */
function extractArray(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    // Try common Zoho envelope keys first
    for (const key of ['data', 'items', 'list', 'result', 'contacts', 'leads',
        'accounts', 'deals', 'tasks', 'notes', 'tickets', 'invoices', 'bills',
        'expenses', 'payments', 'plans', 'customers', 'subscriptions', 'employees',
        'orders', 'products', 'categories', 'channels', 'messages', 'files', 'folders',
        'requests', 'templates', 'candidates', 'job_openings', 'interviews', 'chats',
        'visitors', 'operators', 'bots', 'reports', 'workspaces', 'views', 'projects',
        'bugs', 'timelogs', 'milestones', 'campaigns', 'mailing_lists', 'subscribers',
        'partners', 'storage_accounts', 'members', 'regions', 'contracts']) {
      if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
    }
    // Fall back to first array property found
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
    }
  }
  return [];
}

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatTableModule,
    MatIconModule, MatChipsModule, MatTooltipModule, MatExpansionModule,
    MatPaginatorModule, FormViewComponent,
  ],
  template: `
    <mat-card class="list-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>list</mat-icon> {{ endpoint.label }}
        </mat-card-title>
        <mat-card-subtitle>
          <mat-chip-set>
            <mat-chip class="method-get">{{ endpoint.method }}</mat-chip>
            <code>{{ apiPrefix }}{{ endpoint.pathTemplate }}</code>
          </mat-chip-set>
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Path & query param inputs -->
        <form [formGroup]="paramForm" (ngSubmit)="load()" class="param-form">
          @for (param of pathParams; track param) {
            <mat-form-field appearance="outline">
              <mat-label>{{ param }} <span style="color:#f44336">*</span></mat-label>
              <input matInput [formControlName]="param" [placeholder]="param" />
            </mat-form-field>
          }
          @for (qp of queryParamFields; track qp) {
            <mat-form-field appearance="outline">
              <mat-label>{{ qp }} (query)</mat-label>
              <input matInput [formControlName]="qp" [placeholder]="qp" />
            </mat-form-field>
          }
          <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
            <mat-icon>refresh</mat-icon> Load
          </button>
        </form>

        <!-- Filter bar (shown when there are results) -->
        @if (tableRows().length > 0) {
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label><mat-icon>search</mat-icon> Filter</mat-label>
            <input matInput [value]="filterText()" (input)="onFilter($event)" placeholder="Filter results…" />
          </mat-form-field>
        }

        @if (loading()) {
          <mat-spinner diameter="40" class="spinner"></mat-spinner>
        }
        @if (error()) {
          <div class="error-msg">
            <mat-icon color="warn">error</mat-icon> {{ error() }}
          </div>
        }

        <!-- Named-column mat-table -->
        @if (!loading() && columns().length > 0 && filteredRows().length > 0) {
          <div class="table-wrapper">
            <table mat-table [dataSource]="pageRows()" class="data-table">
              @for (col of columns(); track col) {
                <ng-container [matColumnDef]="col">
                  <th mat-header-cell *matHeaderCellDef class="th-cell">{{ prettyHeader(col) }}</th>
                  <td mat-cell *matCellDef="let row" class="td-cell">
                    <span [matTooltip]="cellStr(row, col)">{{ cellStr(row, col) }}</span>
                  </td>
                </ng-container>
              }
              <tr mat-header-row *matHeaderRowDef="columns()"></tr>
              <tr mat-row *matRowDef="let row; columns: columns();" (click)="selectRow(row)" [class.row--selected]="selectedRow() === row"></tr>
            </table>
          </div>
          <mat-paginator
            [length]="filteredRows().length"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPage($event)"
            showFirstLastButtons>
          </mat-paginator>
        }

        <!-- Action panel: shown when a row is selected and actionEndpoints provided -->
        @if (selectedRow() && actionEndpoints.length > 0) {
          <div class="action-panel">
            <div class="action-panel-header">
              <mat-icon>edit_note</mat-icon>
              <span>Actions — <code>{{ actionPanelLabel }}</code></span>
              <span class="action-spacer"></span>
              <button mat-icon-button (click)="selectedRow.set(null)" matTooltip="Close">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="action-forms">
              @for (ep of actionEndpoints; track ep.id) {
                <app-form-view
                  [endpoint]="ep"
                  [apiPrefix]="apiPrefix"
                  [initialValues]="computedInitialValues" />
              }
            </div>
          </div>
        }

        <!-- Fallback: raw JSON for non-array responses -->
        @if (!loading() && rawResult() && filteredRows().length === 0 && columns().length === 0) {
          <mat-expansion-panel [expanded]="true" class="result-panel">
            <mat-expansion-panel-header><mat-panel-title>Response (raw)</mat-panel-title></mat-expansion-panel-header>
            <pre class="json-result">{{ rawResult() | json }}</pre>
          </mat-expansion-panel>
        }

        @if (!loading() && columns().length > 0 && filteredRows().length === 0 && tableRows().length > 0) {
          <div class="no-data">No results match the filter.</div>
        }
        @if (!loading() && tableRows().length === 0 && rawResult() !== null && columns().length > 0) {
          <div class="no-data">No data returned.</div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host { display: block; }
    .list-card {
      margin-bottom: 0;
      border-radius: 0 !important;
      box-shadow: none !important;
      border: none !important;
    }
    mat-card-header { padding-bottom: 4px; }
    mat-card-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 16px !important; font-weight: 700 !important; color: #1e293b;
    }
    mat-card-title mat-icon { color: #059669; font-size: 20px; width: 20px; height: 20px; }
    mat-card-subtitle { margin-top: 4px !important; }
    mat-card-subtitle code { font-size: 11px; color: #64748b; font-family: monospace; }
    .param-form {
      display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
      margin: 14px 0 8px;
      padding: 14px 16px;
      background: #f0f9ff;
      border-radius: 10px;
      border: 1px solid #bae6fd;
    }
    .param-form mat-form-field { min-width: 160px; }
    .filter-field { width: 100%; margin-bottom: 4px; }
    .spinner { margin: 24px auto; display: block; }
    .error-msg {
      display: flex; align-items: center; gap: 6px;
      color: #dc2626; background: #fef2f2;
      border: 1px solid #fecaca; border-radius: 8px;
      padding: 10px 14px; margin: 8px 0; font-size: 13px;
    }
    .table-wrapper {
      overflow-x: auto; margin-top: 12px;
      border: 1px solid #e2e8f0; border-radius: 10px;
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
    }
    .data-table { width: 100%; min-width: 600px; }
    .th-cell {
      white-space: nowrap;
      font-weight: 700; font-size: 11px; text-transform: uppercase;
      letter-spacing: .4px; color: #64748b;
      padding: 0 14px; background: #f8fafc;
    }
    .td-cell {
      max-width: 200px; overflow: hidden;
      text-overflow: ellipsis; white-space: nowrap;
      font-size: 12.5px; padding: 0 14px; color: #334155;
    }
    .no-data { padding: 24px; text-align: center; color: #94a3b8; font-size: 13px; }
    .json-result { white-space: pre-wrap; word-break: break-all; font-size: 12px; max-height: 400px; overflow: auto; }
    .result-panel { margin-top: 12px; border-radius: 10px !important; }
    code { font-size: 11px; }
    tr.mat-row { cursor: pointer; }
    tr.mat-row:hover td { background: #f8fafc; }
    tr.row--selected td { background: #eff6ff !important; }
    tr.row--selected:hover td { background: #dbeafe !important; }
    .action-panel {
      margin-top: 16px;
      border: 1px solid #7dd3fc;
      border-radius: 10px;
      overflow: hidden;
    }
    .action-panel-header {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px;
      background: #e0f2fe;
      border-bottom: 1px solid #7dd3fc;
      font-size: 13px; font-weight: 600; color: #0369a1;
    }
    .action-panel-header mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .action-spacer { flex: 1; }
    .action-forms { display: flex; flex-wrap: wrap; }
    .action-forms > * { flex: 1 1 320px; min-width: 280px; }
    .method-get { background-color: #059669 !important; color: white !important; }
  `]
})
export class ListViewComponent implements OnInit, OnChanges {
  @Input({ required: true }) endpoint!: EndpointDef;
  @Input({ required: true }) apiPrefix!: string;
  @Input() actionEndpoints: EndpointDef[] = [];
  @Input() idMapping: Record<string, string> = {};
  @Output() rowSelected = new EventEmitter<Record<string, unknown>>();

  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly schemaService = inject(SchemaService);

  pathParams: string[] = [];
  queryParamFields: string[] = [];
  paramForm!: FormGroup;

  pageSize = 10;
  pageIndex = 0;

  loading = signal(false);
  rawResult = signal<unknown>(null);
  error = signal<string | null>(null);
  tableRows = signal<Record<string, unknown>[]>([]);
  columns = signal<string[]>([]);
  filterText = signal('');
  filteredRows = signal<Record<string, unknown>[]>([]);
  pageRows = signal<Record<string, unknown>[]>([]);
  selectedRow = signal<Record<string, unknown> | null>(null);

  get computedInitialValues(): Record<string, string> {
    const row = this.selectedRow();
    if (!row) return {};
    const result: Record<string, string> = {};
    for (const [rowField, paramName] of Object.entries(this.idMapping)) {
      if (row[rowField] !== undefined && row[rowField] !== null) {
        result[paramName] = String(row[rowField]);
      }
    }
    return result;
  }

  get actionPanelLabel(): string {
    const row = this.selectedRow();
    if (!row) return '';
    return Object.keys(this.idMapping)
      .map(k => String(row[k] ?? ''))
      .filter(Boolean)
      .join(', ');
  }

  selectRow(row: Record<string, unknown>) {
    this.selectedRow.set(this.selectedRow() === row ? null : row);
    if (this.selectedRow()) this.rowSelected.emit(row);
  }

  ngOnInit() {
    this.pathParams = extractPathParams(this.endpoint.pathTemplate);
    this.queryParamFields = this.endpoint.hasQueryParams ? ['page', 'pageSize', 'searchTerm'] : [];
    const controls: Record<string, string> = {};
    [...this.pathParams, ...this.queryParamFields].forEach(p => controls[p] = '');
    this.paramForm = this.fb.group(controls);

    // Auto-load when no path params are required (data can be fetched immediately)
    if (this.pathParams.length === 0) {
      this.load();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['endpoint'] && !changes['endpoint'].firstChange) {
      this.selectedRow.set(null);
    }
  }

  load() {
    const val = this.paramForm.value as Record<string, string>;
    const pathParams: Record<string, string> = {};
    const queryParams: Record<string, string> = {};
    this.pathParams.forEach(p => { pathParams[p] = val[p] ?? ''; });
    this.queryParamFields.forEach(p => { if (val[p]) queryParams[p] = val[p]; });

    this.loading.set(true);
    this.error.set(null);
    this.rawResult.set(null);
    this.tableRows.set([]);
    this.columns.set([]);
    this.filterText.set('');

    this.api.get(this.apiPrefix, this.endpoint.pathTemplate, pathParams, queryParams).subscribe({
      next: (data) => {
        this.rawResult.set(data);
        const rows = extractArray(data);
        this.tableRows.set(rows);

        // Determine columns: use SchemaService config, or auto-detect from first row
        let cols = this.schemaService.getColumns(this.apiPrefix, this.endpoint.id);
        if (cols.length === 0 && rows.length > 0) {
          cols = Object.keys(rows[0]).slice(0, 8); // auto-detect up to 8 cols
        }
        this.columns.set(cols);
        this.applyFilter('');
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err?.message ?? 'Request failed'); this.loading.set(false); }
    });
  }

  onFilter(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    this.filterText.set(text);
    this.applyFilter(text);
  }

  onPage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  private applyFilter(text: string) {
    const lower = text.toLowerCase();
    const filtered = lower
      ? this.tableRows().filter(row =>
          Object.values(row).some(v => String(v ?? '').toLowerCase().includes(lower)))
      : [...this.tableRows()];
    this.filteredRows.set(filtered);
    this.pageIndex = 0;
    this.updatePage();
  }

  private updatePage() {
    const start = this.pageIndex * this.pageSize;
    this.pageRows.set(this.filteredRows().slice(start, start + this.pageSize));
  }

  prettyHeader(col: string): string {
    return col.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  cellStr(row: Record<string, unknown>, col: string): string {
    const val = row[col];
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }
}