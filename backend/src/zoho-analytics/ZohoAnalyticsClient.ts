import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  AnalyticsWorkspace, CreateWorkspaceDTO,
  AnalyticsView, CreateViewDTO,
  AnalyticsReport,
  AnalyticsDashboard,
  DataImportConfig,
  AnalyticsListParams,
} from "./zoho-analytics.dto";

export interface ZohoAnalyticsConfig extends ZohoCredentials {
  /** Your Zoho Analytics account owner email */
  accountOwnerEmail?: string;
  organizationId?: string;
  /** Override the full API base URL. Defaults to https://analyticsapi.zoho.com/api/v2 */
  apiBaseUrl?: string;
}

/**
 * Zoho Analytics v2 API client.
 * Docs: https://www.zoho.com/analytics/api/
 */
export class ZohoAnalyticsClient extends ZohoBaseClient {
  private readonly ownerEmail?: string;

  constructor(config: ZohoAnalyticsConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://analyticsapi.zoho.com/api/v2",
    });
    this.ownerEmail = config.accountOwnerEmail;
  }

  private ownerPath(path: string): string {
    return this.ownerEmail ? `/workspaces${path}` : path;
  }

  // â”€â”€â”€ Workspaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listWorkspaces(): Promise<{ data: { workspaces: AnalyticsWorkspace[] } }> {
    return this.get("/workspaces");
  }
  getWorkspace(id: string): Promise<{ data: { workspace: AnalyticsWorkspace } }> {
    return this.get(`/workspaces/${id}`);
  }
  createWorkspace(data: CreateWorkspaceDTO): Promise<{ data: { workspace: AnalyticsWorkspace } }> {
    return this.post("/workspaces", data);
  }
  deleteWorkspace(id: string): Promise<unknown> {
    return this.delete(`/workspaces/${id}`);
  }

  // â”€â”€â”€ Views â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listViews(workspaceId: string, params?: AnalyticsListParams): Promise<{ data: { views: AnalyticsView[] } }> {
    return this.get(`/workspaces/${workspaceId}/views`, { params });
  }
  getView(workspaceId: string, viewId: string): Promise<{ data: AnalyticsView }> {
    return this.get(`/workspaces/${workspaceId}/views/${viewId}`);
  }
  createView(workspaceId: string, data: CreateViewDTO): Promise<{ data: AnalyticsView }> {
    return this.post(`/workspaces/${workspaceId}/views`, data);
  }
  deleteView(workspaceId: string, viewId: string): Promise<unknown> {
    return this.delete(`/workspaces/${workspaceId}/views/${viewId}`);
  }

  // â”€â”€â”€ Reports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listReports(workspaceId: string): Promise<{ data: { views: AnalyticsReport[] } }> {
    return this.get(`/workspaces/${workspaceId}/views`, { params: { viewType: "chart" } });
  }

  // â”€â”€â”€ Dashboards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listDashboards(workspaceId: string): Promise<{ data: { views: AnalyticsDashboard[] } }> {
    return this.get(`/workspaces/${workspaceId}/views`, { params: { viewType: "dashboard" } });
  }

  // â”€â”€â”€ Data Import â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  importData(config: DataImportConfig, data: unknown): Promise<unknown> {
    const { workspaceId, tableName, ...options } = config;
    return this.post(`/workspaces/${workspaceId}/tables/${tableName}/data`, {
      ...options,
      data,
    });
  }

  exportData(workspaceId: string, viewId: string, format: "csv" | "json" | "xlsx" = "json"): Promise<unknown> {
    return this.get(`/workspaces/${workspaceId}/views/${viewId}/data`, { params: { responseFormat: format } });
  }
}
