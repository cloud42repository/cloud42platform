import { Module } from '@nestjs/common';
import { ZohoDeskController } from './zoho-desk.controller';
import { ZohoDeskService } from './zoho-desk.service';

@Module({
  controllers: [ZohoDeskController],
  providers: [ZohoDeskService],
  exports: [ZohoDeskService],
})
export class ZohoDeskModule {}
