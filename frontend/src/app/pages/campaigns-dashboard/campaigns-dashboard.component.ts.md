# campaigns-dashboard.component.ts

This component renders a marketing dashboard for Zoho Campaigns, displaying KPI cards (mailing lists, subscribers, campaigns, topics, sent/draft counts), a recent campaigns table, and four Chart.js visualizations covering campaign status distribution, delivery rate, campaigns over time, and subscriber distribution by list.

## Key Exports

- `CampaignsDashboardComponent` — Standalone Angular component that aggregates Zoho Campaigns data into a visual dashboard with charts and marketing KPIs.

## Template

The template shows a loading spinner, six KPI cards, a Material table of recent campaigns (with status and sent time), and four chart panels: a status bar chart, a half-doughnut gauge (delivery rate), a line chart (campaigns over time), and a pie chart (subscribers by mailing list).

## Dependencies

- `@angular/core` — Component lifecycle, change detection, ViewChild
- `@angular/common` — CommonModule, PercentPipe
- `@angular/material/*` — Card, Icon, ProgressSpinner, Table, Chips, Divider, Tooltip, Button modules
- `ng2-charts` / `chart.js` — Chart rendering (Bar, Doughnut, Line controllers)
- `ZohoCampaignsService` — API calls for mailing lists, campaigns, topics
- `TranslatePipe` / `TranslateService` — i18n support
- `rxjs` — `firstValueFrom`

## How It Works

On `ngOnInit`, the component fetches mailing lists, campaigns, and topics in parallel via `Promise.all`. Campaigns are enriched with deterministic status cycling for demo variety. KPIs are computed (delivery rate = sent/total), and `_buildCharts()` constructs four Chart.js datasets: status bar distribution with color mapping, a sent vs other gauge, a monthly time series using date bucketing, and a pie chart showing subscriber counts per mailing list.
