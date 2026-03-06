import axios from "axios";
import { IAuthProvider, ZohoRawTokenResponse, CachedToken } from "./IAuthProvider";

const EXPIRY_BUFFER_MS = 60_000;

export interface OAuthRefreshConfig {
  clientId: string;
  clientSecret: string;
  /** A long-lived refresh token obtained from the Authorization Code flow. */
  oauthRefreshToken: string;
  accountsUrl?: string;
}

/**
 * Auth strategy: OAuth2 Refresh Token Grant
 *
 * The simplest server-side flow. You already have a refresh token
 * (obtained once via the Authorization Code flow). This provider
 * exchanges it for a short-lived access token and re-exchanges it
 * automatically when it expires.
 *
 * Zoho docs: https://www.zoho.com/accounts/protocol/oauth/web-server-applications.html
 */
export class OAuthRefreshProvider implements IAuthProvider {
  private cache: CachedToken | null = null;

  constructor(private readonly cfg: OAuthRefreshConfig) {}

  private isValid(): boolean {
    return !!this.cache && Date.now() < this.cache.expiresAt - EXPIRY_BUFFER_MS;
  }

  invalidate(): void {
    this.cache = null;
  }

  async getAccessToken(): Promise<string> {
    if (this.isValid()) return this.cache!.accessToken;

    const accountsUrl = this.cfg.accountsUrl ?? "https://accounts.zoho.com";
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.cfg.clientId,
      client_secret: this.cfg.clientSecret,
      refresh_token: this.cfg.oauthRefreshToken,
    });

    const res = await axios.post<ZohoRawTokenResponse>(
      `${accountsUrl}/oauth/v2/token`,
      body.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (res.data.error) {
      throw new Error(`[OAuthRefreshProvider] ${res.data.error}: ${res.data.error_description ?? ""}`);
    }

    this.cache = {
      accessToken: res.data.access_token,
      expiresAt: Date.now() + res.data.expires_in * 1000,
    };
    return this.cache.accessToken;
  }
}

// Alias kept for clarity
export { OAuthRefreshProvider as RefreshTokenAuth };
export type { OAuthRefreshConfig as RefreshTokenAuthConfig };
