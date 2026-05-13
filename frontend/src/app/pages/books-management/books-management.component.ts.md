# books-management.component.ts

This component provides a full CRUD management interface for Zoho Books resources, organized into tabs for Contacts and Invoices. Users can list, create, edit, and delete both contacts and invoices through tabbed panels with inline forms.

## Key Exports

- `BooksManagementComponent` — Standalone Angular component with tabbed management UI for Zoho Books contacts and invoices with full create/read/update/delete capabilities.

## Template

The template uses Material Tabs with two main panels: (1) Contacts tab with a data table, create/edit form panel, and row-level edit/delete actions; (2) Invoices tab with a similar table, form panel for create/edit, and row actions. Each form panel slides in based on the `PanelMode` state.

## Dependencies

- `@angular/core` — Component lifecycle, signals, change detection
- `@angular/common` — CommonModule
- `@angular/forms` — FormsModule for template-driven forms
- `@angular/material/*` — Tabs, Table, Button, Icon, FormField, Input, Select, SnackBar, ProgressSpinner, Tooltip, Card, Divider, Chips modules
- `ZohoBooksService` — API calls for contacts and invoices (list, create, update, delete)
- `TranslatePipe` / `TranslateService` — i18n support
- `rxjs` — `firstValueFrom`

## How It Works

The component manages two independent CRUD flows using Angular signals for loading/data state and a `PanelMode` type (`'hidden' | 'create' | 'edit'`) to toggle form visibility. On init, contacts are loaded. Each entity (contact, invoice) has dedicated methods for opening create/edit panels, saving (calling the appropriate service method), and deleting (with confirmation dialog). All operations show toast notifications via `MatSnackBar` and refresh the relevant data list on success.
