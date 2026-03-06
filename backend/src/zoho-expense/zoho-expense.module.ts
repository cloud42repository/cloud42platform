import { Module } from '@nestjs/common';
import { ZohoExpenseController } from './zoho-expense.controller';
import { ZohoExpenseService } from './zoho-expense.service';

@Module({
  controllers: [ZohoExpenseController],
  providers: [ZohoExpenseService],
  exports: [ZohoExpenseService],
})
export class ZohoExpenseModule {}
