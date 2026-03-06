import { Module } from '@nestjs/common';
import { ZohoSignController } from './zoho-sign.controller';
import { ZohoSignService } from './zoho-sign.service';

@Module({
  controllers: [ZohoSignController],
  providers: [ZohoSignService],
  exports: [ZohoSignService],
})
export class ZohoSignModule {}
