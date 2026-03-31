import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { UserManagementService } from './user-management.service';
import { Dashboard, DashboardWidget, DashboardStatus } from '../config/dashboard.types';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);
  private readonly userMgmt = inject(UserManagementService);
  private readonly API_PREFIX = '/dashboards';

  private readonly _dashboards = signal<Dashboard[]>([]);
  readonly dashboards = this._dashboards.asReadonly();

  constructor() {
    this.loadFromApi();
  }

  // ── Backend API ─────────────────────────────────────────────────────────────

  async loadFromApi(): Promise<void> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    try {
      const res = await firstValueFrom(
        this.api.get(this.API_PREFIX, '', {}, { userEmail: email })
      );
      const apiDashboards = (res as Record<string, unknown>[]).map(d => this.mapFromApi(d));
      if (apiDashboards.length > 0) {
        this._dashboards.set(apiDashboards);
      }
    } catch (err) {
      console.warn('Failed to load dashboards from API', err);
    }
  }

  private async createOnApi(dashboard: Dashboard): Promise<void> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    try {
      await firstValueFrom(
        this.api.post(this.API_PREFIX, '', {}, {
          id: dashboard.id,
          userEmail: email,
          name: dashboard.name,
          description: dashboard.description ?? '',
          widgets: dashboard.widgets,
          status: dashboard.status,
        })
      );
    } catch (err) {
      console.warn('Failed to create dashboard on API', err);
    }
  }

  private async updateOnApi(dashboard: Dashboard): Promise<void> {
    try {
      await firstValueFrom(
        this.api.put(this.API_PREFIX, '/:id', { id: dashboard.id }, {
          name: dashboard.name,
          description: dashboard.description ?? '',
          widgets: dashboard.widgets,
          status: dashboard.status,
        })
      );
    } catch (err) {
      console.warn('Failed to update dashboard on API', err);
    }
  }

  private async deleteFromApi(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.api.delete(this.API_PREFIX, '/:id', { id })
      );
    } catch (err) {
      console.warn('Failed to delete dashboard from API', err);
    }
  }

  private mapFromApi(dto: Record<string, unknown>): Dashboard {
    return {
      id: dto['id'] as string,
      name: dto['name'] as string,
      description: (dto['description'] as string) || undefined,
      widgets: (dto['widgets'] ?? []) as DashboardWidget[],
      status: (dto['status'] as DashboardStatus) ?? 'draft',
      createdAt: dto['createdAt'] as string,
      updatedAt: dto['updatedAt'] as string,
    };
  }

  // ── Local state management ──────────────────────────────────────────────────

  upsert(dashboard: Dashboard): void {
    const isNew = !this._dashboards().some(d => d.id === dashboard.id);
    this._dashboards.update(ds => {
      const idx = ds.findIndex(d => d.id === dashboard.id);
      return idx >= 0
        ? ds.map(d => d.id === dashboard.id ? dashboard : d)
        : [...ds, dashboard];
    });
    if (isNew) { this.createOnApi(dashboard); } else { this.updateOnApi(dashboard); }
  }

  remove(id: string): void {
    this._dashboards.update(ds => ds.filter(d => d.id !== id));
    this.deleteFromApi(id);
  }

  getById(id: string): Dashboard | undefined {
    return this._dashboards().find(d => d.id === id);
  }

  // ── Token interpolation (shared with workflow) ──────────────────────────────

  /** Replace {{widget.X.path}} tokens in a string using widget last data */
  interpolateTokens(template: string, widgetResults: Map<string, unknown>): string {
    return template.replace(/\{\{widget\.([^}]+)\}\}/g, (_, expr: string) => {
      const dotIdx = expr.indexOf('.');
      if (dotIdx < 0) return `{{widget.${expr}}}`;
      const widgetId = expr.slice(0, dotIdx);
      const path = expr.slice(dotIdx + 1);
      const data = widgetResults.get(widgetId);
      if (data == null) return '';
      return String(this.getPath(data, path) ?? '');
    });
  }

  /** Resolve a dot-notation path in an object */
  getPath(obj: unknown, path: string): unknown {
    if (!path) return obj;
    const parts = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.').filter(Boolean);
    let cur = obj;
    for (const part of parts) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = (cur as Record<string, unknown>)[part];
    }
    return cur;
  }
}
