import { Module } from '@nestjs/common';
import { SoftvalueService } from './softvalue.service';
import { SoftvalueController } from './softvalue.controller';

@Module({
  controllers: [SoftvalueController],
  providers: [SoftvalueService],
  exports: [SoftvalueService],
})
export class SoftvalueModule {}
