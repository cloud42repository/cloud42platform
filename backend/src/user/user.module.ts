import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailService } from '../shared/email.service';
import { MicrosoftGraphModule } from '../microsoft-graph/microsoft-graph.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MicrosoftGraphModule,
  ],
  controllers: [UserController],
  providers: [UserService, EmailService],
  exports: [UserService, EmailService],
})
export class UserModule {}
