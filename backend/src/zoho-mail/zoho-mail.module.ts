import { Module } from '@nestjs/common';
import { ZohoMailController } from './zoho-mail.controller';
import { ZohoMailService } from './zoho-mail.service';

@Module({
  controllers: [ZohoMailController],
  providers: [ZohoMailService],
  exports: [ZohoMailService],
})
export class ZohoMailModule {}
