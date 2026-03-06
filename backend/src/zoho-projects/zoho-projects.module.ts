import { Module } from '@nestjs/common';
import { ZohoProjectsController } from './zoho-projects.controller';
import { ZohoProjectsService } from './zoho-projects.service';

@Module({
  controllers: [ZohoProjectsController],
  providers: [ZohoProjectsService],
  exports: [ZohoProjectsService],
})
export class ZohoProjectsModule {}
