import { Module } from '@nestjs/common';
import { ZohoRecruitController } from './zoho-recruit.controller';
import { ZohoRecruitService } from './zoho-recruit.service';

@Module({
  controllers: [ZohoRecruitController],
  providers: [ZohoRecruitService],
  exports: [ZohoRecruitService],
})
export class ZohoRecruitModule {}
