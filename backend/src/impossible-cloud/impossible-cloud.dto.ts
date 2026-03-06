// ─── Impossible Cloud Management Console API DTOs ─────────────────────────────
// Based on https://api.partner.impossiblecloud.com/swagger/doc.json  (v1.0)

// ─── Common / Shared ──────────────────────────────────────────────────────────

/** A geographic region with S3/IAM/STS endpoint URLs. */
export interface ICRegion {
  name?: string;
  s3_url?: string;
  iam_url?: string;
  sts_url?: string;
}

export interface ICListRegionsResponse {
  regions?: ICRegion[];
}

// ─── Distributor → Contracts ──────────────────────────────────────────────────

/** Distributor contract returned by GET /contract/list and GET /contract/{id}/partners. */
export interface ICContract {
  id?: string;
  distributorId?: string;
  allocatedCapacity?: number;
  reservedCapacity?: number;
  costStorageGBCents?: number;
  /** @deprecated always 0 */
  costEgressGBCents?: number;
  currency?: string;
  details?: string;
}

// ─── Distributor → Partners ───────────────────────────────────────────────────

/** A partner (channel-partner) belonging to a distributor contract. */
export interface ICPartner {
  id?: string;
  name?: string;
  distributorContractId?: string;
  allocatedCapacity?: number;
  allowOverdraft?: boolean;
  details?: string;
}

/** Request body for POST /partner – create a new partner. */
export interface ICCreatePartnerDTO {
  /** UUID of the distributor's contract */
  distributorContractId: string;
  name: string;
  /** Capacity in GB */
  allocatedCapacity: number;
  allowOverdraft?: boolean;
}

/** Request body for PUT /partner/{partnerID} – update name and/or allocation. */
export interface ICUpdatePartnerDTO {
  name?: string;
  /** Capacity in GB */
  allocatedCapacity?: number;
}

// ─── Distributor → Members (MC users) ────────────────────────────────────────

/** A Management Console user (member) of a partner. */
export interface ICMember {
  id?: string;
  name?: string;
  email?: string;
  /** One of: admin, staff, viewer */
  role?: string;
}

/** Request body for POST /partner/{partnerID}/member. */
export interface ICCreateMemberDTO {
  email: string;
  password: string;
  /** One of: admin, staff, viewer */
  role: string;
  name?: string;
}

// ─── Storage Accounts ─────────────────────────────────────────────────────────

/** The S3 client account credentials embedded in a storage account creation request. */
export interface ICStorageAccountClientAccount {
  contactEmail: string;
  /**
   * Password requirements:
   * – 8-128 chars
   * – at least one special char: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
   * – lower-case (a-z), upper-case (A-Z) and digits (0-9)
   */
  password: string;
}

/** A storage account associated with a partner. */
export interface ICStorageAccount {
  name?: string;
  clientAccountId?: string;
  contactEmail?: string;
  allocatedCapacity?: number;
  allowOverdraft?: boolean;
  /** ISO-8601 timestamp; set when deletion has been scheduled. */
  pendingDeletedAt?: string | null;
}

/** Request body for POST /partner/{id}/storage-accounts or POST /storage-account. */
export interface ICCreateStorageAccountDTO {
  name: string;
  allocatedCapacity: number;
  allowOverdraft: boolean;
  clientAccount: ICStorageAccountClientAccount;
}

/** Request body for PATCH /partner/{id}/storage-accounts/{accountID} or PATCH /storage-account/{id}. */
export interface ICPatchStorageAccountDTO {
  /** Set to a future ISO-8601 date to schedule deletion; null to cancel. */
  pendingDeletedAt?: string | null;
}

// ─── Usage ────────────────────────────────────────────────────────────────────

/** Daily usage data point. */
export interface ICDailyUsage {
  date?: string;
  usage?: number;
  allocated_capacity?: number;
}

/** Aggregated usage for a storage account / partner. */
export interface ICClientUsage {
  client_id?: string;
  name?: string;
  allocated_capacity?: number;
  daily_usage?: ICDailyUsage[];
}

/** Query params for usage endpoints. */
export interface ICUsageParams {
  /** yyyy-mm-dd */
  from: string;
  /** yyyy-mm-dd */
  to: string;
}
