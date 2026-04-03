import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ShareService } from './share.service';
import type { CreateShareDto } from './share.dto';
import { Public } from '../auth-module/public.decorator';

@Controller('shares')
export class ShareController {
  constructor(private readonly service: ShareService) {}

  /** POST /api/shares — create a share link */
  @Post()
  create(@Body() dto: CreateShareDto) {
    return this.service.create(dto);
  }

  /** GET /api/shares?ownerEmail=xxx — list shares for a user */
  @Get()
  findByOwner(@Query('ownerEmail') ownerEmail: string) {
    return this.service.findByOwner(ownerEmail);
  }

  /** GET /api/shares/public/:token — resolve public share (no auth) */
  @Public()
  @Get('public/:token')
  resolvePublic(@Param('token') token: string) {
    return this.service.resolvePublic(token);
  }

  /** DELETE /api/shares/:token?ownerEmail=xxx — revoke a share */
  @Delete(':token')
  revoke(
    @Param('token') token: string,
    @Query('ownerEmail') ownerEmail: string,
  ) {
    return this.service.revoke(token, ownerEmail);
  }
}
