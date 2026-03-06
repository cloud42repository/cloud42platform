import type { IAuthProvider } from "../auth/IAuthProvider";
export type { IAuthProvider };

// ─── Shared Client Config ─────────────────────────────────────────────────────

export interface ZohoCredentials {
  clientId: string;
  clientSecret: string;
  /**
   * Required when NOT providing a custom `authProvider`.
   * Long-lived OAuth2 refresh token obtained from the Authorization Code flow.
   */
  refreshToken?: string;
  /** OAuth accounts base URL – change for EU/IN/AU data centers.
   *  Defaults to https://accounts.zoho.com */
  accountsUrl?: string;
  /**
   * Plug in any IAuthProvider (ClientCredentialsAuth, PKCEAuth,
   * AuthorizationCodeAuth, DeviceFlowAuth, PassthroughAuth …).
   * When provided it takes full control of access-token acquisition;
   * clientId / clientSecret / refreshToken are passed through to the
   * provider but are otherwise ignored by ZohoBaseClient itself.
   */
  authProvider?: IAuthProvider;
}

export interface ZohoProductConfig extends ZohoCredentials {
  /** The product-specific API base URL */
  apiBaseUrl: string;
  /** Extra default query params added to every request (e.g. organization_id) */
  defaultParams?: Record<string, string>;
}

// ─── Generic API Response ─────────────────────────────────────────────────────

export interface ZohoApiResponse<T = unknown> {
  code: number; // 0 = success
  message: string;
  data?: T;
}

// ─── Regional base-URL helpers ────────────────────────────────────────────────

export type ZohoRegion = "com" | "eu" | "in" | "au" | "jp" | "ca";

export const ZOHO_ACCOUNTS_URL: Record<ZohoRegion, string> = {
  com: "https://accounts.zoho.com",
  eu: "https://accounts.zoho.eu",
  in: "https://accounts.zoho.in",
  au: "https://accounts.zoho.com.au",
  jp: "https://accounts.zoho.jp",
  ca: "https://accounts.zohocloud.ca",
};

export const ZOHO_API_BASE: Record<ZohoRegion, string> = {
  com: "https://www.zohoapis.com",
  eu: "https://www.zohoapis.eu",
  in: "https://www.zohoapis.in",
  au: "https://www.zohoapis.com.au",
  jp: "https://www.zohoapis.jp",
  ca: "https://www.zohoapis.ca",
};
