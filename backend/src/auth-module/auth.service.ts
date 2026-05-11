import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import type { JwtPayload } from './jwt.strategy';
import type { UserResponseDto } from '../user/user.dto';
import * as crypto from 'node:crypto';
import * as jwt from 'jsonwebtoken';
import JwksRsa from 'jwks-rsa';

// Google token verifier — dynamic import for ESM compatibility
let _verifyGoogleToken: ((idToken: string, clientId: string) => Promise<Record<string, unknown>>) | null = null;

async function verifyGoogleIdToken(
  idToken: string,
  clientId: string,
): Promise<Record<string, unknown>> {
  if (!_verifyGoogleToken) {
    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(clientId);
    _verifyGoogleToken = async (token: string, cId: string) => {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: cId,
      });
      return (ticket.getPayload() ?? {}) as unknown as Record<string, unknown>;
    };
  }
  return _verifyGoogleToken(idToken, clientId);
}

export interface TokenPair {
  accessToken: string;
  user: UserResponseDto;
}

// Microsoft token verifier — uses JWKS to validate the ID token
const msJwksClient = JwksRsa({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
  cache: true,
  rateLimit: true,
});

function getMsSigningKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    msJwksClient.getSigningKey(header.kid!, (err: Error | null, key: JwksRsa.SigningKey | undefined) => {
      if (err) return reject(err);
      resolve(key!.getPublicKey());
    });
  });
}

