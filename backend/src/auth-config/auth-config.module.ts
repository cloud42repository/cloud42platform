import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthConfigEntity } from './auth-config.entity';
import { AuthConfigController } from './auth-config.controller';
import { AuthConfigService } from './auth-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthConfigEntity])],
  controllers: [AuthConfigController],
  providers: [AuthConfigService],
  exports: [AuthConfigService],
})
export class AuthConfigModule {}
