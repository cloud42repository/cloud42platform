# dashboard.types.ts

This file defines the TypeScript type system for the dashboard builder feature, describing widget kinds, data sources, widget configuration, and the full dashboard definition structure used for rendering and persisting dashboards.

## Key Exports

- `WidgetKind` — Type union of widget visual types: `'line-chart' | 'bar-chart' | 'pie-chart' | 'data-table' | 'badge' | 'search-text'`
- `AggregateFunction` — Type union of aggregate functions for badge widgets: `'count' | 'sum' | 'avg' | 'max' | 'min'`
- `DataSourceMode` — Type union for widget data sourcing: `'api' | 'script'`
- `WidgetDataSource` — Interface describing how to resolve data from an API endpoint (module, path, method, params)
- `DashboardWidget` — Interface for a single widget on the canvas with position, size, data source, bindings, and script code
- `DashboardStatus` — Type union: `'draft' | 'published'`
- `Dashboard` — Interface for a full dashboard definition (id, name, widgets array, status, timestamps)

## Dependencies

- None (pure type definitions)

## How It Works

A `Dashboard` contains an array of `DashboardWidget` objects, each positioned on a grid (x, y, width, height). Each widget has a `kind` determining its visual type, a `dataSource` or `scriptCode` for fetching data, `bindings` for mapping response fields to chart axes or table columns, and an optional `dataPath` for navigating nested API responses. The `DataSourceMode` discriminator determines whether the widget calls an API endpoint directly or executes user-defined JavaScript to produce data.