async function verifyMicrosoftIdToken(
  idToken: string,
  clientId: string,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      (header, callback) => {
        getMsSigningKey(header)
          .then(key => callback(null, key))
          .catch(err => callback(err));
      },
      {
        audience: clientId,
        algorithms: ['RS256'],
      } as jwt.VerifyOptions,
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded as Record<string, unknown>);
      },
    );
  });
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiry: string;
  private readonly jwtRefreshExpiry: string;
  private readonly googleClientId: string;
  private readonly microsoftClientId: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET', 'change-me-in-production');
    this.jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'change-me-refresh');
    this.jwtExpiry = this.configService.get<string>('JWT_EXPIRY', '15m');
    this.jwtRefreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d');
    this.googleClientId = this.configService.get<string>(
      'GOOGLE_CLIENT_ID',
      '293033288145-egi954spbnkgmp4a6htnkhhhnc0lds6b.apps.googleusercontent.com',
    );
    this.microsoftClientId = this.configService.get<string>(
      'MICROSOFT_CLIENT_ID',
      '17b78aab-95eb-456f-b71f-c80f9c20e196',
    );
  }

  /* ── Dev / Mock Login ── */

  /**
   * Issue a token pair without Google verification (MOCK_MODE only).
   */
  async devLogin(
    email: string,
    name: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDto }> {
    const user = await this.userService.registerLogin(email, name, '');

    const jwtPayload: JwtPayload = {
      sub: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(jwtPayload as unknown as Record<string, unknown>, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiry as any,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.email } as unknown as Record<string, unknown>,
      { secret: this.jwtRefreshSecret, expiresIn: this.jwtRefreshExpiry as any },
    );

    await this.userService.setHashedRefreshToken(email, this.hashToken(refreshToken));

    return { accessToken, refreshToken, user };
  }

  /* ── Google Login ── */

  /**
   * Verify Google ID token server-side, upsert user, return token pair.
   */
  async loginWithGoogle(googleIdToken: string): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDto }> {
    let payload: Record<string, unknown>;

    this.logger.log(`Login attempt — verifying Google token (clientId: ${this.googleClientId.slice(0, 12)}…)`);

    try {
      payload = await verifyGoogleIdToken(googleIdToken, this.googleClientId);
    } catch (err) {
      this.logger.warn(`Google token verification failed: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid Google token');
    }

    const email = payload['email'] as string;
    const name = payload['name'] as string || '';
    const photoUrl = payload['picture'] as string || '';

    if (!email) {
      throw new UnauthorizedException('Google token missing email claim');
    }

    this.logger.log(`Google token verified for ${email}`);

    // Upsert user in DB
    const user = await this.userService.registerLogin(email, name, photoUrl);

    // Generate tokens
    const jwtPayload: JwtPayload = {
      sub: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(jwtPayload as unknown as Record<string, unknown>, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiry as any,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.email } as unknown as Record<string, unknown>,
      { secret: this.jwtRefreshSecret, expiresIn: this.jwtRefreshExpiry as any },
    );

    // Store hashed refresh token
    await this.userService.setHashedRefreshToken(email, this.hashToken(refreshToken));

    return { accessToken, refreshToken, user };
  }

  /* ── Microsoft Login ── */

  /**
   * Verify Microsoft ID token (MSAL) server-side, upsert user, return token pair.
   */
  async loginWithMicrosoft(microsoftIdToken: string): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDto }> {
    let payload: Record<string, unknown>;

    this.logger.log(`Login attempt — verifying Microsoft token (clientId: ${this.microsoftClientId.slice(0, 12)}…)`);

    try {
      payload = await verifyMicrosoftIdToken(microsoftIdToken, this.microsoftClientId);
    } catch (err) {
      this.logger.warn(`Microsoft token verification failed: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid Microsoft token');
    }

    // Microsoft tokens use 'preferred_username' or 'email' for email, 'name' for display name
    const email = (payload['preferred_username'] ?? payload['email']) as string;
    const name = (payload['name'] as string) || '';
    const photoUrl = '';

    if (!email) {
      throw new UnauthorizedException('Microsoft token missing email claim');
    }

    this.logger.log(`Microsoft token verified for ${email}`);

    // Upsert user in DB
    const user = await this.userService.registerLogin(email, name, photoUrl);

    // Generate tokens
    const jwtPayload: JwtPayload = {
      sub: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(jwtPayload as unknown as Record<string, unknown>, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiry as any,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.email } as unknown as Record<string, unknown>,
      { secret: this.jwtRefreshSecret, expiresIn: this.jwtRefreshExpiry as any },
    );

    // Store hashed refresh token
    await this.userService.setHashedRefreshToken(email, this.hashToken(refreshToken));

    return { accessToken, refreshToken, user };
  }

  /* ── Refresh ── */

  /**
   * Validate refresh token from HttpOnly cookie, rotate tokens.
   */
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDto }> {
    let decoded: { sub: string };

    try {
      decoded = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const email = decoded.sub;

    // Verify the refresh token matches what we stored
    const storedHash = await this.userService.getHashedRefreshToken(email);
    if (!storedHash || storedHash !== this.hashToken(refreshToken)) {
      // Possible token reuse attack — revoke
      await this.userService.setHashedRefreshToken(email, null);
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const user = await this.userService.findByEmail(email);

    const jwtPayload: JwtPayload = {
      sub: user.email,
      name: user.name,
      role: user.role,
    };

    const newAccessToken = this.jwtService.sign(jwtPayload as unknown as Record<string, unknown>, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiry as any,
    });

    const newRefreshToken = this.jwtService.sign(
      { sub: user.email } as unknown as Record<string, unknown>,
      { secret: this.jwtRefreshSecret, expiresIn: this.jwtRefreshExpiry as any },
    );

    // Rotate refresh token
    await this.userService.setHashedRefreshToken(email, this.hashToken(newRefreshToken));

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
  }

  /* ── Current user profile ── */

  async me(email: string) {
    return this.userService.findByEmail(email);
  }

  /* ── Logout ── */

  async logout(email: string): Promise<void> {
    await this.userService.setHashedRefreshToken(email, null);
  }

  /* ── Password Login ── */

  /**
   * Authenticate with email + password (for users who registered via the form).
   */
  async loginWithPassword(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserResponseDto }> {
    const user = await this.userService.validatePassword(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check status
    const entity = await this.userService.findEntityByEmail(email);
    if (entity?.status === 'pending') {
      throw new UnauthorizedException('Your account is pending admin approval');
    }
    if (entity?.status === 'revoked') {
      throw new UnauthorizedException('Your account has been revoked');
    }

    const jwtPayload: JwtPayload = {
      sub: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(jwtPayload as unknown as Record<string, unknown>, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiry as any,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.email } as unknown as Record<string, unknown>,
      { secret: this.jwtRefreshSecret, expiresIn: this.jwtRefreshExpiry as any },
    );

    await this.userService.setHashedRefreshToken(email, this.hashToken(refreshToken));

    return { accessToken, refreshToken, user };
  }

  /* ── Helpers ── */

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
