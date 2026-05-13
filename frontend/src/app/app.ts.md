# app.ts

The root application shell component. It defines the top-level layout including the Material toolbar, collapsible sidenav with navigation links, an AI agent panel, notification panel, and the router outlet for page content.

## Key Exports / Components

- `App` — Standalone root component (`selector: 'app-root'`) that renders the application shell with:
  - Material toolbar with theme toggle, agent toggle, notifications, language switcher, and user menu
  - Side navigation with links to modules, workflows, dashboards, forms, applications, settings, and user management
  - Module sub-views (dashboard/management) for IC, Zoho Invoice, Books, Analytics, and Campaigns
  - Embedded `AgentComponent` slide-in panel
  - `NotificationPanelComponent` for real-time alerts

## Dependencies

- `@angular/core` — Component, signal, inject, OnInit
- `@angular/router` — Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd
- `@angular/material/*` — Sidenav, List, Toolbar, Icon, Button, Tooltip, Menu, Divider, Expansion
- `AuthService` — Authentication state and sign-out
- `ModuleVisibilityService` — Controls which API modules are shown in the sidebar
- `UserManagementService` — User role information
- `TranslateService` / `TranslatePipe` — i18n support
- `ThemeService` — Light/dark mode toggle
- `NotificationService` — Notification state

## How It Works

On initialization, the component subscribes to `NavigationEnd` events to auto-close the sidenav on mobile. The sidebar is populated from the `MODULES` config filtered by `ModuleVisibilityService`. Each module can optionally display dashboard and management sub-routes via the `MODULE_VIEWS` lookup table. The toolbar provides global actions: theme toggle, agent panel, notifications, language selection, and sign-out. The `<router-outlet>` renders the active page content.
