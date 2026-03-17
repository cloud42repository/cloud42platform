import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  /** User email (subject) */
  sub: string;
  /** User display name */
  name: string;
  /** User role */
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const opts: StrategyOptionsWithoutRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'change-me-in-production'),
    };
    super(opts);
  }

  /**
   * Called by Passport after the token is verified.
   * The return value is attached to `request.user`.
   */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
