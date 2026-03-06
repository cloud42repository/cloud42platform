import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;

  /** Build URL by replacing :param tokens */
  private buildUrl(prefix: string, pathTemplate: string, pathParams: Record<string, string>): string {
    let path = pathTemplate;
    for (const [key, value] of Object.entries(pathParams)) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    }
    return `${this.base}${prefix}${path}`;
  }

  get(prefix: string, pathTemplate: string, pathParams: Record<string, string> = {}, queryParams: Record<string, string> = {}): Observable<unknown> {
    const url = this.buildUrl(prefix, pathTemplate, pathParams);
    let params = new HttpParams();
    for (const [k, v] of Object.entries(queryParams)) {
      if (v !== '') params = params.set(k, v);
    }
    return this.http.get(url, { params });
  }

  post(prefix: string, pathTemplate: string, pathParams: Record<string, string> = {}, body: unknown = {}): Observable<unknown> {
    return this.http.post(this.buildUrl(prefix, pathTemplate, pathParams), body);
  }

  put(prefix: string, pathTemplate: string, pathParams: Record<string, string> = {}, body: unknown = {}): Observable<unknown> {
    return this.http.put(this.buildUrl(prefix, pathTemplate, pathParams), body);
  }

  patch(prefix: string, pathTemplate: string, pathParams: Record<string, string> = {}, body: unknown = {}): Observable<unknown> {
    return this.http.patch(this.buildUrl(prefix, pathTemplate, pathParams), body);
  }

  delete(prefix: string, pathTemplate: string, pathParams: Record<string, string> = {}, queryParams: Record<string, string> = {}): Observable<unknown> {
    const url = this.buildUrl(prefix, pathTemplate, pathParams);
    let params = new HttpParams();
    for (const [k, v] of Object.entries(queryParams)) {
      if (v !== '') params = params.set(k, v);
    }
    return this.http.delete(url, { params });
  }
}
