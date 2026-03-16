import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowEntity } from './workflow.entity';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { UserEntity } from '../user/user.entity';

@Module({
  //imports: [TypeOrmModule.forFeature([WorkflowEntity])],
  imports: [
      /* ── PostgreSQL connection via TypeORM ── */
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          type: 'postgres' as const,
          host: config.get<string>('AZURE_POSTGRESQL_HOST', 'localhost'),
          port: config.get<number>('AZURE_POSTGRESQL_PORT', 5432),
          username: config.get<string>('AZURE_POSTGRESQL_USER', 'postgres'),
          password: config.get<string>('AZURE_POSTGRESQL_PASSWORD', 'Password1'),
          database: config.get<string>('AZURE_POSTGRESQL_DATABASE', 'postgres'),
          entities: [UserEntity, WorkflowEntity],
          synchronize: config.get<string>('AZURE_POSTGRESQL_SYNC', 'true') === 'true', // auto-create tables (dev only)
          ssl: config.get<string>('AZURE_POSTGRESQL_SSL', 'false') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        }),
      }),
      TypeOrmModule.forFeature([WorkflowEntity]),
    ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
