import axios from "axios";
import { IAuthProvider, ZohoRawTokenResponse, CachedToken } from "./IAuthProvider";

const EXPIRY_BUFFER_MS = 60_000;

export interface AuthCodeConfig {
  clientId: string;
  clientSecret: string;
  /** The redirect URI registered in the Zoho API Console */
  redirectUri: string;
  accountsUrl?: string;
}

export interface AuthCodeTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Auth strategy: OAuth2 Authorization Code Grant
 *
 * Full user-interactive flow:
 *   1. Direct the user to getAuthorizationUrl() – they log in and approve.
 *   2. Zoho redirects back with ?code=... in the query string.
 *   3. Call exchangeCode(code) to obtain access + refresh tokens.
 *   4. The provider caches the tokens and automatically re-exchanges
 *      the refresh token when the access token expires.
 *
 * Zoho docs: https://www.zoho.com/accounts/protocol/oauth/web-server-applications.html
 */
export class AuthorizationCodeAuth implements IAuthProvider {
  private cache: CachedToken | null = null;

  constructor(
    private readonly cfg: AuthCodeConfig,
    /** Pre-load tokens if you already completed the code exchange once */
    initialTokens?: AuthCodeTokens
  ) {
    if (initialTokens) {
      this.cache = {
        accessToken: initialTokens.accessToken,
        refreshToken: initialTokens.refreshToken,
        expiresAt: initialTokens.expiresAt,
      };
    }
  }

  // ── Step 1: Build the authorization URL ─────────────────────────────────────

  /**
   * Returns the URL to which you should redirect the user.
   *
   * @param scope  Space-separated Zoho scopes, e.g. "ZohoCRM.modules.ALL"
   * @param state  Optional CSRF state parameter
   */
  getAuthorizationUrl(scope: string, state?: string): string {
    const accountsUrl = this.cfg.accountsUrl ?? "https://accounts.zoho.com";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.cfg.clientId,
      redirect_uri: this.cfg.redirectUri,
      scope,
      access_type: "offline", // request a refresh token
    });
    if (state) params.set("state", state);
    return `${accountsUrl}/oauth/v2/auth?${params.toString()}`;
  }

  // ── Step 2: Exchange the authorization code ──────────────────────────────────

  /**
   * Exchange a one-time authorization code for access + refresh tokens.
   * Call this once after the user is redirected back to your redirectUri.
   */
  async exchangeCode(code: string): Promise<AuthCodeTokens> {
    const accountsUrl = this.cfg.accountsUrl ?? "https://accounts.zoho.com";
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.cfg.clientId,
      client_secret: this.cfg.clientSecret,
      redirect_uri: this.cfg.redirectUri,
      code,
    });

    const res = await axios.post<ZohoRawTokenResponse>(
      `${accountsUrl}/oauth/v2/token`,
      body.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (res.data.error) {
      throw new Error(
        `[AuthorizationCodeAuth] ${res.data.error}: ${res.data.error_description ?? ""}`
      );
    }

    if (!res.data.refresh_token) {
      throw new Error(
        "[AuthorizationCodeAuth] No refresh_token in response. Ensure access_type=offline was set."
      );
    }

    const tokens: AuthCodeTokens = {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
      expiresAt: Date.now() + res.data.expires_in * 1000,
    };

    this.cache = { ...tokens };
    return tokens;
  }

  // ── IAuthProvider ────────────────────────────────────────────────────────────

  invalidate(): void {
    if (this.cache) {
      // Keep the refresh token; only clear the access token so it gets re-fetched.
      this.cache = { ...this.cache, expiresAt: 0 };
    }
  }

  async getAccessToken(): Promise<string> {
    if (this.cache && Date.now() < this.cache.expiresAt - EXPIRY_BUFFER_MS) {
      return this.cache.accessToken;
    }

    if (!this.cache?.refreshToken) {
      throw new Error(
        "[AuthorizationCodeAuth] No tokens available. Call exchangeCode() first."
      );
    }

    // Silently re-exchange using the stored refresh token
    const accountsUrl = this.cfg.accountsUrl ?? "https://accounts.zoho.com";
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.cfg.clientId,
      client_secret: this.cfg.clientSecret,
      refresh_token: this.cache.refreshToken,
    });

    const res = await axios.post<ZohoRawTokenResponse>(
      `${accountsUrl}/oauth/v2/token`,
      body.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (res.data.error) {
      throw new Error(
        `[AuthorizationCodeAuth] token refresh: ${res.data.error}: ${res.data.error_description ?? ""}`
      );
    }

    this.cache = {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token ?? this.cache.refreshToken,
      expiresAt: Date.now() + res.data.expires_in * 1000,
    };
    return this.cache.accessToken;
  }

  /** Returns the currently cached tokens (useful to persist them). */
  getCachedTokens(): AuthCodeTokens | null {
    if (!this.cache) return null;
    return {
      accessToken: this.cache.accessToken,
      refreshToken: this.cache.refreshToken!,
      expiresAt: this.cache.expiresAt,
    };
  }
}
