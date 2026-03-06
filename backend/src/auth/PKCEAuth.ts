import axios from "axios";
import { createHash, randomBytes } from "crypto";
import { IAuthProvider, ZohoRawTokenResponse, CachedToken } from "./IAuthProvider";
import { AuthCodeTokens } from "./AuthorizationCodeAuth";

const EXPIRY_BUFFER_MS = 60_000;

export interface PKCEAuthConfig {
  clientId: string;
  /** redirectUri must match the one registered in Zoho API Console */
  redirectUri: string;
  accountsUrl?: string;
}

/**
 * Auth strategy: OAuth2 Authorization Code + PKCE (Proof Key for Code Exchange)
 *
 * Designed for public clients (SPAs, mobile apps, CLI tools) where you
 * cannot safely store a client_secret. PKCE replaces the client_secret
 * with a cryptographic challenge derived at runtime.
 *
 * Flow:
 *   1. Call startFlow(scope) → { url, codeVerifier }
 *      Redirect the user to `url`.  Save `codeVerifier` for step 2.
 *   2. Zoho redirects back with ?code=...
 *      Call exchangeCode(code, codeVerifier) to obtain tokens.
 *   3. The provider auto-refreshes the access token using the refresh token.
 *
 * Zoho docs: https://www.zoho.com/accounts/protocol/oauth/pkce.html
 */
export class PKCEAuth implements IAuthProvider {
  private cache: CachedToken | null = null;

  constructor(
    private readonly cfg: PKCEAuthConfig,
    initialTokens?: AuthCodeTokens
  ) {
    if (initialTokens) {
      this.cache = { ...initialTokens };
    }
  }

  // ── PKCE helpers ─────────────────────────────────────────────────────────────

  /** Generate a cryptographically random code verifier (RFC 7636 §4.1). */
  static generateCodeVerifier(): string {
    return randomBytes(32)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  /** Derive the S256 code challenge from a verifier (RFC 7636 §4.2). */
  static generateCodeChallenge(verifier: string): string {
    return createHash("sha256")
      .update(verifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  // ── Step 1 ───────────────────────────────────────────────────────────────────

  /**
   * Generates a code verifier + challenge pair and returns:
   *  - `url`          : authorization URL to open in the browser
   *  - `codeVerifier` : keep this to pass into exchangeCode()
   *
   * @param scope  Space-separated scopes, e.g. "ZohoCRM.modules.ALL"
   * @param state  Optional CSRF state value
   */
  startFlow(scope: string, state?: string): { url: string; codeVerifier: string } {
    const codeVerifier = PKCEAuth.generateCodeVerifier();
    const codeChallenge = PKCEAuth.generateCodeChallenge(codeVerifier);
    const accountsUrl = this.cfg.accountsUrl ?? "https://accounts.zoho.com";

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.cfg.clientId,
      redirect_uri: this.cfg.redirectUri,
      scope,
      access_type: "offline",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
    if (state) params.set("state", state);

    return { url: `${accountsUrl}/oauth/v2/auth?${params.toString()}`, codeVerifier };
  }

  // ── Step 2 ───────────────────────────────────────────────────────────────────

  /**
   * Exchange the one-time authorization code (plus the saved verifier)
   * for access + refresh tokens. Call once after the redirect.
   */
  async exchangeCode(code: string, codeVerifier: string): Promise<AuthCodeTokens> {
    const accountsUrl = this.cfg.accountsUrl ?? "https://accounts.zoho.com";
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.cfg.clientId,
      redirect_uri: this.cfg.redirectUri,
      code,
      code_verifier: codeVerifier,
    });

    const res = await axios.post<ZohoRawTokenResponse>(
      `${accountsUrl}/oauth/v2/token`,
      body.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (res.data.error) {
      throw new Error(`[PKCEAuth] ${res.data.error}: ${res.data.error_description ?? ""}`);
    }

    if (!res.data.refresh_token) {
      throw new Error("[PKCEAuth] No refresh_token received. Ensure access_type=offline.");
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
    if (this.cache) this.cache = { ...this.cache, expiresAt: 0 };
  }

  async getAccessToken(): Promise<string> {
    if (this.cache && Date.now() < this.cache.expiresAt - EXPIRY_BUFFER_MS) {
      return this.cache.accessToken;
    }

    if (!this.cache?.refreshToken) {
      throw new Error("[PKCEAuth] No tokens available. Call exchangeCode() first.");
    }

    const accountsUrl = this.cfg.accountsUrl ?? "https://accounts.zoho.com";
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.cfg.clientId,
      refresh_token: this.cache.refreshToken,
      // PKCE refresh does NOT send client_secret
    });

    const res = await axios.post<ZohoRawTokenResponse>(
      `${accountsUrl}/oauth/v2/token`,
      body.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (res.data.error) {
      throw new Error(`[PKCEAuth] refresh: ${res.data.error}: ${res.data.error_description ?? ""}`);
    }

    this.cache = {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token ?? this.cache.refreshToken,
      expiresAt: Date.now() + res.data.expires_in * 1000,
    };
    return this.cache.accessToken;
  }

  getCachedTokens(): AuthCodeTokens | null {
    if (!this.cache) return null;
    return { accessToken: this.cache.accessToken, refreshToken: this.cache.refreshToken!, expiresAt: this.cache.expiresAt };
  }
}
