import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { attachMockAdapter } from "../mock/mock-adapter";
import type {
  ICContract,
  ICPartner,
  ICCreatePartnerDTO,
  ICUpdatePartnerDTO,
  ICMember,
  ICCreateMemberDTO,
  ICStorageAccount,
  ICCreateStorageAccountDTO,
  ICPatchStorageAccountDTO,
  ICClientUsage,
  ICUsageParams,
  ICListRegionsResponse,
} from "./impossible-cloud.dto";

// â”€â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ImpossibleCloudConfig {
  /**
   * Bearer API key obtained from the Management Console.
   * Sent as: `Authorization: Bearer <apiKey>`
   */
  apiKey: string;
  /**
   * Override the full API base URL.
   * Defaults to https://api.partner.impossiblecloud.com/v1
   */
  baseUrl?: string;
  /** Request timeout in milliseconds.  Defaults to 30 000. */
  timeout?: number;
}

// â”€â”€â”€ Error â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export class ImpossibleCloudApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: unknown
  ) {
    super(`[ImpossibleCloud ${status}] ${message}`);
    this.name = "ImpossibleCloudApiError";
  }
}

// â”€â”€â”€ Client â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MOCK_MODE = process.env['MOCK_MODE'] === 'true';

const DEFAULT_BASE_URL = "https://api.partner.impossiblecloud.com/v1";
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Impossible Cloud Management Console API client.
 *
 * Covers all three tag groups from the public Swagger (OAS 2.0):
 *   â€“ Integrations  (no auth required)
 *   â€“ Distributors  (API key required)
 *   â€“ Partners      (API key required)
 *
 * Authentication is done via a static Bearer token:
 *   `Authorization: Bearer <apiKey>`
 *
 * @example
 * ```ts
 * const ic = new ImpossibleCloudClient({
 *   apiKey: process.env.IC_API_KEY!,
 * });
 *
 * const contracts = await ic.listContracts();
 * ```
 */
export class ImpossibleCloudClient {
  private readonly http: AxiosInstance;
  private apiKey: string;

  constructor(config: ImpossibleCloudConfig) {
    this.apiKey = config.apiKey;

    this.http = axios.create({
      baseURL: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
      headers: { "Content-Type": "application/json" },
    });

    this.attachInterceptors();

    if (MOCK_MODE) {
      attachMockAdapter(this.http);
    }
  }

  // â”€â”€ Interceptors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private attachInterceptors(): void {
    this.http.interceptors.request.use(
      (req: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        req.headers.set("Authorization", `Bearer ${this.apiKey}`);
        return req;
      },
      (err: unknown) => Promise.reject(err)
    );

