/** Widget kind — the visual representation of a data widget */
export type WidgetKind = 'line-chart' | 'bar-chart' | 'pie-chart' | 'data-table' | 'badge' | 'search-text';

/** Aggregate function for badge widgets */
export type AggregateFunction = 'count' | 'sum' | 'avg' | 'max' | 'min';

/** How the widget data is sourced: from an API endpoint or a script */
export type DataSourceMode = 'api' | 'script';

/** How to resolve the data source for a widget */
export interface WidgetDataSource {
  /** Module API prefix, e.g. '/zoho-crm' */
  moduleApiPrefix: string;
  /** Module label for display */
  moduleLabel: string;
  /** Endpoint path template, e.g. '/contacts' */
  pathTemplate: string;
  /** Endpoint label for display */
  endpointLabel: string;
  /** HTTP method */
  method: string;
  /** Path parameter values — may contain {{token}} expressions */
  pathParams: Record<string, string>;
  /** Query parameter values — may contain {{token}} expressions */
  queryParams: Record<string, string>;
}

/** A single widget on the dashboard canvas */
export interface DashboardWidget {
  id: string;
  kind: WidgetKind;
  label: string;
  /** Grid position & size */
  x: number;
  y: number;
  width: number;   // grid columns (1–12)
  height: number;  // grid rows

  /** How data is sourced: 'api' (default) or 'script' */
  dataSourceMode?: DataSourceMode;

  /** Where to fetch the data from (api mode) */
  dataSource?: WidgetDataSource;

  /** JavaScript code that returns the data array (script mode) */
  scriptCode?: string;

  /**
   * Data binding expressions ({{token}} syntax, same as workflow).
   * Keys vary per widget kind:
   *
   * line-chart:  labelField, valueField
   * bar-chart:   labelField, valueField
   * pie-chart:   labelField, valueField
   * data-table:  columns  (comma-separated field paths)
   * badge:       valueField, aggregation (count|sum|avg|max|min)
   */
  bindings: Record<string, string>;

  /** Dot-notation path into the response to reach the array of items */
  dataPath?: string;

  /** Last fetched data (transient, not persisted) */
  lastData?: unknown;
}

export type DashboardStatus = 'draft' | 'published';

/** A full dashboard definition */
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  status: DashboardStatus;
  createdAt: string;
  updatedAt: string;
}
