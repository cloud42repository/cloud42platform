import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import type {
  RegisterLoginDto,
  RegisterDto,
  SetRoleDto,
  SetModuleVisibilityDto,
  SetAllModulesDto,
  SetPasswordDto,
} from './user.dto';
import { Public } from '../auth-module/public.decorator';
import { Roles } from '../auth-module/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  /** GET /api/users — list all users (admin only) */
  @Get()
  @Roles('admin')
  findAll() {
    return this.service.findAll();
  }

  /** GET /api/users/:email — get a single user */
  @Get(':email')
  findOne(@Param('email') email: string) {
    return this.service.findByEmail(email);
  }

  /** POST /api/users/login — register or update on Google login (called by AuthService internally, keep public for compatibility) */
  @Public()
  @Post('login')
  registerLogin(@Body() dto: RegisterLoginDto) {
    return this.service.registerLogin(dto.email, dto.name, dto.photoUrl);
  }

  /** POST /api/users/register — self-registration (public, user stays pending) */
  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto.email, dto.name);
  }

  /** POST /api/users/:email/approve — admin approves a pending user & sends password email */
  @Post(':email/approve')
  @Roles('admin')
  approve(@Param('email') email: string) {
    return this.service.approveUser(email);
  }

  /** POST /api/users/:email/revoke — admin revokes an active user */
  @Post(':email/revoke')
  @Roles('admin')
  revoke(@Param('email') email: string) {
    return this.service.revokeUser(email);
  }

  /** POST /api/users/:email/resend-invite — admin re-sends the password-set email */
  @Post(':email/resend-invite')
  @Roles('admin')
  resendInvite(@Param('email') email: string) {
    return this.service.resendInvite(email);
  }

  /** POST /api/users/:email/set-password — public: user sets password with token */
  @Public()
  @Post(':email/set-password')
  setPassword(@Param('email') email: string, @Body() dto: SetPasswordDto) {
    return this.service.setPassword(email, dto.token, dto.password);
  }

  /** PATCH /api/users/:email/role — change user role (admin only) */
  @Patch(':email/role')
  @Roles('admin')
  setRole(@Param('email') email: string, @Body() dto: SetRoleDto) {
    return this.service.setRole(email, dto.role);
  }

  /** DELETE /api/users/:email — remove a user (admin only) */
  @Delete(':email')
  @Roles('admin')
  remove(@Param('email') email: string) {
    return this.service.removeUser(email);
  }

  /** PATCH /api/users/:email/module-visibility — toggle one module (admin/manager) */
  @Patch(':email/module-visibility')
  @Roles('admin', 'manager')
  setModuleVisibility(
    @Param('email') email: string,
    @Body() dto: SetModuleVisibilityDto,
  ) {
    return this.service.setModuleEnabled(email, dto.moduleId, dto.enabled);
  }

  /** PATCH /api/users/:email/modules-bulk — toggle many modules at once (admin/manager) */
  @Patch(':email/modules-bulk')
  @Roles('admin', 'manager')
  setAllModulesEnabled(
    @Param('email') email: string,
    @Body() dto: SetAllModulesDto,
  ) {
    return this.service.setAllModulesEnabled(email, dto.moduleIds, dto.enabled);
  }
}
