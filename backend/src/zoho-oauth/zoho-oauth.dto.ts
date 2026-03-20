// ─── Zoho OAuth Token Generation DTOs ─────────────────────────────────────────
// Implements https://www.zoho.com/accounts/protocol/oauth/web-server-applications.html

/** Request body for GET /api/zoho-oauth/authorize (build authorization URL) */
export interface AuthorizeQueryDto {
  /** Falls back to env ZOHO_CLIENT_ID */
  clientId?: string;
  /** Space-separated Zoho scopes, e.g. "ZohoCRM.modules.ALL ZohoBooks.fullaccess.all" */
  scope: string;
  /** Falls back to env ZOHO_REDIRECT_URI */
  redirectUri?: string;
  /** Base accounts URL — falls back to env ZOHO_ACCOUNTS_URL / https://accounts.zoho.com */
  accountsUrl?: string;
  /** Optional CSRF state parameter */
  state?: string;
  /** "offline" (default) to request a refresh token, or "online" */
  accessType?: string;
}

/** Request body for POST /api/zoho-oauth/token — exchange grant token for access/refresh */
export interface GenerateTokenDto {
  /** The one-time grant/authorization code from Zoho callback */
  code: string;
  /** Falls back to env ZOHO_CLIENT_ID */
  clientId?: string;
  /** Falls back to env ZOHO_CLIENT_SECRET */
  clientSecret?: string;
  /** Falls back to env ZOHO_REDIRECT_URI */
  redirectUri?: string;
  /** Falls back to env ZOHO_ACCOUNTS_URL / https://accounts.zoho.com */
  accountsUrl?: string;
}

/** Request body for POST /api/zoho-oauth/refresh — refresh an access token */
export interface RefreshTokenDto {
  refreshToken: string;
  /** Falls back to env ZOHO_CLIENT_ID */
  clientId?: string;
  /** Falls back to env ZOHO_CLIENT_SECRET */
  clientSecret?: string;
  /** Falls back to env ZOHO_ACCOUNTS_URL / https://accounts.zoho.com */
  accountsUrl?: string;
}

/** Request body for POST /api/zoho-oauth/revoke — revoke a refresh token */
export interface RevokeTokenDto {
  /** The refresh token to revoke */
  refreshToken: string;
  /** Falls back to env ZOHO_ACCOUNTS_URL / https://accounts.zoho.com */
  accountsUrl?: string;
}

/** Zoho token endpoint response shape */
export interface ZohoTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  api_domain?: string;
  error?: string;
}
