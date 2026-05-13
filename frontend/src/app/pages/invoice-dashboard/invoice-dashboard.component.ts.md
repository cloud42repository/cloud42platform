# invoice-dashboard.component.ts

This component renders a financial dashboard for Zoho Invoice, displaying KPI cards (total invoices, revenue, paid amount, outstanding, overdue count, collection rate), a recent invoices table, and four Chart.js visualizations covering invoice status distribution, collection rate gauge, monthly revenue trends, and revenue by customer.

## Key Exports

- `InvoiceDashboardComponent` — Standalone Angular component that fetches Zoho Invoice data and presents financial metrics with interactive charts.
- `Invoice` (interface) — Local type definition for normalized invoice records with fields: invoice_id, invoice_number, date, due_date, status, customer_name, total, balance.

## Template

The template shows a loading spinner, six KPI cards, a Material table of recent invoices (with status chips), and four chart panels: a status bar chart, a half-doughnut gauge (collection rate), a line chart (monthly revenue), and a pie chart (revenue by customer).

## Dependencies

- `@angular/core` — Component lifecycle, change detection, ViewChild
- `@angular/common` — CommonModule, CurrencyPipe, DatePipe, PercentPipe
- `@angular/material/*` — Card, Icon, ProgressSpinner, Table, Chips, Divider, Tooltip, Button modules
- `ng2-charts` / `chart.js` — Chart rendering (Bar, Doughnut, Line controllers)
- `ZohoInvoiceService` — API calls for invoices
- `TranslatePipe` / `TranslateService` — i18n support
- `rxjs` — `firstValueFrom`

## How It Works

On `ngOnInit`, the component fetches invoices from `ZohoInvoiceService` and normalizes them into the `Invoice` interface with deterministic status cycling for demo variety. `_computeKpis()` calculates totals, paid amount, outstanding balance, overdue count, and collection rate. `_buildCharts()` constructs four Chart.js datasets: a status bar chart with color-coded statuses, a half-doughnut collection rate gauge, a monthly revenue line chart bucketed by month, and a pie chart showing revenue distribution by customer name.
