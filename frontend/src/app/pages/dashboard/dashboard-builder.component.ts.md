# dashboard-builder.component.ts

The Dashboard Builder is a full-featured visual editor for creating and configuring dashboards. It provides a drag-and-drop interface with a widget browser panel, a grid-based canvas, and a configuration panel for setting up data sources, bindings, and visualizations.

## Key Exports

- **DashboardBuilderComponent** — Standalone Angular component that implements the dashboard design surface with widget management, data fetching, live chart rendering, PDF/Excel export, and sharing capabilities.

## Template

The template is organized into three main panels within a `cdkDropListGroup`:

- **Browser Panel (left)** — Lists available widget types (line chart, bar chart, pie chart, data table, badge, search text) as draggable items, plus a searchable endpoint browser grouped by API module.
- **Canvas (center)** — Toolbar with name input, save/preview/export/share buttons. Below is a 12-column CSS grid canvas where widgets are dropped, reordered, and resized. Widgets render live SVG charts, data tables, badges, and search inputs in preview mode.
- **Config Panel (right)** — Opens when a widget is selected. Allows configuring label, data source (API endpoint or script), path/query params, data path, field bindings, aggregation, and widget size.
- **Share Panel (overlay)** — User selection panel for sharing dashboards with specific users or generating a public link.
- **Script IntelliSense Overlay** — Autocomplete suggestions for the script editor.

## Dependencies

- `@angular/core` (Component, signal, computed, OnInit, inject)
- `@angular/cdk/drag-drop` (CdkDrag, CdkDropList, CdkDropListGroup, etc.)
- Angular Material (Button, Icon, FormField, Input, Select, Tooltip, Divider, ProgressSpinner, Checkbox, Dialog, SnackBar)
- `DashboardService` — CRUD operations for dashboards
- `ShareService` — Share/public link management
- `UserManagementService` — Load shareable users
- `ApiService` — Execute API calls for widget data
- `Dashboard`, `DashboardWidget`, `WidgetKind`, `AggregateFunction` from `dashboard.types`
- `MODULES`, `ModuleDef`, `EndpointDef` from `endpoints` config
- `TranslatePipe` — i18n translation
- `ScriptEditorDialogComponent` — Full-screen script editing dialog

## How It Works

On init, the component loads an existing dashboard by route param ID or creates a new one. The browser panel provides draggable widget types and API endpoint references. When dropped onto the canvas, a new widget is created with default settings. Selecting a widget opens the config panel where users choose a data source mode (API or script), configure endpoint parameters, set a data path to extract arrays, and bind fields for chart labels/values or table columns. The `fetchWidgetData` method calls the configured API or evaluates the script, storing results in `widget.lastData`. The canvas then renders live SVG visualizations (line/bar/pie charts), HTML tables, or badge aggregates. Widgets support drag-to-reorder and mouse-based resize handles. Save persists to `DashboardService`, and export generates PDF or Excel output. Sharing creates a public token URL or targets specific users.
