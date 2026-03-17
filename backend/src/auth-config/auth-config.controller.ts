import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import { AuthConfigService } from './auth-config.service';
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
  constructor(private readonly service: AuthConfigService) {}

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
  save(
    @Req() req: { user: JwtPayload },
    @Param('moduleId') moduleId: string,
    @Body() dto: SaveAuthConfigDto,
  ) {
    return this.service.save(req.user.sub, moduleId, dto.config);
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
