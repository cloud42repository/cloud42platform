import {
  Controller, Get, Post, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoPeopleService } from './zoho-people.service';

@Controller('zoho-people')
export class ZohoPeopleController {
  constructor(private readonly service: ZohoPeopleService) {}

  @Get('employees') listEmployees(@Query() q: Record<string, unknown>) { return this.service.listEmployees(q); }
  @Get('employees/:id') getEmployee(@Param('id') id: string) { return this.service.getEmployee(id); }
  @Post('employees') addEmployee(@Body() body: unknown) { return this.service.addEmployee(body); }
  @Post('employees/:id') updateEmployee(@Param('id') id: string, @Body() body: unknown) { return this.service.updateEmployee(id, body); }
  @Delete('employees/:id') deleteEmployee(@Param('id') id: string) { return this.service.deleteEmployee(id); }

  @Get('departments') listDepartments() { return this.service.listDepartments(); }
  @Get('leave-types') listLeaveTypes() { return this.service.listLeaveTypes(); }

  @Get('leave-requests') listLeaveRequests(@Query() q: Record<string, unknown>) { return this.service.listLeaveRequests(q); }
  @Post('leave-requests') addLeaveRequest(@Body() body: unknown) { return this.service.addLeaveRequest(body); }
  @Post('leave-requests/:id/approve') approveLeave(@Param('id') id: string) { return this.service.approveLeave(id); }
  @Post('leave-requests/:id/reject') rejectLeave(@Param('id') id: string, @Body() body: { reason?: string }) { return this.service.rejectLeave(id, body.reason); }

  @Get('attendance/:empId') listAttendance(
    @Param('empId') empId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) { return this.service.listAttendance(empId, from, to); }

  @Get('forms/:formName/records') getFormRecords(@Param('formName') formName: string, @Query() q: Record<string, unknown>) { return this.service.getFormRecords(formName, q); }
  @Post('forms/:formName/records') addFormRecord(@Param('formName') formName: string, @Body() body: Record<string, unknown>) { return this.service.addFormRecord(formName, body); }
  @Post('forms/:formName/records/:id') updateFormRecord(@Param('formName') formName: string, @Param('id') id: string, @Body() body: Record<string, unknown>) { return this.service.updateFormRecord(formName, id, body); }

  // ── OAuth ────────────────────────────────────────────────────────────
  @Get('oauth/authorize') getAuthUrl(@Query('scope') scope: string) { return this.service.getAuthUrl(scope); }
  @Post('oauth/exchange') exchangeGrantCode(@Body() body: { code: string }) { return this.service.exchangeGrantCode(body.code); }
  @Post('oauth/revoke') revokeAuth() { return this.service.revokeAuth(); }
}
