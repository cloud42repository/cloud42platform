import { Module } from '@nestjs/common';
import { ZohoCampaignsController } from './zoho-campaigns.controller';
import { ZohoCampaignsService } from './zoho-campaigns.service';

@Module({
  controllers: [ZohoCampaignsController],
  providers: [ZohoCampaignsService],
  exports: [ZohoCampaignsService],
})
export class ZohoCampaignsModule {}