    this.http.interceptors.response.use(
      (res) => res,
      async (err: AxiosError) => {
        const status = err.response?.status ?? 0;
        const data = err.response?.data;
        const message =
          (data as { message?: string } | undefined)?.message ??
          err.message ??
          "Unknown error";
        throw new ImpossibleCloudApiError(message, status, data);
      }
    );
  }

  // â”€â”€ Generic HTTP helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async get<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.get<T>(path, config)).data;
  }

  async post<T = unknown>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.post<T>(path, data, config)).data;
  }

  async put<T = unknown>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.put<T>(path, data, config)).data;
  }

  async patch<T = unknown>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.patch<T>(path, data, config)).data;
  }

  async delete<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.delete<T>(path, config)).data;
  }

  /** Raw Axios instance â€“ useful for tests and advanced use-cases. */
  get axiosInstance(): AxiosInstance {
    return this.http;
  }

  /** Update the API key at runtime (e.g. key rotation). */
  updateApiKey(newKey: string): void {
    this.apiKey = newKey;
  }

  // â”€â”€ Integrations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * GET /integration/regions/list
   * Lists all available regions (no authentication required).
   */
  listRegions(): Promise<ICListRegionsResponse> {
    return this.get("/integration/regions/list");
  }

  // â”€â”€ Distributors â†’ Contracts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * GET /contract/list
   * Returns all contracts available to the authenticated distributor.
   */
  listContracts(): Promise<ICContract[]> {
    return this.get("/contract/list");
  }

  /**
   * GET /contract/{contractID}/partners
   * Returns all partners belonging to the specified contract.
   */
  listContractPartners(contractId: string): Promise<ICPartner[]> {
    return this.get(`/contract/${contractId}/partners`);
  }

  // â”€â”€ Distributors â†’ Partners â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * POST /partner
   * Creates a new partner within a contract.
   */
  createPartner(data: ICCreatePartnerDTO): Promise<ICPartner> {
    return this.post("/partner", data);
  }

  /**
   * GET /partner/{partnerID}
   * Retrieves a partner by its UUID.
   */
  getPartner(partnerId: string): Promise<ICPartner> {
    return this.get(`/partner/${partnerId}`);
  }

  /**
   * PUT /partner/{partnerID}
   * Updates a partner's name and/or allocated capacity.
   */
  updatePartner(partnerId: string, data: ICUpdatePartnerDTO): Promise<ICPartner> {
    return this.put(`/partner/${partnerId}`, data);
  }

  /**
   * DELETE /partner/{partnerID}
   * Deletes an empty partner (no storage accounts).
   * Returns 204 No Content on success.
   */
  deletePartner(partnerId: string): Promise<void> {
    return this.delete(`/partner/${partnerId}`);
  }

  // â”€â”€ Distributors â†’ Members â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * POST /partner/{partnerID}/member
   * Creates a Management Console user for a specific partner.
   */
  createMember(partnerId: string, data: ICCreateMemberDTO): Promise<ICMember> {
    return this.post(`/partner/${partnerId}/member`, data);
  }

  /**
   * DELETE /partner/{partnerID}/member/{memberID}
   * Removes a Management Console user from a specific partner.
   */
  deleteMember(partnerId: string, memberId: string): Promise<void> {
    return this.delete(`/partner/${partnerId}/member/${memberId}`);
  }

  /**
   * GET /partner/{partnerID}/members
   * Lists all Management Console users for a specific partner.
   */
  listMembers(partnerId: string): Promise<ICMember[]> {
    return this.get(`/partner/${partnerId}/members`);
  }

  // â”€â”€ Distributors â†’ Storage Accounts (scoped to partner) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * GET /partner/{partnerID}/storage-accounts
   * Lists all storage accounts for a specific partner.
   */
  listPartnerStorageAccounts(partnerId: string): Promise<ICStorageAccount[]> {
    return this.get(`/partner/${partnerId}/storage-accounts`);
  }

  /**
   * POST /partner/{partnerID}/storage-accounts
   * Creates a new storage account for a specific partner.
   */
  createPartnerStorageAccount(
    partnerId: string,
    data: ICCreateStorageAccountDTO
  ): Promise<ICStorageAccount> {
    return this.post(`/partner/${partnerId}/storage-accounts`, data);
  }

  /**
   * GET /partner/{partnerID}/storage-accounts/{accountID}
   * Retrieves a specific storage account for a partner.
   */
  getPartnerStorageAccount(partnerId: string, accountId: string): Promise<ICStorageAccount> {
    return this.get(`/partner/${partnerId}/storage-accounts/${accountId}`);
  }

  /**
   * DELETE /partner/{partnerID}/storage-accounts/{accountID}
   * Schedules deletion of a storage account (default: 30 days).
   */
  deletePartnerStorageAccount(partnerId: string, accountId: string): Promise<void> {
    return this.delete(`/partner/${partnerId}/storage-accounts/${accountId}`);
  }

  /**
   * PATCH /partner/{partnerID}/storage-accounts/{accountID}
   * Updates metadata of a storage account (e.g. scheduled deletion date).
   */
  patchPartnerStorageAccount(
    partnerId: string,
    accountId: string,
    data: ICPatchStorageAccountDTO
  ): Promise<ICStorageAccount> {
    return this.patch(`/partner/${partnerId}/storage-accounts/${accountId}`, data);
  }

  // â”€â”€ Distributors â†’ Usage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * GET /partner/{partnerID}/storage-accounts/{accountID}/usage
   * Retrieves usage for a single storage account of a distributor partner.
   */
  getPartnerStorageAccountUsage(
    partnerId: string,
    accountId: string,
    params: ICUsageParams
  ): Promise<ICClientUsage> {
    return this.get(`/partner/${partnerId}/storage-accounts/${accountId}/usage`, { params });
  }

  /**
   * GET /partner/{partnerID}/usage
   * Retrieves aggregated usage across all storage accounts of a distributor partner.
   */
  getPartnerUsage(partnerId: string, params: ICUsageParams): Promise<ICClientUsage[]> {
    return this.get(`/partner/${partnerId}/usage`, { params });
  }

  // â”€â”€ Partners â†’ Storage Accounts (self-service) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * POST /storage-account
   * Creates a storage account (Partners role).
   */
  createStorageAccount(data: ICCreateStorageAccountDTO): Promise<ICStorageAccount> {
    return this.post("/storage-account", data);
  }

  /**
   * GET /storage-account/list
   * Lists all storage accounts owned by the authenticated partner.
   */
  listStorageAccounts(): Promise<ICStorageAccount[]> {
    return this.get("/storage-account/list");
  }

  /**
   * GET /storage-account/{accountID}
   * Retrieves a storage account by its ID.
   */
  getStorageAccount(accountId: string): Promise<ICStorageAccount> {
    return this.get(`/storage-account/${accountId}`);
  }

  /**
   * DELETE /storage-account/{accountID}
   * Schedules deletion of a storage account (default: 30 days).
   */
  deleteStorageAccount(accountId: string): Promise<void> {
    return this.delete(`/storage-account/${accountId}`);
  }

  /**
   * PATCH /storage-account/{accountID}
   * Updates metadata of a storage account (e.g. scheduled deletion date).
   */
  patchStorageAccount(
    accountId: string,
    data: ICPatchStorageAccountDTO
  ): Promise<ICStorageAccount> {
    return this.patch(`/storage-account/${accountId}`, data);
  }

  /**
   * GET /storage-account/{accountID}/usage
   * Retrieves usage for a single storage account (Partners role).
   */
  getStorageAccountUsage(accountId: string, params: ICUsageParams): Promise<ICClientUsage> {
    return this.get(`/storage-account/${accountId}/usage`, { params });
  }

  /**
   * GET /storage-accounts/usage
   * Retrieves usage across all storage accounts of the authenticated partner.
   */
  getAllStorageAccountsUsage(params: ICUsageParams): Promise<ICClientUsage[]> {
    return this.get("/storage-accounts/usage", { params });
  }
}
