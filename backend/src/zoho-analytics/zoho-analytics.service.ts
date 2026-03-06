import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoAnalyticsClient } from './ZohoAnalyticsClient';

@Injectable()
export class ZohoAnalyticsService {
  readonly client: ZohoAnalyticsClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoAnalyticsClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      accountOwnerEmail: config.get('ZOHO_ANALYTICS_OWNER_EMAIL'),
    });
  }

  listWorkspaces() { return this.client.listWorkspaces(); }
  getWorkspace(id: string) { return this.client.getWorkspace(id); }
  createWorkspace(data: unknown) { return this.client.createWorkspace(data as any); }
  deleteWorkspace(id: string) { return this.client.deleteWorkspace(id); }

  listViews(workspaceId: string, params?: Record<string, unknown>) { return this.client.listViews(workspaceId, params as any); }
  getView(workspaceId: string, viewId: string) { return this.client.getView(workspaceId, viewId); }
  createView(workspaceId: string, data: unknown) { return this.client.createView(workspaceId, data as any); }
  deleteView(workspaceId: string, viewId: string) { return this.client.deleteView(workspaceId, viewId); }

  listReports(workspaceId: string) { return this.client.listReports(workspaceId); }
  listDashboards(workspaceId: string) { return this.client.listDashboards(workspaceId); }

  importData(config: unknown, data: unknown) { return this.client.importData(config as any, data); }
  exportData(workspaceId: string, viewId: string, format: 'csv' | 'json' | 'xlsx' = 'json') { return this.client.exportData(workspaceId, viewId, format); }
}
