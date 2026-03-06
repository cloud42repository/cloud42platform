import { Module } from '@nestjs/common';
import { ImpossibleCloudService } from './impossible-cloud.service';
import { ImpossibleCloudController } from './impossible-cloud.controller';

@Module({
  controllers: [ImpossibleCloudController],
  providers: [ImpossibleCloudService],
  exports: [ImpossibleCloudService],
})
export class ImpossibleCloudModule {}
