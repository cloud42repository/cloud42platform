# app.routes.ts

Defines the complete routing table for the Angular application. Maps URL paths to page components and applies the `authGuard` to protect authenticated routes.

## Key Exports / Components

- `routes` — `Routes` array containing all application route definitions:
  - `/login` — Login page (public)
  - `/set-password` — Password setup page (public)
  - `/workflows` — Workflow list, calendar, new, and edit (protected)
  - `/dashboards` — Dashboard list, new, and edit (protected)
  - `/forms` — Form list, new, and edit (protected)
  - `/applications` — Application list, new, edit, and view (protected)
  - `/settings` — Settings page (protected)
  - `/users` — User management (protected)
  - `/agent` — AI Agent page (protected)
  - `/api-tester` — API tester tool (protected)
  - `/shares` — Shared views list (protected)
  - `/shared/:token` — Public shared view (public)
  - Module-specific dashboards and management pages for IC, Books, Analytics, Campaigns, Invoice
  - Dynamic module pages generated from `MODULES` config
  - Wildcard redirect to `/login`

## Dependencies

- `@angular/router` — Routes type
- Page components — ModulePage, Login, WorkflowList/Builder/Calendar, Dashboard, Form, Settings, Agent, UserManagement, IC/Books/Analytics/Campaigns/Invoice dashboards and management, ApiTester, SharedViewer/List, SetPassword, Application components
- `authGuard` — Route guard that checks authentication status
- `MODULES` — Config array of available API modules

## How It Works

Routes are declared as a flat array with nested children for workflows, dashboards, forms, and applications. Most routes are protected by `authGuard` which redirects unauthenticated users to `/login`. The dynamic module routes are generated at the end by mapping over the `MODULES` array, assigning each module's `id` as both the path and route data. The wildcard `**` route catches unknown paths and redirects to login.
