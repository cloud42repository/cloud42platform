import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ZohoOAuthService } from './zoho-oauth.service';
import type {
  AuthorizeQueryDto,
  GenerateTokenDto,
  RefreshTokenDto,
  RevokeTokenDto,
} from './zoho-oauth.dto';

/**
 * REST endpoints for Zoho OAuth 2.0 token generation.
 *
 * Implements the full flow described at:
 *   https://www.zoho.com/accounts/protocol/oauth/web-server-applications.html
 *   https://www.zoho.com/bookings/help/api/v1/generatetokens.html
 *
 * Flow:
 *   1. Register a client in Zoho API Console → get clientId & clientSecret
 *   2. GET  /api/zoho-oauth/authorize  → returns the Zoho consent URL
 *   3. POST /api/zoho-oauth/token      → exchange the grant token for access + refresh tokens
 *   4. POST /api/zoho-oauth/exchange-store → exchange + auto-store in auth-config
 *   5. POST /api/zoho-oauth/refresh    → refresh an expired access token
 *   6. POST /api/zoho-oauth/revoke     → revoke a refresh token
 *   7. POST /api/zoho-oauth/revoke-clear → revoke + remove from auth-config
 */
@Controller('zoho-oauth')
export class ZohoOAuthController {
  constructor(private readonly service: ZohoOAuthService) {}

  /**
   * GET /api/zoho-oauth/authorize
   *
   * Builds and returns the Zoho authorization URL.
   * clientId, redirectUri and accountsUrl fall back to env vars.
   */
  @Get('authorize')
  getAuthorizationUrl(@Query() query: AuthorizeQueryDto) {
    return {
      url: this.service.buildAuthorizationUrl({
        scope: query.scope,
        clientId: query.clientId,
        redirectUri: query.redirectUri,
        accountsUrl: query.accountsUrl,
        state: query.state,
        accessType: query.accessType,
      }),
    };
  }

  /**
   * POST /api/zoho-oauth/token
   *
   * Exchange the one-time grant token for access + refresh tokens.
   * clientId, clientSecret, redirectUri, accountsUrl fall back to env vars.
   */
  @Post('token')
  @HttpCode(HttpStatus.OK)
  generateTokens(@Body() dto: GenerateTokenDto) {
    return this.service.generateTokens(dto);
  }

  /**
   * POST /api/zoho-oauth/exchange-store
   *
   * Exchange the grant token AND persist the resulting credentials
   * in the current user's auth-config (`__zoho__` moduleId).
   * All Zoho service clients automatically pick up stored credentials.
   *
   * Body: { code, clientId?, clientSecret?, redirectUri?, accountsUrl? }
   */
  @Post('exchange-store')
  @HttpCode(HttpStatus.OK)
  exchangeAndStore(@Body() body: { code: string; clientId?: string; clientSecret?: string; redirectUri?: string; accountsUrl?: string }) {
    return this.service.exchangeAndStore(body.code, body);
  }

  /**
   * POST /api/zoho-oauth/refresh
   *
   * Refresh an expired access token using a refresh token.
   * clientId, clientSecret, accountsUrl fall back to env vars.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.service.refreshAccessToken(dto);
  }

  /**
   * POST /api/zoho-oauth/revoke
   *
   * Revoke a refresh token so it can no longer be used.
   */
  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  revokeToken(@Body() dto: RevokeTokenDto) {
    return this.service.revokeRefreshToken(dto);
  }

  /**
   * POST /api/zoho-oauth/revoke-clear
   *
   * Revoke the refresh token AND remove the stored auth-config
   * for the current user. Optionally pass a specific refreshToken.
   *
   * Body: { refreshToken?, accountsUrl? }
   */
  @Post('revoke-clear')
  @HttpCode(HttpStatus.OK)
  revokeAndClear(@Body() body: { refreshToken?: string; accountsUrl?: string }) {
    return this.service.revokeAndClear(body);
  }
}
