import { Module } from '@nestjs/common';
import { MicrosoftGraphController } from './microsoft-graph.controller';
import { MicrosoftGraphService } from './microsoft-graph.service';
import { AuthConfigModule } from '../auth-config/auth-config.module';

@Module({
  imports: [AuthConfigModule],
  controllers: [MicrosoftGraphController],
  providers: [MicrosoftGraphService],
  exports: [MicrosoftGraphService],
})
export class MicrosoftGraphModule {}
