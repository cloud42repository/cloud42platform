import { Module } from '@nestjs/common';
import { ZohoBooksController } from './zoho-books.controller';
import { ZohoBooksService } from './zoho-books.service';

@Module({
  controllers: [ZohoBooksController],
  providers: [ZohoBooksService],
  exports: [ZohoBooksService],
})
export class ZohoBooksModule {}
