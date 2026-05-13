# invoice-management.component.ts

This component provides a full CRUD management interface for Zoho Invoice resources, organized into tabs for Customers and Invoices. Users can list, create, edit, and delete both customers and invoices through tabbed panels with inline forms.

## Key Exports

- `InvoiceManagementComponent` — Standalone Angular component with tabbed management UI for Zoho Invoice customers and invoices with full create/read/update/delete capabilities.

## Template

The template uses Material Tabs with two main panels: (1) Customers tab with a data table (name, company, email, phone), create/edit form panel, and row-level edit/delete actions; (2) Invoices tab with a similar table (number, customer, dates, total, status), form panel for create/edit, and row actions.

## Dependencies

- `@angular/core` — Component lifecycle, signals, change detection
- `@angular/common` — CommonModule
- `@angular/forms` — FormsModule for template-driven forms
- `@angular/material/*` — Tabs, Table, Button, Icon, FormField, Input, Select, SnackBar, ProgressSpinner, Tooltip, Card, Divider, Chips modules
- `ZohoInvoiceService` — API calls for customers and invoices (list, create, update, delete)
- `TranslatePipe` / `TranslateService` — i18n support
- `rxjs` — `firstValueFrom`

## How It Works

The component manages two independent CRUD flows using Angular signals for loading/data state and a `PanelMode` type (`'hidden' | 'create' | 'edit'`) to toggle form visibility. On init, customers are loaded. Each entity (customer, invoice) has dedicated methods for opening create/edit panels (pre-filling form data for edits), saving (calling the appropriate service create/update method by ID), and deleting (with browser confirmation dialog). All operations display toast notifications via `MatSnackBar` and refresh the relevant data list on success.
