# ic-management.component.ts

This component provides a CRUD management interface for Impossible Cloud resources, organized into tabs for Storage Accounts and Partners. Users can create, edit (patch), and delete storage accounts, as well as create, update, and delete partners under a selected contract.

## Key Exports

- `IcManagementComponent` — Standalone Angular component with tabbed management UI for Impossible Cloud storage accounts and partners with full CRUD capabilities.
- `StorageAccountFormData` (interface) — Local form interface with fields: name, allocatedCapacity, allowOverdraft, contactEmail, password.

## Template

The template uses Material Tabs with two main panels: (1) Storage Accounts tab with a data table (name, clientAccountId, email, capacity, overdraft, status), create/edit form panels, and row-level actions (edit, delete); (2) Partners tab with contract selection dropdown, partner table, create/edit form panels, and row-level actions.

## Dependencies

- `@angular/core` — Component lifecycle, signals, change detection
- `@angular/common` — CommonModule
- `@angular/forms` — FormsModule for template-driven forms
- `@angular/material/*` — Tabs, Table, Button, Icon, FormField, Input, Select, SnackBar, ProgressSpinner, Tooltip, Card, Checkbox, Divider, Chips modules
- `ImpossibleCloudService` — API calls for contracts, storage accounts, partners
- `ICContract`, `ICPartner`, `ICStorageAccount`, and related DTO types — TypeScript interfaces
- `TranslatePipe` / `TranslateService` — i18n support
- `rxjs` — `firstValueFrom`

## How It Works

On init, the component loads contracts (used as foreign keys) and storage accounts. The Storage Accounts tab supports full CRUD: create sends an `ICCreateStorageAccountDTO`, edit patches with `ICPatchStorageAccountDTO` (e.g., pendingDeletedAt), and delete removes by clientAccountId. The Partners tab requires selecting a contract first, then loads partners for that contract. Partner create/edit use dedicated DTOs. All operations use Angular signals for state, `PanelMode` for form visibility toggling, `MatSnackBar` for notifications, and refresh data after mutations.
