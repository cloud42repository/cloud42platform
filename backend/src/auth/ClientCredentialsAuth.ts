import axios from "axios";
import { IAuthProvider, ZohoRawTokenResponse, CachedToken } from "./IAuthProvider";

const EXPIRY_BUFFER_MS = 60_000;

export interface ClientCredentialsConfig {
  clientId: string;
  clientSecret: string;
  /** Space-separated Zoho scopes, e.g. "ZohoCRM.modules.ALL" */
  scope: string;
  accountsUrl?: string;
}

/**
 * Auth strategy: OAuth2 Client Credentials Grant
 *
 * Server-to-server flow with no user context. Suitable for background
 * services and daemons. Zoho issues an access token directly from
 * client_id + client_secret; no refresh token is involved.
 *
 * Zoho docs: https://www.zoho.com/accounts/protocol/oauth/web-server-applications.html
 */
export class ClientCredentialsAuth implements IAuthProvider {
  private cache: CachedToken | null = null;

  constructor(private readonly cfg: ClientCredentialsConfig) {}

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
      grant_type: "client_credentials",
      client_id: this.cfg.clientId,
      client_secret: this.cfg.clientSecret,
      scope: this.cfg.scope,
    });

    const res = await axios.post<ZohoRawTokenResponse>(
      `${accountsUrl}/oauth/v2/token`,
      body.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (res.data.error) {
      throw new Error(
        `[ClientCredentialsAuth] ${res.data.error}: ${res.data.error_description ?? ""}`
      );
    }

    this.cache = {
      accessToken: res.data.access_token,
      expiresAt: Date.now() + res.data.expires_in * 1000,
    };
    return this.cache.accessToken;
  }
}
