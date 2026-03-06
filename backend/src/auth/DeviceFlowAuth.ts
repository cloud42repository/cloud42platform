import axios from "axios";
import {
  IAuthProvider,
  ZohoRawTokenResponse,
  ZohoDeviceCodeResponse,
  CachedToken,
} from "./IAuthProvider";
import { AuthCodeTokens } from "./AuthorizationCodeAuth";

const EXPIRY_BUFFER_MS = 60_000;
const DEVICE_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code";

export interface DeviceFlowConfig {
  clientId: string;
  clientSecret: string;
  accountsUrl?: string;
}

export type DeviceFlowPromptFn = (info: ZohoDeviceCodeResponse) => Promise<void>;

/**
 * Auth strategy: OAuth2 Device Authorization Grant (RFC 8628)
 *
 * Designed for devices / CLIs that cannot open a browser.
 * The user visits a short URL and enters a code on a separate device.
 *
 * Flow:
 *   1. Call startFlow(scope, onPrompt) – this polls until the user approves.
 *      `onPrompt` is called once with { user_code, verification_url } so you
 *      can display/log them (e.g. print to stdout).
 *   2. Once approved, tokens are stored and auto-refreshed transparently.
 *
 * Zoho docs: https://www.zoho.com/accounts/protocol/oauth/devices.html
 */
export class DeviceFlowAuth implements IAuthProvider {
  private cache: CachedToken | null = null;

  constructor(
    private readonly cfg: DeviceFlowConfig,
    initialTokens?: AuthCodeTokens
  ) {
    if (initialTokens) {
      this.cache = { ...initialTokens };
    }
  }

  // ── Step 1: Request device + user codes ──────────────────────────────────────

  private async requestDeviceCode(scope: string): Promise<ZohoDeviceCodeResponse> {
    const accountsUrl = this.cfg.accountsUrl ?? "https://accounts.zoho.com";
    const body = new URLSearchParams({
      response_type: "device_code",
      client_id: this.cfg.clientId,
      scope,
    });

    const res = await axios.post<ZohoDeviceCodeResponse>(
      `${accountsUrl}/oauth/v2/device/code`,
      body.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (res.data.error) {
      throw new Error(`[DeviceFlowAuth] request device code: ${res.data.error}`);
    }
    return res.data;
  }

  // ── Step 2: Poll until the user approves ─────────────────────────────────────

  private async poll(deviceCodeRes: ZohoDeviceCodeResponse): Promise<CachedToken> {
    const accountsUrl = this.cfg.accountsUrl ?? "https://accounts.zoho.com";
    const intervalMs = (deviceCodeRes.interval ?? 5) * 1000;
    const deadline = Date.now() + deviceCodeRes.expires_in * 1000;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, intervalMs));

      const body = new URLSearchParams({
        grant_type: DEVICE_GRANT_TYPE,
        client_id: this.cfg.clientId,
        client_secret: this.cfg.clientSecret,
        device_code: deviceCodeRes.device_code,
      });

      const res = await axios.post<ZohoRawTokenResponse>(
        `${accountsUrl}/oauth/v2/token`,
        body.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const data = res.data;

      if (data.error === "authorization_pending" || data.error === "slow_down") {
        continue; // keep polling
      }

      if (data.error) {
        throw new Error(`[DeviceFlowAuth] poll: ${data.error}: ${data.error_description ?? ""}`);
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };
    }

    throw new Error("[DeviceFlowAuth] Device code expired before the user approved.");
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  /**
   * Initiates the device flow. Calls `onPrompt` with the user code and
   * verification URL, then polls until the user approves (or the code expires).
   *
   * @param scope    Space-separated Zoho scopes
   * @param onPrompt Async callback – display user_code and verification_url
   */
  async startFlow(scope: string, onPrompt: DeviceFlowPromptFn): Promise<AuthCodeTokens> {
    const deviceCodeRes = await this.requestDeviceCode(scope);
    await onPrompt(deviceCodeRes);
    this.cache = await this.poll(deviceCodeRes);

    return {
      accessToken: this.cache.accessToken,
      refreshToken: this.cache.refreshToken!,
      expiresAt: this.cache.expiresAt,
    };
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
      throw new Error("[DeviceFlowAuth] No tokens cached. Call startFlow() first.");
    }

    // Silent re-auth using refresh token
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
        `[DeviceFlowAuth] refresh: ${res.data.error}: ${res.data.error_description ?? ""}`
      );
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
