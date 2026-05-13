# zoho-analytics.dto.ts

TypeScript interfaces and types defining the data structures used by the Zoho Analytics module. Covers workspaces, views, reports, dashboards, data import configuration, and list parameters.

## Key Exports

- **AnalyticsWorkspace** — Interface for workspace entity fields
- **CreateWorkspaceDTO** — DTO for creating a new workspace
- **AnalyticsViewType** — Union type: "table" | "chart" | "pivot" | "summary" | "criteria"
- **AnalyticsView** — Interface for view entity fields
- **CreateViewDTO** — DTO for creating a new view
- **AnalyticsReport** — Interface for report entity fields
- **AnalyticsDashboard** — Interface for dashboard entity fields
- **ImportType** — Union type for import modes: "append" | "updateadd" | "update" | "delete" | "truncateadd"
- **DataImportConfig** — Configuration for data import operations (workspace, table, file type, matching columns)
- **AnalyticsListParams** — Extended list parameters with workspace and view type filters

## Dependencies

- `ZohoListParams` from `../shared/shared.dto` — Base pagination/list parameters

## How It Works

Provides pure TypeScript type definitions used across the Zoho Analytics controller, service, and client. Each section groups related interfaces: workspaces, views, reports, dashboards, and data import configuration. `AnalyticsListParams` extends the shared base params with Analytics-specific filters.
