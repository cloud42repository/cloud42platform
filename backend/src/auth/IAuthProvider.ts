/**
 * Common interface all authentication providers must implement.
 * ZohoBaseClient calls getAccessToken() before every request and
 * invalidate() when a 401 is received so the next call forces re-auth.
 */
export interface IAuthProvider {
  /**
   * Returns a valid access token, refreshing/fetching as needed.
   */
  getAccessToken(): Promise<string>;

  /**
   * Discards any cached token so the next getAccessToken() obtains a new one.
   */
  invalidate(): void;
}

// ─── Shared token shapes ──────────────────────────────────────────────────────

export interface ZohoRawTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;  // seconds
  scope: string;
  error?: string;
  error_description?: string;
}

export interface CachedToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // ms epoch
}

// ─── Zoho Device-flow intermediate response ───────────────────────────────────

export interface ZohoDeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_url: string;
  expires_in: number;
  interval: number;
  error?: string;
}
