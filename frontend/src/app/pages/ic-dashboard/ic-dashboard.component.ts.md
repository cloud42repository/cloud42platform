# ic-dashboard.component.ts

This component renders a cloud infrastructure dashboard for Impossible Cloud, displaying KPI cards (regions, contracts, partners, storage accounts, allocated TB, overdraft-enabled count), a storage accounts table, and four Chart.js visualizations covering contract capacity, partners per contract, account health, and simulated monthly capacity growth.

## Key Exports

- `IcDashboardComponent` — Standalone Angular component that fetches Impossible Cloud data (regions, contracts, storage accounts) and presents an infrastructure overview dashboard with charts and KPIs.

## Template

The template shows a loading spinner, six KPI cards, a Material table of recent storage accounts (with status badges), and four chart panels: a grouped bar chart (contract capacity in GB), a bar chart (partners per contract), a doughnut chart (account health breakdown), and a line chart (simulated monthly capacity growth in TB).

## Dependencies

- `@angular/core` — Component lifecycle, change detection, ViewChild
- `@angular/common` — CommonModule, DecimalPipe, PercentPipe
- `@angular/material/*` — Card, Icon, ProgressSpinner, Table, Divider, Tooltip, Badge, Button modules
- `ng2-charts` / `chart.js` — Chart rendering (Bar, Doughnut, Line controllers)
- `ImpossibleCloudService` — API calls for regions, contracts, storage accounts
- `ICRegion`, `ICContract`, `ICPartner`, `ICStorageAccount` — TypeScript interfaces for IC entities
- `TranslatePipe` / `TranslateService` — i18n support
- `rxjs` — `firstValueFrom`

## How It Works

On `ngOnInit`, the component fetches regions, contracts, and storage accounts in parallel. A generic `_extract<T>()` helper normalizes various API response shapes into arrays. Partners are simulated by fanning out from contracts. Storage accounts are enriched with mock data (names, emails, capacity, overdraft flags, pending deletion). KPIs are computed in `_computeKpis()`, and `_buildCharts()` constructs four Chart.js datasets using IC-branded color constants for consistent styling.
