import { Module } from '@nestjs/common';
import { ZohoInventoryController } from './zoho-inventory.controller';
import { ZohoInventoryService } from './zoho-inventory.service';

@Module({
  controllers: [ZohoInventoryController],
  providers: [ZohoInventoryService],
  exports: [ZohoInventoryService],
})
export class ZohoInventoryModule {}
