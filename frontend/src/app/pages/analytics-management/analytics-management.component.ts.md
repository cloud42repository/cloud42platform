# analytics-management.component.ts

This component provides a CRUD management interface for Zoho Analytics resources, organized into three tabs: Workspaces, Views, and Import. Users can list, create, and delete workspaces and views, as well as trigger data imports.

## Key Exports

- `AnalyticsManagementComponent` — Standalone Angular component with tabbed management UI for Zoho Analytics workspaces, views, and data import operations.

## Template

The template uses Material Tabs with three panels: (1) Workspaces tab with a table, create form panel, and delete actions; (2) Views tab with workspace selection, table listing views, create form, and delete actions; (3) Import tab with a form for workspace ID, view ID, import type, and file URL.

## Dependencies

- `@angular/core` — Component lifecycle, signals, change detection
- `@angular/common` — CommonModule
- `@angular/forms` — FormsModule for template-driven forms
- `@angular/material/*` — Tabs, Table, Button, Icon, FormField, Input, Select, SnackBar, ProgressSpinner, Tooltip, Card, Divider, Chips modules
- `ZohoAnalyticsService` — API calls for workspaces, views, and import operations
- `TranslatePipe` / `TranslateService` — i18n support
- `rxjs` — `firstValueFrom`

## How It Works

The component uses Angular signals for loading states and data arrays. On init, it loads workspaces. Each tab has its own CRUD flow: panel modes (`'hidden' | 'create' | 'edit'`) control form visibility. Create/delete operations call `ZohoAnalyticsService` methods via `firstValueFrom`, show success/error toasts via `MatSnackBar`, and reload the relevant data list. The Import tab sends workspace/view IDs and import configuration to the backend to trigger data ingestion.
