import { Module } from '@nestjs/common';
import { ZohoWorkdriveController } from './zoho-workdrive.controller';
import { ZohoWorkdriveService } from './zoho-workdrive.service';

@Module({
  controllers: [ZohoWorkdriveController],
  providers: [ZohoWorkdriveService],
  exports: [ZohoWorkdriveService],
})
export class ZohoWorkdriveModule {}
