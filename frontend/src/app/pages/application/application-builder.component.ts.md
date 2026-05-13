# application-builder.component.ts

The Application Builder is a visual editor for composing multi-page applications from existing forms, dashboards, and workflows. It provides page management with drag-and-drop reordering, navigation style configuration, sharing capabilities, and a live preview of page layout.

## Key Exports

- **ApplicationBuilderComponent** — Standalone Angular component implementing the application design surface with page CRUD, navigation configuration, sharing, and export.

## Template

The template is organized as a toolbar and a three-panel body:

- **Top Toolbar** — Back button, app icon, editable name input, status menu (draft/published), preview button, export button, share button with copied badge, and save button.
- **Share Panel (overlay)** — User selection checkboxes for sharing with specific users, share/copy-link button, and URL display.
- **Pages Panel (left)** — Lists application pages as draggable items with type icons (form/dashboard/workflow), labels, home page badge, and delete buttons. Includes an "Add page" menu with type options.
- **Preview Panel (center)** — Shows a preview of the selected page with its type icon, linked item name, and a placeholder indicating runtime rendering.
- **Properties Panel (right)** — When a page is selected: label input, icon input, item selector (dropdown of available forms/dashboards/workflows), and "set as home" button. Navigation style selector (sidebar/tabs/top-bar). App settings section with description textarea.

## Dependencies

- `@angular/core` (Component, inject, signal, computed, OnInit, OnDestroy)
- `@angular/cdk/drag-drop` (DragDropModule, moveItemInArray)
- Angular Material (Button, Icon, Tooltip, FormField, Input, Select, Divider, Menu, SnackBar, Dialog, Checkbox)
- `ApplicationService` — CRUD for application definitions
- `ApplicationDefinition`, `AppPage`, `AppNavigation` from `application.types`
- `FormService` — Access available forms for page binding
- `DashboardService` — Access available dashboards
- `WorkflowService` — Access available workflows
- `ShareService` — Sharing functionality
- `UserManagementService` — User list for targeted sharing
- `TranslatePipe` — i18n

## How It Works

On init, the component loads an existing application by route ID or creates a new one. Users add pages via a menu (form/dashboard/workflow type), which creates an `AppPage` entry. Pages are reorderable via drag-and-drop. Selecting a page reveals its properties panel where the user sets a label, icon, and links it to a specific form/dashboard/workflow by ID from the respective service's collection. Navigation style (sidebar, tabs, top-bar) is configurable globally. A debounced auto-save triggers on most changes. The share panel supports selecting specific users or generating a public link. Export downloads the application definition as JSON.
