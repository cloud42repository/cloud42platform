import { Module } from '@nestjs/common';
import { ZohoSalesIQService } from './zoho-salesiq.service';
import { ZohoSalesIQController } from './zoho-salesiq.controller';

@Module({
  controllers: [ZohoSalesIQController],
  providers: [ZohoSalesIQService],
  exports: [ZohoSalesIQService],
})
export class ZohoSalesiqModule {}
