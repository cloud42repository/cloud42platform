# settings.component.ts

This component provides the platform settings page with multiple configuration tabs including API authentication credentials, module visibility, theme preferences, and user role management. It allows administrators to configure service credentials for all integrated API modules (Zoho, Impossible Cloud, Microsoft Graph, etc.).

## Key Exports

- **`SettingsComponent`** — Standalone Angular component for platform configuration (selector: `app-settings`)
- **`ServiceGroupState`** — Interface representing the state of a service configuration group (values, dirty tracking, secret visibility)

## Template

The template is organized as:
- Page header with "Save All" button
- Tab group containing:
  - **API Authentication** tab — Expansion panels per service group with credential fields, configured/unconfigured badges, summary chips
  - **Module Visibility** tab — Toggle switches for enabling/disabling API modules
  - **Theme** tab — Color theme selection
  - **User Management** tab — Role-based access settings

## Dependencies

- `@angular/material` — Expansion, Select, Input, Button, Icon, Chips, Card, Tabs, SlideToggle, Badge, ButtonToggle, Snackbar, Tooltip, Divider
- `MODULES` — Module definitions from endpoints config
- `SERVICE_CONFIG_GROUPS` / `AuthConfig` — Service credential configuration schema
- `AuthConfigService` — Persists/loads auth credentials
- `ModuleVisibilityService` — Manages which modules are shown
- `UserManagementService` — User role management
- `AuthService` — Current user auth context
- `ThemeService` — Theme color management
- `TranslatePipe` — i18n translation

## How It Works

On initialization, the component loads all service configuration groups from `SERVICE_CONFIG_GROUPS`, initializes their state (values, dirty flags, secret toggles), and fetches existing saved configurations from `AuthConfigService`. Each service group has editable fields (some marked as secrets). Changes are tracked per-group with dirty state. The "Save All" button persists all dirty groups to the backend. Module visibility toggles update the `ModuleVisibilityService`, and theme changes are applied via `ThemeService`.
