import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './user.entity';
import { WorkflowEntity } from '../workflow/workflow.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    /* ── PostgreSQL connection via TypeORM ── */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('AZURE_POSTGRESQL_HOST', 'localhost'),
        port: config.get<number>('AZURE_POSTGRESQL_PORT', 5432),
        username: config.get<string>('AZURE_POSTGRESQL_USERNAME', 'postgres'),
        password: config.get<string>('AZURE_POSTGRESQL_PASSWORD', 'Password1'),
        database: config.get<string>('AZURE_POSTGRESQL_DATABASE', 'postgres'),
        entities: [UserEntity, WorkflowEntity],
        synchronize: config.get<string>('AZURE_POSTGRESQL_SYNC', 'true') === 'true', // auto-create tables (dev only)
        ssl: config.get<string>('AZURE_POSTGRESQL_SSL', 'false') === 'true'
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
