import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import { AuthConfigService } from './auth-config.service';
import { ZohoOAuthService } from '../zoho-oauth/zoho-oauth.service';
import type { SaveAuthConfigDto } from './auth-config.dto';
import type { JwtPayload } from '../auth-module/jwt.strategy';
import { Roles } from '../auth-module/roles.decorator';

/**
 * REST API for per-user, per-module authentication configuration.
 *
 * The authenticated user (from JWT) is automatically used as the owner.
 * Admin users can also manage configs for all users via the admin sub-routes.
 */
@Controller('auth-configs')
export class AuthConfigController {
  private readonly logger = new Logger(AuthConfigController.name);

  constructor(
    private readonly service: AuthConfigService,
    private readonly zohoOAuth: ZohoOAuthService,
  ) {}

  /* ── Current user routes ── */

  /** GET /api/auth-configs — list all auth configs for the current user */
  @Get()
  findAll(@Req() req: { user: JwtPayload }) {
    return this.service.findAll(req.user.sub);
  }

  /** GET /api/auth-configs/:moduleId — get auth config for one module */
  @Get(':moduleId')
  findOne(
    @Req() req: { user: JwtPayload },
    @Param('moduleId') moduleId: string,
  ) {
    return this.service.findOne(req.user.sub, moduleId);
  }

  /** PUT /api/auth-configs/:moduleId — create or update auth config */
  @Put(':moduleId')
  async save(
    @Req() req: { user: JwtPayload },
    @Param('moduleId') moduleId: string,
    @Body() dto: SaveAuthConfigDto,
  ) {
    const userEmail = req.user.sub;

    // When saving Zoho config with an authorization code, exchange it for tokens
    if (moduleId === '__zoho__' && dto.config) {
      const cfg = dto.config as unknown as Record<string, unknown>;
      const code = cfg['code'] as string | undefined;
      if (code) {
        this.logger.log(`Zoho auth code detected for ${userEmail} — exchanging for tokens…`);
        await this.zohoOAuth.exchangeAndStore(code, {
          userEmail,
          clientId: cfg['clientId'] as string | undefined,
          clientSecret: cfg['clientSecret'] as string | undefined,
          redirectUri: cfg['redirectUri'] as string | undefined,
          accountsUrl: cfg['accountsUrl'] as string | undefined,
          organizationId: cfg['organizationId'] as string | undefined,
          scope: cfg['scope'] as string | undefined,
        });
        // Return the stored config (tokens are now persisted by exchangeAndStore)
        return this.service.findOne(userEmail, moduleId);
      }
    }

    return this.service.save(userEmail, moduleId, dto.config);
  }

  /** DELETE /api/auth-configs/:moduleId — remove auth config for one module */
  @Delete(':moduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Req() req: { user: JwtPayload },
    @Param('moduleId') moduleId: string,
  ) {
    return this.service.remove(req.user.sub, moduleId);
  }

  /* ── Admin route: view all configs for any user ── */

  /** GET /api/auth-configs/admin/:userEmail — list all configs for a user (admin only) */
  @Get('admin/:userEmail')
  @Roles('admin')
  adminFindAll(@Param('userEmail') userEmail: string) {
    return this.service.findAll(userEmail);
  }
}
