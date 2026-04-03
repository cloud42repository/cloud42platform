import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareEntity } from './share.entity';
import { DashboardEntity } from '../dashboard/dashboard.entity';
import { FormEntity } from '../form/form.entity';
import { WorkflowEntity } from '../workflow/workflow.entity';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShareEntity,
      DashboardEntity,
      FormEntity,
      WorkflowEntity,
    ]),
  ],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService],
})
export class ShareModule {}
