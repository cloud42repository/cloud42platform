# shared-viewer.component.ts

This component renders a read-only view of a shared item (dashboard, form, workflow, or application) accessed via a share token URL. It supports rendering multiple item types with full visualization including charts (line, bar, pie), data tables, form fields with live data, and multi-page application navigation. It also provides Excel and PDF export capabilities.

## Key Exports

- **`SharedViewerComponent`** — Standalone Angular component for rendering shared content (no selector specified, used via routing)

## Template

The template handles multiple view types:
- **Loading state** — Spinner while fetching shared data
- **Error state** — "Not found" card with error message
- **Toolbar** — Item icon, title, type badge, export buttons (Excel/PDF), read-only badge
- **Application nav** — Tab or sidebar navigation for multi-page shared apps
- **Dashboard view** — Widget grid with search-text, line-chart, bar-chart, pie-chart, badge, and data-table widgets; each with refresh capability
- **Form view** — Field grid with text, number, boolean, date, select, datatable fields; action buttons and response panel
- **Workflow view** — (implied from type detection)

## Dependencies

- `@angular/material` — Button, Icon, ProgressSpinner, Divider, Tooltip, FormField, Input, Select, SlideToggle, Snackbar, Autocomplete
- `@angular/router` — ActivatedRoute (reads share token from URL)
- `ShareService` / `SharedItemData` — Fetches shared item data by token
- `WorkflowService` — Workflow execution for shared workflows
- `ApiService` — Executes API calls for widget/field data refresh
- `NotificationService` — Notifications from form actions
- `ApplicationDefinition` / `AppPage` / `Dashboard` / `DashboardWidget` — Type definitions
- `MODULES` / `extractPathParams` — Endpoint configuration
- `TranslatePipe` — i18n

## How It Works

On init, the component extracts the share token from the route, calls `ShareService` to fetch the shared item's data and type. Based on the item type, it sets up the appropriate view (dashboard, form, or application). For dashboards, it renders a widget grid and fetches data for each widget from its configured data source. For forms, it renders input fields and supports form actions that call APIs. For applications, it renders navigation and switches between pages. Chart widgets compute SVG geometry (points, bars, pie slices) from fetched data. The component provides export-to-Excel and export-to-PDF functionality for data-bearing views.
