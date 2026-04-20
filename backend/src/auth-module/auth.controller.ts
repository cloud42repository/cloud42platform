import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import type { JwtPayload } from './jwt.strategy';

interface GoogleLoginDto {
  idToken: string;
}

interface DevLoginDto {
  email?: string;
  name?: string;
}

interface PasswordLoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  /** Cookie name for the refresh token */
  private static readonly REFRESH_COOKIE = 'cloud42_refresh';

  /** 7 days in milliseconds */
  private static readonly REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

  constructor(private readonly authService: AuthService) {}

  /* ── POST /api/auth/login ── */

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.loginWithGoogle(dto.idToken);

    this.setRefreshCookie(res, refreshToken);

    return { accessToken, refreshToken, user };
  }

  /* ── POST /api/auth/dev-login ── (MOCK_MODE only) */

  @Public()
  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  async devLogin(
    @Body() dto: DevLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (process.env['MOCK_MODE'] !== 'true') {
      throw new UnauthorizedException('dev-login is only available in MOCK_MODE');
    }

    const { accessToken, refreshToken, user } =
      await this.authService.devLogin(
        dto.email ?? 'mock@cloud42.dev',
        dto.name ?? 'Mock User',
      );

    this.setRefreshCookie(res, refreshToken);

    return { accessToken, refreshToken, user };
  }

  /* ── POST /api/auth/password-login ── */

  @Public()
  @Post('password-login')
  @HttpCode(HttpStatus.OK)
  async passwordLogin(
    @Body() dto: PasswordLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.loginWithPassword(dto.email, dto.password);

    this.setRefreshCookie(res, refreshToken);

    return { accessToken, refreshToken, user };
  }

  /* ── POST /api/auth/refresh ── */

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Body() body: { refreshToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    // Accept refresh token from cookie OR request body (fallback for cross-origin)
    const oldToken = req.cookies?.[AuthController.REFRESH_COOKIE] as string | undefined
      || body?.refreshToken;

    if (!oldToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const { accessToken, refreshToken, user } =
      await this.authService.refreshTokens(oldToken);

    this.setRefreshCookie(res, refreshToken);

    return { accessToken, refreshToken, user };
  }

  /* ── POST /api/auth/logout ── */

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request & { user?: JwtPayload },
    @Res({ passthrough: true }) res: Response,
  ) {
    const email = req.user?.sub;
    if (email) {
      await this.authService.logout(email);
    }
    res.clearCookie(AuthController.REFRESH_COOKIE, { path: '/api/auth' });
    return { ok: true };
  }

  /* ── Helpers ── */

  private setRefreshCookie(res: Response, token: string): void {
    const isProduction = process.env['NODE_ENV'] === 'production';
    res.cookie(AuthController.REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,                    // HTTPS only in prod
      sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin cookies (SWA ↔ App Service)
      path: '/api/auth',                       // cookie only sent to auth endpoints
      maxAge: AuthController.REFRESH_MAX_AGE,
    });
  }
}
