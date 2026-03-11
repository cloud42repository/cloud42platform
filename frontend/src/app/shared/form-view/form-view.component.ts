import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EndpointDef, extractPathParams } from '../../config/endpoints';
import { ApiService } from '../../services/api.service';
import { SchemaService, FieldSchema } from '../../services/schema.service';

@Component({
  selector: 'app-form-view',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule, MatIconModule,
    MatChipsModule, MatExpansionModule, MatSnackBarModule,
  ],
  template: `
    <mat-card class="form-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>{{ methodIcon }}</mat-icon> {{ endpoint.label }}
        </mat-card-title>
        <mat-card-subtitle>
          <mat-chip-set>
            <mat-chip [ngClass]="'method-' + endpoint.method.toLowerCase()">{{ endpoint.method }}</mat-chip>
            <code>{{ apiPrefix }}{{ endpoint.pathTemplate }}</code>
          </mat-chip-set>
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="paramForm" (ngSubmit)="submit()" class="param-form">

          <!-- Path params -->
          @for (param of pathParams; track param) {
            <mat-form-field appearance="outline">
              <mat-label>{{ param }} <span class="req-star">*</span></mat-label>
              <input matInput [formControlName]="param" [placeholder]="param" />
            </mat-form-field>
          }

          <!-- Query params -->
          @for (qp of queryParamFields; track qp) {
            <mat-form-field appearance="outline">
              <mat-label>{{ qp }} (query)</mat-label>
              <input matInput [formControlName]="qp" [placeholder]="qp" />
            </mat-form-field>
          }

          <!-- DTO-derived typed fields -->
          @if (formFields.length > 0) {
            <div class="section-divider">Request Body</div>
            @for (field of formFields; track field.key) {
              @if (field.type === 'select') {
                <mat-form-field appearance="outline">
                  <mat-label>{{ field.label }}{{ field.required ? ' *' : '' }}</mat-label>
                  <mat-select [formControlName]="'body.' + field.key">
                    <mat-option value="">-- select --</mat-option>
                    @for (opt of field.options; track opt.value) {
                      <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              } @else if (field.type === 'textarea') {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ field.label }}{{ field.required ? ' *' : '' }}</mat-label>
                  <textarea matInput [formControlName]="'body.' + field.key"
                    [rows]="field.rows ?? 3"
                    [placeholder]="field.placeholder ?? ''"></textarea>
                </mat-form-field>
              } @else {
                <mat-form-field appearance="outline">
                  <mat-label>{{ field.label }}{{ field.required ? ' *' : '' }}</mat-label>
                  <input matInput [formControlName]="'body.' + field.key"
                    [type]="field.type"
                    [placeholder]="field.placeholder ?? field.label" />
                </mat-form-field>
              }
            }
          } @else if (endpoint.hasBody) {
            <!-- Fallback: raw JSON textarea -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Request Body (JSON)</mat-label>
              <textarea matInput formControlName="__body__"
                rows="6" placeholder='{ "key": "value" }'></textarea>
            </mat-form-field>
          }

          <div class="submit-row">
            @if (showSubmit) {
              <button mat-raised-button [color]="submitColor" type="submit" [disabled]="loading()">
                <mat-icon>send</mat-icon> {{ endpoint.method }}
              </button>
            }
          </div>
        </form>

        @if (showSubmit && loading()) {
          <mat-spinner diameter="40" class="spinner"></mat-spinner>
        }
        @if (showSubmit && error()) {
          <div class="error-msg">
            <mat-icon color="warn">error</mat-icon> {{ error() }}
          </div>
        }
        @if (showSubmit && !loading() && result()) {
          <mat-expansion-panel [expanded]="true" class="result-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>Response</mat-panel-title>
            </mat-expansion-panel-header>
            <pre class="json-result">{{ result() | json }}</pre>
          </mat-expansion-panel>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host { display: block; }
    .form-card {
      margin-bottom: 0;
      border-radius: 0 !important;
      box-shadow: none !important;
      border: none !important;
    }
    mat-card-header { padding-bottom: 4px; }
    mat-card-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px !important; font-weight: 700 !important; color: #1e293b;
    }
    mat-card-title mat-icon { font-size: 17px; width: 17px; height: 17px; }
    mat-card-subtitle { margin-top: 4px !important; }
    mat-card-subtitle code { font-size: 11px; color: #64748b; font-family: monospace; }
    .param-form {
      display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start;
      margin: 14px 0 8px;
    }
    .param-form mat-form-field { min-width: 220px; }
    .full-width { width: 100%; min-width: 100%; }
    .submit-row { width: 100%; margin-top: 8px; }
    .submit-row button {
      height: 42px; padding: 0 24px;
      border-radius: 10px !important;
      font-weight: 600; letter-spacing: .02em;
    }
    .section-divider {
      width: 100%;
      display: flex; align-items: center; gap: 10px;
      color: #475569; font-size: 11.5px; font-weight: 700;
      text-transform: uppercase; letter-spacing: .6px;
      margin: 6px 0 2px;
    }
    .section-divider::after {
      content: ''; flex: 1; height: 1px; background: #e2e8f0;
    }
    .req-star { color: #ef4444; }
    .spinner { margin: 24px auto; display: block; }
    .error-msg {
      display: flex; align-items: center; gap: 6px;
      color: #dc2626; background: #fef2f2;
      border: 1px solid #fecaca; border-radius: 8px;
      padding: 10px 14px; margin: 8px 0; font-size: 13px;
    }
    .json-result { white-space: pre-wrap; word-break: break-all; font-size: 12px; max-height: 400px; overflow: auto; }
    .result-panel { margin-top: 16px; border-radius: 10px !important; }
    code { font-size: 11px; }
    .method-post   { background-color: #0284c7 !important; color: white !important; }
    .method-put    { background-color: #d97706 !important; color: white !important; }
    .method-patch  { background-color: #7c3aed !important; color: white !important; }
    .method-delete { background-color: #dc2626 !important; color: white !important; }
  `]
})
export class FormViewComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) endpoint!: EndpointDef;
  @Input({ required: true }) apiPrefix!: string;
  @Input() initialValues: Record<string, string> = {};
  /** Set to false to hide submit button and response display (for embedding) */
  @Input() showSubmit = true;
  /** Emits body values (as JSON string) whenever the form changes (useful when showSubmit=false) */
  @Output() valuesChange = new EventEmitter<string>();

  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);
  private readonly schemaService = inject(SchemaService);
  private valuesSub?: Subscription;

  pathParams: string[] = [];
  queryParamFields: string[] = [];
  formFields: FieldSchema[] = [];
  paramForm!: FormGroup;

  loading = signal(false);
  result = signal<unknown>(null);
  error = signal<string | null>(null);

  get methodIcon(): string {
    const icons: Record<string, string> = { POST: 'add_circle', PUT: 'edit', PATCH: 'tune', DELETE: 'delete' };
    return icons[this.endpoint.method] ?? 'send';
  }

  get submitColor(): string {
    const colors: Record<string, string> = { POST: 'primary', PUT: 'accent', PATCH: 'accent', DELETE: 'warn' };
    return colors[this.endpoint.method] ?? 'primary';
  }

  ngOnInit() {
    this.pathParams = extractPathParams(this.endpoint.pathTemplate);
    this.queryParamFields = this.endpoint.hasQueryParams ? ['page', 'pageSize'] : [];
    this.formFields = this.schemaService.getFields(this.apiPrefix, this.endpoint.id);

    const controls: Record<string, unknown> = {};
    [...this.pathParams, ...this.queryParamFields].forEach(p => { controls[p] = ''; });

    if (this.formFields.length > 0) {
      this.formFields.forEach(f => { controls['body.' + f.key] = ''; });
    } else if (this.endpoint.hasBody) {
      controls['__body__'] = '{}';
    }
    this.paramForm = this.fb.group(controls);
    if (Object.keys(this.initialValues).length > 0) {
      this.paramForm.patchValue(this.initialValues);
    }

    // Emit body values whenever the form changes (for workflow builder embedding)
    if (!this.showSubmit) {
      this.valuesSub = this.paramForm.valueChanges.subscribe(val => {
        this.valuesChange.emit(this.extractBodyJson(val));
      });
    }
  }

  ngOnDestroy() {
    this.valuesSub?.unsubscribe();
  }

  /** Extract only body-related fields and return as a JSON string */
  private extractBodyJson(val: Record<string, string>): string {
    if (this.formFields.length > 0) {
      const body: Record<string, unknown> = {};
      this.formFields.forEach(f => {
        const raw = val['body.' + f.key];
        if (raw !== '' && raw !== null && raw !== undefined) {
          if (f.type === 'number') body[f.key] = Number(raw);
          else {
            try { body[f.key] = JSON.parse(raw); } catch { body[f.key] = raw; }
          }
        }
      });
      return JSON.stringify(body, null, 2);
    } else if (this.endpoint.hasBody) {
      return val['__body__'] ?? '{}';
    }
    return '{}';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialValues'] && !changes['initialValues'].firstChange && this.paramForm) {
      this.paramForm.patchValue(this.initialValues);
    }
  }

  submit() {
    const val = this.paramForm.value as Record<string, string>;
    const pathParams: Record<string, string> = {};
    const queryParams: Record<string, string> = {};
    this.pathParams.forEach(p => { pathParams[p] = val[p] ?? ''; });
    this.queryParamFields.forEach(p => { queryParams[p] = val[p] ?? ''; });

    let body: Record<string, unknown> = {};
    if (this.formFields.length > 0) {
      this.formFields.forEach(f => {
        const raw = val['body.' + f.key];
        if (raw !== '' && raw !== null && raw !== undefined) {
          if (f.type === 'number') {
            body[f.key] = Number(raw);
          } else if (f.type === 'textarea') {
            // Try to parse if it looks like JSON
            try { body[f.key] = JSON.parse(raw); } catch { body[f.key] = raw; }
          } else {
            body[f.key] = raw;
          }
        }
      });
    } else if (this.endpoint.hasBody) {
      try { body = JSON.parse(val['__body__'] || '{}'); }
      catch { this.error.set('Invalid JSON body'); return; }
    }

    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);

    const method = this.endpoint.method;
    let obs$;
    if (method === 'POST')        obs$ = this.api.post(this.apiPrefix, this.endpoint.pathTemplate, pathParams, body);
    else if (method === 'PUT')    obs$ = this.api.put(this.apiPrefix, this.endpoint.pathTemplate, pathParams, body);
    else if (method === 'PATCH')  obs$ = this.api.patch(this.apiPrefix, this.endpoint.pathTemplate, pathParams, body);
    else /* DELETE */             obs$ = this.api.delete(this.apiPrefix, this.endpoint.pathTemplate, pathParams, queryParams);

    obs$.subscribe({
      next: (data) => {
        this.result.set(data);
        this.loading.set(false);
        this.snack.open(`${method} succeeded`, 'Close', { duration: 3000 });
      },
      error: (err) => { this.error.set(err?.message ?? 'Request failed'); this.loading.set(false); }
    });
  }
}
