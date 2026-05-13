# application-viewer.component.ts

The Application Viewer is a runtime renderer for multi-page applications. It supports three navigation styles (sidebar, tabs, top-bar) and renders form, dashboard, and workflow pages with interactive elements. It can be loaded via route params (authenticated) or via a public share token.

## Key Exports

- **ApplicationViewerComponent** — Standalone Angular component that renders a complete application with navigation and page content, supporting both direct and shared/public access.

## Template

The template handles loading, error, and rendered states:

- **Loading State** — Spinner with "Loading application..." text.
- **Error State** — Error icon with message.
- **App Shell** — Wrapper with CSS class based on navigation style (`nav-sidebar`, `nav-tabs`, `nav-topbar`).
  - **Sidebar Nav** — Dark sidebar with app name and icon-labeled page buttons.
  - **Top Bar Nav** — Dark horizontal bar with app name and navigation buttons.
  - **Tabs Nav** — Light tab strip with underline active indicator.
- **Page Content Area** — Renders the active page:
  - **Form Renderer** — Displays form fields in a 12-column grid with appropriate inputs (text, number, date, boolean toggle, select dropdown, datatable), plus submit action buttons.
  - **Dashboard Renderer** — Shows widgets in a 12-column grid with type-specific icons and placeholder visualizations.
  - **Workflow Renderer** — Shows workflow info (step count, status), input fields, and a "Run Workflow" button.

## Dependencies

- `@angular/core` (Component, inject, signal, computed, OnInit, Input)
- `@angular/router` (ActivatedRoute, Router)
- `@angular/forms` (FormsModule)
- Angular Material (Button, Icon, Tooltip, ProgressSpinner, Divider, Tabs, FormField, Input, Select, SlideToggle, Sidenav)
- `ApplicationService` — Loads application by ID
- `ApplicationDefinition`, `AppPage`, `AppNavigation` from `application.types`
- `ShareService` — Resolves public share tokens
- `ApiService` — Executes form actions and API calls
- `FormService` — Loads form definitions for rendering
- `DashboardService` — Loads dashboard definitions
- `WorkflowService` — Loads workflow definitions

## How It Works

On init, the component checks for a share `token` or direct `id` route param. For shared views, it calls `shareSvc.resolvePublic(token)` to fetch the application definition. For direct access, it loads from `ApplicationService`. Once loaded, it navigates to the home page (or first page). The `navigateTo()` method sets the active page and loads associated data (form/dashboard/workflow definition) for rendering. Form pages render interactive fields with values tracked in a `fieldValues` signal — submit actions execute via API calls. Dashboard pages show widget layouts with placeholder visualizations. Workflow pages show inputs and allow execution with a running state indicator. The `@Input() appDefinition` allows embedding the viewer programmatically (e.g., from the builder's preview mode).
