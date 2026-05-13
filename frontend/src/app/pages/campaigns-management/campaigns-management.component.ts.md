# campaigns-management.component.ts

This component provides a CRUD management interface for Zoho Campaigns resources, organized into four tabs: Mailing Lists, Subscribers, Campaigns, and Topics. Users can create/delete mailing lists, add/remove subscribers, send campaigns, and view topics.

## Key Exports

- `CampaignsManagementComponent` — Standalone Angular component with a four-tab management UI for Zoho Campaigns mailing lists, subscribers, campaigns, and topics.

## Template

The template uses Material Tabs with four panels: (1) Mailing Lists with a table, create form, and delete actions; (2) Subscribers with list selection, subscriber table, add form, and remove actions; (3) Campaigns with a table and send action per campaign; (4) Topics with a read-only table listing topic names and keys.

## Dependencies

- `@angular/core` — Component lifecycle, signals, change detection
- `@angular/common` — CommonModule
- `@angular/forms` — FormsModule for template-driven forms
- `@angular/material/*` — Tabs, Table, Button, Icon, FormField, Input, Select, SnackBar, ProgressSpinner, Tooltip, Card, Divider, Chips modules
- `ZohoCampaignsService` — API calls for mailing lists, subscribers, campaigns, topics
- `TranslatePipe` / `TranslateService` — i18n support
- `rxjs` — `firstValueFrom`

## How It Works

The component uses Angular signals for each tab's loading state and data arrays. On init, mailing lists are loaded. Subscribers require selecting a list key first. Each tab has its own panel mode (`'hidden' | 'create'`) for form visibility. CRUD operations call `ZohoCampaignsService` methods, display toast notifications for success/error, and refresh data. The Campaigns tab includes a `sendCampaign()` action with confirmation. Topics are read-only.
