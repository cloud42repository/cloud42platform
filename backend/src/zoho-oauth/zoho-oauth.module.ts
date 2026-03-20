import { Global, Module } from '@nestjs/common';
import { ZohoOAuthController } from './zoho-oauth.controller';
import { ZohoOAuthService } from './zoho-oauth.service';

@Global()
@Module({
  controllers: [ZohoOAuthController],
  providers: [ZohoOAuthService],
  exports: [ZohoOAuthService],
})
export class ZohoOAuthModule {}
