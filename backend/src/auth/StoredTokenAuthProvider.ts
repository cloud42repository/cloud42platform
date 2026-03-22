import { UnauthorizedException } from '@nestjs/common';
import { IAuthProvider } from './IAuthProvider';
import type { ZohoOAuthService } from '../zoho-oauth/zoho-oauth.service';

export class StoredTokenAuthProvider implements IAuthProvider {
  private cachedToken: string | null = null;

  constructor(
    private readonly zohoOAuth: ZohoOAuthService,
    private readonly userEmail: string,
  ) {}

  invalidate(): void {
    this.cachedToken = null;
  }

  async getAccessToken(): Promise<string> {
    const token = await this.zohoOAuth.getValidAccessToken(this.userEmail);
    if (!token) {
      throw new UnauthorizedException(
        'Zoho OAuth tokens not configured for ' + this.userEmail + '. Please go to Settings and connect your Zoho account.',
      );
    }
    this.cachedToken = token;
    return token;
  }
}
