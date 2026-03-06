import {
  Controller, Get, Post, Put, Param, Body, Query,
} from '@nestjs/common';
import { ZohoPayrollService } from './zoho-payroll.service';

@Controller('zoho-payroll')
export class ZohoPayrollController {
  constructor(private readonly service: ZohoPayrollService) {}

  @Get('employees') listEmployees(@Query() q: Record<string, unknown>) { return this.service.listEmployees(q); }
  @Get('employees/:id') getEmployee(@Param('id') id: string) { return this.service.getEmployee(id); }
  @Post('employees') createEmployee(@Body() body: unknown) { return this.service.createEmployee(body); }
  @Put('employees/:id') updateEmployee(@Param('id') id: string, @Body() body: unknown) { return this.service.updateEmployee(id, body); }
  @Post('employees/:id/terminate') terminateEmployee(@Param('id') id: string, @Body() body: { terminationDate: string; reason?: string }) { return this.service.terminateEmployee(id, body.terminationDate, body.reason); }

  @Get('pay-components') listPayComponents() { return this.service.listPayComponents(); }
  @Get('pay-components/:id') getPayComponent(@Param('id') id: string) { return this.service.getPayComponent(id); }

  @Get('payruns') listPayRuns(@Query() q: Record<string, unknown>) { return this.service.listPayRuns(q); }
  @Get('payruns/:id') getPayRun(@Param('id') id: string) { return this.service.getPayRun(id); }
  @Post('payruns') createPayRun(@Body() body: unknown) { return this.service.createPayRun(body); }
  @Post('payruns/:id/approve') approvePayRun(@Param('id') id: string) { return this.service.approvePayRun(id); }

  @Get('payruns/:payRunId/payslips') listPayslips(@Param('payRunId') payRunId: string) { return this.service.listPayslips(payRunId); }
  @Get('payruns/:payRunId/payslips/:payslipId') getPayslip(@Param('payRunId') payRunId: string, @Param('payslipId') payslipId: string) { return this.service.getPayslip(payRunId, payslipId); }

  @Get('declarations') listDeclarations(@Query() q: Record<string, unknown>) { return this.service.listDeclarations(q); }
  @Get('declarations/:id') getDeclaration(@Param('id') id: string) { return this.service.getDeclaration(id); }
}
