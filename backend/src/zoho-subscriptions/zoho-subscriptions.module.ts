import { Module } from '@nestjs/common';
import { ZohoSubscriptionsController } from './zoho-subscriptions.controller';
import { ZohoSubscriptionsService } from './zoho-subscriptions.service';

@Module({
  controllers: [ZohoSubscriptionsController],
  providers: [ZohoSubscriptionsService],
  exports: [ZohoSubscriptionsService],
})
export class ZohoSubscriptionsModule {}
