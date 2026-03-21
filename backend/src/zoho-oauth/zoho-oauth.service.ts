import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import type {
  GenerateTokenDto,
  RefreshTokenDto,
  RevokeTokenDto,
  ZohoTokenResponse,
} from './zoho-oauth.dto';

const DEFAULT_ACCOUNTS_URL = 'https://accounts.zoho.com';

/**
 * Service handling the Zoho OAuth 2.0 token lifecycle:
 *
 *  1. Build authorization URL (controller-level helper)
 *  2. Exchange grant token → access + refresh tokens
 *  3. Refresh an access token using a refresh token
 *  4. Revoke a refresh token
 *
 * Reference: https://www.zoho.com/accounts/protocol/oauth/web-server-applications.html
 */
@Injectable()
export class ZohoOAuthService {
  private readonly logger = new Logger(ZohoOAuthService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {}

  // ── Defaults from env ────────────────────────────────────────────────────

  /** Resolve clientId: explicit → env ZOHO_CLIENT_ID */
  private cid(explicit?: string): string {
    return explicit || this.config.getOrThrow<string>('ZOHO_CLIENT_ID');
  }

  /** Resolve clientSecret: explicit → env ZOHO_CLIENT_SECRET */
  private csec(explicit?: string): string {
    return explicit || this.config.getOrThrow<string>('ZOHO_CLIENT_SECRET');
  }

  /** Resolve accountsUrl: explicit → env ZOHO_ACCOUNTS_URL → default */
  private aurl(explicit?: string): string {
    return explicit || this.config.get<string>('ZOHO_ACCOUNTS_URL') || DEFAULT_ACCOUNTS_URL;
  }

  /** Resolve redirectUri: explicit → env ZOHO_REDIRECT_URI */
  private ruri(explicit?: string): string {
    return explicit || this.config.get<string>('ZOHO_REDIRECT_URI') || '';
  }

  // ── Authorization URL builder ────────────────────────────────────────────

  /**
   * Build the Zoho consent URL.
   * Falls back to env vars for clientId, redirectUri and accountsUrl.
   */
  buildAuthorizationUrl(opts: {
    scope: string;
    clientId?: string;
    redirectUri?: string;
    accountsUrl?: string;
    state?: string;
    accessType?: string;
  }): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.cid(opts.clientId),
      redirect_uri: this.ruri(opts.redirectUri),
      scope: opts.scope,
      access_type: opts.accessType || 'offline',
      prompt: 'consent',
    });
    if (opts.state) params.set('state', opts.state);
    return `${this.aurl(opts.accountsUrl)}/oauth/v2/auth?${params.toString()}`;
  }

  /**
   * Step 3 — Exchange the one-time grant token (authorization code)
   * for an access token and refresh token.
   *
   * POST {accountsUrl}/oauth/v2/token
   *   grant_type     = authorization_code
   *   client_id      = ...
   *   client_secret  = ...
   *   redirect_uri   = ...
   *   code           = <grant_token>
   */
  async generateTokens(dto: GenerateTokenDto): Promise<ZohoTokenResponse> {
    const accountsUrl = this.aurl(dto.accountsUrl);
    const clientId = this.cid(dto.clientId);
    const clientSecret = this.csec(dto.clientSecret);
    const redirectUri = this.ruri(dto.redirectUri);

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: dto.code,
    });

    this.logger.log(
      `Exchanging grant token → ${accountsUrl}/oauth/v2/token (clientId: ${clientId.slice(0, 12)}…)`,
    );

    const res = await axios.post<ZohoTokenResponse>(
      `${accountsUrl}/oauth/v2/token`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    if (res.data.error) {
      this.logger.warn(`Token exchange failed: ${res.data.error}`);
      throw new BadRequestException(`Zoho token error: ${res.data.error}`);
    }

    this.logger.log('Grant token exchanged successfully');
    return res.data;
  }

  /**
   * Step 4 — Refresh an expired access token using the refresh token.
   *
   * POST {accountsUrl}/oauth/v2/token
   *   grant_type     = refresh_token
   *   client_id      = ...
   *   client_secret  = ...
   *   refresh_token  = ...
   */
  async refreshAccessToken(dto: RefreshTokenDto): Promise<ZohoTokenResponse> {
    const accountsUrl = this.aurl(dto.accountsUrl);
    const clientId = this.cid(dto.clientId);
    const clientSecret = this.csec(dto.clientSecret);

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: dto.refreshToken,
    });

    this.logger.log(
      `Refreshing access token → ${accountsUrl}/oauth/v2/token`,
    );

    const res = await axios.post<ZohoTokenResponse>(
      `${accountsUrl}/oauth/v2/token`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    if (res.data.error) {
      this.logger.warn(`Token refresh failed: ${res.data.error}`);
      throw new BadRequestException(`Zoho token error: ${res.data.error}`);
    }

    this.logger.log('Access token refreshed successfully');
    return res.data;
  }

  /**
   * Revoke a refresh token so it can no longer be used.
   *
   * POST {accountsUrl}/oauth/v2/token/revoke
   *   token = <refresh_token>
   */
  async revokeRefreshToken(dto: RevokeTokenDto): Promise<{ status: string }> {
    const accountsUrl = this.aurl(dto.accountsUrl);

    const body = new URLSearchParams({
      token: dto.refreshToken,
    });

    this.logger.log(`Revoking refresh token → ${accountsUrl}/oauth/v2/token/revoke`);

    await axios.post(
      `${accountsUrl}/oauth/v2/token/revoke`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    this.logger.log('Refresh token revoked');
    return { status: 'revoked' };
  }

  // ── Convenience: exchange + persist in auth-config ───────────────────────

  /**
   * Exchange a grant code for tokens AND persist the resulting
   * refresh token (+ clientId / clientSecret / accountsUrl) into the
   * per-user auth-config store under moduleId `__zoho__`.
   *
   * If `userEmail` is omitted the current request user is used.
   */
  async exchangeAndStore(
    code: string,
    opts?: {
      userEmail?: string;
      clientId?: string;
      clientSecret?: string;
      redirectUri?: string;
      accountsUrl?: string;
      organizationId?: string;
      scope?: string;
    },
  ): Promise<ZohoTokenResponse> {
    const clientId = this.cid(opts?.clientId);
    const clientSecret = this.csec(opts?.clientSecret);
    const redirectUri = this.ruri(opts?.redirectUri);
    const accountsUrl = this.aurl(opts?.accountsUrl);

    const tokens = await this.generateTokens({
      code,
      clientId,
      clientSecret,
      redirectUri,
      accountsUrl,
    });

    // Persist credentials + ALL token data for future API calls
    const email = opts?.userEmail || getCurrentUserEmail() || 'anonymous';
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    await this.authConfigService.save(email, '__zoho__', {
      type: 'oauth',
      clientId,
      clientSecret,
      accountsUrl,
      redirectUri,
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      tokenExpiresAt: expiresAt,
      organizationId: opts?.organizationId,
      scope: opts?.scope,
    } as any);
    this.logger.log(`Stored Zoho OAuth tokens in auth-config for ${email} (expires ${expiresAt})`);

    return tokens;
  }

  // ── Get a valid access token for the current user ───────────────────────

  /**
   * Returns a valid access token for the given user from the stored auth-config.
   * If the stored access token is expired, it is automatically refreshed
   * and the new token is persisted back to the DB.
   *
   * Returns null if no stored config exists.
   */
  async getValidAccessToken(userEmail?: string): Promise<string | null> {
    const email = userEmail || getCurrentUserEmail() || 'anonymous';

    const stored = await this.authConfigService.findOne(email, '__zoho__');
    if (!stored?.config) return null;

    const cfg = stored.config as unknown as Record<string, unknown>;
    const refreshToken = cfg['refreshToken'] as string | undefined;
    if (!refreshToken) return null;

    // Check if current access token is still valid (with 60s buffer)
    const accessToken = cfg['accessToken'] as string | undefined;
    const expiresAt = cfg['tokenExpiresAt'] as string | undefined;
    if (accessToken && expiresAt) {
      const expiryMs = new Date(expiresAt).getTime();
      if (Date.now() < expiryMs - 60_000) {
        return accessToken;
      }
    }

    // Token expired or missing → refresh it
    this.logger.log(`Access token expired for ${email}, refreshing…`);
    const clientId = cfg['clientId'] as string | undefined;
    const clientSecret = cfg['clientSecret'] as string | undefined;
    const accountsUrl = cfg['accountsUrl'] as string | undefined;

    const newTokens = await this.refreshAccessToken({
      refreshToken,
      clientId,
      clientSecret,
      accountsUrl,
    });

    // Persist updated access token + expiry
    const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();
    await this.authConfigService.save(email, '__zoho__', {
      ...cfg,
      accessToken: newTokens.access_token,
      tokenExpiresAt: newExpiresAt,
      // If a new refresh token is returned, update it too
      ...(newTokens.refresh_token ? { refreshToken: newTokens.refresh_token } : {}),
    } as any);
    this.logger.log(`Refreshed & stored new access token for ${email} (expires ${newExpiresAt})`);

    return newTokens.access_token;
  }

  /**
   * Revoke a refresh token AND remove the corresponding auth-config entry.
   *
   * If `refreshToken` is omitted the stored token for the current user is used.
   */
  async revokeAndClear(opts?: {
    userEmail?: string;
    refreshToken?: string;
    accountsUrl?: string;
  }): Promise<{ status: string }> {
    const email = opts?.userEmail || getCurrentUserEmail() || 'anonymous';

    let tokenToRevoke = opts?.refreshToken;
    if (!tokenToRevoke) {
      const stored = await this.authConfigService.findOne(email, '__zoho__');
      const cfg = stored?.config as unknown as Record<string, unknown> | undefined;
      tokenToRevoke = cfg?.['refreshToken'] as string | undefined;
    }

    if (tokenToRevoke) {
      await this.revokeRefreshToken({
        refreshToken: tokenToRevoke,
        accountsUrl: opts?.accountsUrl,
      });
    }

    await this.authConfigService.remove(email, '__zoho__');
    this.logger.log(`Revoked & cleared Zoho auth-config for ${email}`);
    return { status: 'revoked' };
  }
}
