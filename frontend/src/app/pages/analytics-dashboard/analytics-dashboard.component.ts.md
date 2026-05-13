# analytics-dashboard.component.ts

This component provides a read-only dashboard view for Zoho Analytics data, displaying KPI cards (total workspaces, views, reports, dashboards), a data table of workspace details, and four Chart.js visualizations (bar, doughnut gauge, line, pie) summarizing workspace metrics.

## Key Exports

- `AnalyticsDashboardComponent` — Standalone Angular component that fetches Zoho Analytics workspace data and renders an interactive dashboard with charts and KPI summaries.

## Template

The template displays a loading spinner, four KPI metric cards, a material table listing workspaces with their view/report/dashboard counts, and four chart panels: a bar chart (views per workspace), a half-doughnut gauge (reports vs dashboards), a line chart (workspace data coverage), and a pie chart (views distribution).

## Dependencies

- `@angular/core` — Component lifecycle, change detection, ViewChild
- `@angular/common` — CommonModule, PercentPipe
- `@angular/material/*` — Card, Icon, ProgressSpinner, Table, Chips, Divider, Tooltip, Button modules
- `ng2-charts` / `chart.js` — Chart rendering (Bar, Doughnut, Line controllers)
- `ZohoAnalyticsService` — Backend API calls for workspaces, views, reports, dashboards
- `TranslatePipe` / `TranslateService` — i18n support
- `rxjs` — `firstValueFrom` for converting observables to promises

## How It Works

On initialization (`ngOnInit`), the component fetches the list of workspaces from `ZohoAnalyticsService`, then iterates over the first 6 workspaces to fetch their views, reports, and dashboards counts. It aggregates KPI totals, populates the table data, and calls `_buildCharts()` to configure Chart.js datasets with a color palette. All API calls use `firstValueFrom` for async/await style. Loading state and error handling wrap the entire flow, with `ChangeDetectorRef.detectChanges()` called in the `finally` block.
