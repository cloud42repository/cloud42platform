import { Module } from '@nestjs/common';
import { ZohoCliqController } from './zoho-cliq.controller';
import { ZohoCliqService } from './zoho-cliq.service';

@Module({
  controllers: [ZohoCliqController],
  providers: [ZohoCliqService],
  exports: [ZohoCliqService],
})
export class ZohoCliqModule {}
