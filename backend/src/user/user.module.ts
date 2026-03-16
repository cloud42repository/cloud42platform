import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    /* ── PostgreSQL connection via TypeORM ── */
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     type: 'postgres' as const,
    //     host: config.get<string>('DB_HOST', 'localhost'),
    //     port: config.get<number>('DB_PORT', 5432),
    //     username: config.get<string>('DB_USERNAME', 'postgres'),
    //     password: config.get<string>('DB_PASSWORD', 'postgres'),
    //     database: config.get<string>('DB_DATABASE', 'cloud42'),
    //     entities: [UserEntity],
    //     synchronize: config.get<string>('DB_SYNC', 'true') === 'true', // auto-create tables (dev only)
    //     ssl: config.get<string>('DB_SSL', 'false') === 'true'
    //       ? { rejectUnauthorized: false }
    //       : false,
    //   }),
    // }),
    // TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
