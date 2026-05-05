import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowEntity } from './workflow.entity';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import { NotificationModule } from '../notification/notification.module';
import { MicrosoftGraphModule } from '../microsoft-graph/microsoft-graph.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowEntity]),
    NotificationModule,
    MicrosoftGraphModule,
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService, WorkflowExecutionService],
  exports: [WorkflowService, WorkflowExecutionService],
})
export class WorkflowModule {}
