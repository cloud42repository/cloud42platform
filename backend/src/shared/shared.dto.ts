/** Shared Zoho API response wrappers and primitive types. */

// ─── Generic Wrappers ─────────────────────────────────────────────────────────

export interface ZohoPageInfo {
  per_page: number;
  count: number;
  page: number;
  more_records: boolean;
}

export interface ZohoListWrapper<T> {
  data: T[];
  info?: ZohoPageInfo;
}

export interface ZohoSingleWrapper<T> {
  data: T[];  // Zoho always returns an array even for single-record endpoints
}

export interface ZohoBulkResult {
  code: string;
  details: Record<string, unknown>;
  message: string;
  status: "success" | "error";
}

export interface ZohoBulkResponse {
  data: ZohoBulkResult[];
}

// ─── Primitive value types ─────────────────────────────────────────────────────

export interface ZohoLookup {
  id: string;
  name?: string;
}

export interface ZohoAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface ZohoTax {
  tax_name: string;
  tax_percentage: number;
}

// ─── Common query params ──────────────────────────────────────────────────────

export interface ZohoListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  [key: string]: unknown;
}
