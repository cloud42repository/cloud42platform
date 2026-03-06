import { Module } from '@nestjs/common';
import { ZohoCreatorService } from './zoho-creator.service';
import { ZohoCreatorController } from './zoho-creator.controller';

@Module({
  controllers: [ZohoCreatorController],
  providers: [ZohoCreatorService],
  exports: [ZohoCreatorService],
})
export class ZohoCreatorModule {}
