/** Form field types */
export type FormFieldKind = 'text' | 'date' | 'select' | 'datatable';

/** API data source for select / datatable fields */
export interface FormFieldDataSource {
  moduleApiPrefix: string;
  moduleLabel: string;
  pathTemplate: string;
  endpointLabel: string;
  method: string;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  /** Dot-notation path into the response to reach the array of items */
  dataPath?: string;
}

/** A single field in the form */
export interface FormField {
  id: string;
  kind: FormFieldKind;
  label: string;
  placeholder?: string;
  required: boolean;
  /** Grid position & size */
  x: number;
  y: number;
  width: number;   // grid columns (1–12)
  height: number;  // grid rows

  /** For select: which field to use as display label */
  displayField?: string;
  /** For select: which field to use as value */
  valueField?: string;
  /** For datatable: comma-separated column field names */
  columns?: string;

  /** Data source for select & datatable */
  dataSource?: FormFieldDataSource;

  /** Runtime data (transient, not persisted) */
  lastData?: unknown;
}

/** How the request body is configured for a submit action */
export type BodyMode = 'fields' | 'text' | 'form';

/** Source for a single body field value */
export type BodyFieldSource =
  | { type: 'hardcoded'; value: string }
  | { type: 'form-field'; fieldId: string };

/** Submit action — maps to a specific API endpoint */
export interface FormSubmitAction {
  id: string;
  label: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  moduleApiPrefix: string;
  moduleLabel: string;
  pathTemplate: string;
  endpointLabel: string;
  pathParams: Record<string, string>;
  /** How body is configured: per-field, raw text/JSON, or form (default: 'fields') */
  bodyMode?: BodyMode;
  /** Ordered body field keys (fields mode) */
  bodyKeys: string[];
  /** Source config for each body field (fields mode) */
  bodySources: Record<string, BodyFieldSource>;
  /** Raw JSON body string (text/form mode) */
  rawBody?: string;
  /** Legacy mapping — kept for backward compat */
  bodyMapping: Record<string, string>;
  color: 'primary' | 'accent' | 'warn';
}

export type FormStatus = 'draft' | 'published';

/** A full form definition */
export interface FormDefinition {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  submitActions: FormSubmitAction[];
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
}
