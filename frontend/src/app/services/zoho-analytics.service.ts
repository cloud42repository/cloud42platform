import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-analytics';

@Injectable({ providedIn: 'root' })
export class ZohoAnalyticsService {
  private readonly api = inject(ApiService);

  // Workspaces
  listWorkspaces() {
    return this.api.get(PREFIX, '/workspaces');
  }
  getWorkspace(id: string) {
    return this.api.get(PREFIX, '/workspaces/:id', { id });
  }
  createWorkspace(body: unknown) {
    return this.api.post(PREFIX, '/workspaces', {}, body);
  }
  deleteWorkspace(id: string) {
    return this.api.delete(PREFIX, '/workspaces/:id', { id });
  }

  // Views
  listViews(workspaceId: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/workspaces/:workspaceId/views', { workspaceId }, query);
  }
  getView(workspaceId: string, viewId: string) {
    return this.api.get(PREFIX, '/workspaces/:workspaceId/views/:viewId', { workspaceId, viewId });
  }
  createView(workspaceId: string, body: unknown) {
    return this.api.post(PREFIX, '/workspaces/:workspaceId/views', { workspaceId }, body);
  }
  deleteView(workspaceId: string, viewId: string) {
    return this.api.delete(PREFIX, '/workspaces/:workspaceId/views/:viewId', { workspaceId, viewId });
  }

  // Reports & Dashboards
  listReports(workspaceId: string) {
    return this.api.get(PREFIX, '/workspaces/:workspaceId/reports', { workspaceId });
  }
  listDashboards(workspaceId: string) {
    return this.api.get(PREFIX, '/workspaces/:workspaceId/dashboards', { workspaceId });
  }

  // Import / Export
  importData(body: unknown) {
    return this.api.post(PREFIX, '/import', {}, body);
  }
  exportData(workspaceId: string, viewId: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/workspaces/:workspaceId/views/:viewId/export', { workspaceId, viewId }, query);
  }
}
