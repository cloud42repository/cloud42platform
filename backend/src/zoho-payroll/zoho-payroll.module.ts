import { Module } from '@nestjs/common';
import { ZohoPayrollController } from './zoho-payroll.controller';
import { ZohoPayrollService } from './zoho-payroll.service';

@Module({
  controllers: [ZohoPayrollController],
  providers: [ZohoPayrollService],
  exports: [ZohoPayrollService],
})
export class ZohoPayrollModule {}
