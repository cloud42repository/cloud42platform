import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export type FieldType = 'text' | 'number' | 'email' | 'date' | 'textarea' | 'select';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
  rows?: number;
}

export interface EndpointSchema {
  fields?: FieldSchema[];
  columns?: string[];
}

@Injectable({ providedIn: 'root' })
export class SchemaService {
  private readonly http = inject(HttpClient);
  private schema: Record<string, Record<string, EndpointSchema>> = {};

  /** Called by APP_INITIALIZER before the app renders. */
  load(): Observable<void> {
    return this.http.get<Record<string, Record<string, EndpointSchema>>>(`${environment.apiBase}/schema`).pipe(
      tap(s => { this.schema = s; }),
      map(() => undefined),
      catchError(err => {
        console.warn('SchemaService: failed to load schema from backend', err);
        return of(undefined);
      })
    );
  }

  getFields(apiPrefix: string, endpointId: string): FieldSchema[] {
    return this.schema[apiPrefix]?.[endpointId]?.fields ?? [];
  }

  getColumns(apiPrefix: string, endpointId: string): string[] {
    return this.schema[apiPrefix]?.[endpointId]?.columns ?? [];
  }
}
