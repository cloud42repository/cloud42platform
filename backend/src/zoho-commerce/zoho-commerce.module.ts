import { Module } from '@nestjs/common';
import { ZohoCommerceController } from './zoho-commerce.controller';
import { ZohoCommerceService } from './zoho-commerce.service';

@Module({
  controllers: [ZohoCommerceController],
  providers: [ZohoCommerceService],
  exports: [ZohoCommerceService],
})
export class ZohoCommerceModule {}
