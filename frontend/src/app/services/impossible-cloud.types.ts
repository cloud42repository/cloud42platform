// ─── Impossible Cloud Management Console API types ────────────────────────────
// Mirrors backend/src/impossible-cloud/impossible-cloud.dto.ts

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

export interface ICPartner {
  id?: string;
  name?: string;
  distributorContractId?: string;
  allocatedCapacity?: number;
  allowOverdraft?: boolean;
  details?: string;
}

/** Request body for creating a new partner. */
export interface ICCreatePartnerDTO {
  distributorContractId: string;
  name: string;
  allocatedCapacity: number;
  allowOverdraft?: boolean;
}

/** Request body for updating a partner. */
export interface ICUpdatePartnerDTO {
  name?: string;
  allocatedCapacity?: number;
}

// ─── Distributor → Members (MC users) ────────────────────────────────────────

export interface ICMember {
  id?: string;
  name?: string;
  email?: string;
  /** One of: admin, staff, viewer */
  role?: string;
}

/** Request body for creating a member. */
export interface ICCreateMemberDTO {
  email: string;
  password: string;
  /** One of: admin, staff, viewer */
  role: string;
  name?: string;
}

// ─── Storage Accounts ─────────────────────────────────────────────────────────

export interface ICStorageAccountClientAccount {
  contactEmail: string;
  password: string;
}

export interface ICStorageAccount {
  name?: string;
  clientAccountId?: string;
  contactEmail?: string;
  allocatedCapacity?: number;
  allowOverdraft?: boolean;
  /** ISO-8601 timestamp; set when deletion has been scheduled. */
  pendingDeletedAt?: string | null;
}

/** Request body for creating a storage account. */
export interface ICCreateStorageAccountDTO {
  name: string;
  allocatedCapacity: number;
  allowOverdraft: boolean;
  clientAccount: ICStorageAccountClientAccount;
}

/** Request body for patching a storage account. */
export interface ICPatchStorageAccountDTO {
  pendingDeletedAt?: string | null;
}

// ─── Usage ────────────────────────────────────────────────────────────────────

export interface ICDailyUsage {
  date?: string;
  usage?: number;
  allocated_capacity?: number;
}

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
