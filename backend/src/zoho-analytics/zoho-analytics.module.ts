import { Module } from '@nestjs/common';
import { ZohoAnalyticsController } from './zoho-analytics.controller';
import { ZohoAnalyticsService } from './zoho-analytics.service';

@Module({
  controllers: [ZohoAnalyticsController],
  providers: [ZohoAnalyticsService],
  exports: [ZohoAnalyticsService],
})
export class ZohoAnalyticsModule {}
