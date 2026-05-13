# books-dashboard.component.ts

This component renders a financial dashboard for Zoho Books, displaying KPI cards (contacts, invoices, bills, revenue, expenses, payments), a recent invoices table, and four Chart.js visualizations covering invoice status distribution, revenue vs expenses, monthly revenue trends, and vendor expense breakdown.

## Key Exports

- `BooksDashboardComponent` — Standalone Angular component that aggregates Zoho Books data into a visual dashboard with charts and financial KPIs.
- `BookInvoice` (interface) — Local type definition for normalized invoice records with fields: invoice_id, invoice_number, date, due_date, status, customer_name, total, balance.

## Template

The template shows a loading spinner, six KPI cards, a Material table of recent invoices (with status chips), and four chart panels: a status bar chart, a half-doughnut gauge (revenue vs expenses), a line chart (monthly revenue), and a pie chart (expenses by vendor).

## Dependencies

- `@angular/core` — Component lifecycle, change detection, ViewChild
- `@angular/common` — CommonModule, CurrencyPipe, DatePipe, PercentPipe
- `@angular/material/*` — Card, Icon, ProgressSpinner, Table, Chips, Divider, Tooltip, Button modules
- `ng2-charts` / `chart.js` — Chart rendering (Bar, Doughnut, Line controllers)
- `ZohoBooksService` — API calls for invoices, contacts, bills, expenses, payments
- `TranslatePipe` / `TranslateService` — i18n support
- `rxjs` — `firstValueFrom`

## How It Works

On `ngOnInit`, the component fires parallel API requests (`Promise.all`) for invoices, contacts, bills, expenses, and payments. Raw invoice data is normalized into the `BookInvoice` interface with deterministic status cycling for demo purposes. KPIs are computed from the aggregated data (totals, sums). `_buildCharts()` constructs Chart.js datasets for status distribution, revenue/expense gauge, monthly revenue line, and vendor pie chart using color palettes and month bucketing.
