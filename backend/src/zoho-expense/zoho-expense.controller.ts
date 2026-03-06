import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoExpenseService } from './zoho-expense.service';

@Controller('zoho-expense')
export class ZohoExpenseController {
  constructor(private readonly service: ZohoExpenseService) {}

  @Get('categories') listCategories() { return this.service.listCategories(); }
  @Get('categories/:id') getCategory(@Param('id') id: string) { return this.service.getCategory(id); }

  @Get('expenses') listExpenses(@Query() q: Record<string, unknown>) { return this.service.listExpenses(q); }
  @Get('expenses/:id') getExpense(@Param('id') id: string) { return this.service.getExpense(id); }
  @Post('expenses') createExpense(@Body() body: unknown) { return this.service.createExpense(body); }
  @Put('expenses/:id') updateExpense(@Param('id') id: string, @Body() body: unknown) { return this.service.updateExpense(id, body); }
  @Delete('expenses/:id') deleteExpense(@Param('id') id: string) { return this.service.deleteExpense(id); }

  @Get('reports') listReports(@Query() q: Record<string, unknown>) { return this.service.listReports(q); }
  @Get('reports/:id') getReport(@Param('id') id: string) { return this.service.getReport(id); }
  @Post('reports') createReport(@Body() body: unknown) { return this.service.createReport(body); }
  @Put('reports/:id') updateReport(@Param('id') id: string, @Body() body: unknown) { return this.service.updateReport(id, body); }
  @Delete('reports/:id') deleteReport(@Param('id') id: string) { return this.service.deleteReport(id); }
  @Post('reports/:id/submit') submitReport(@Param('id') id: string) { return this.service.submitReport(id); }
  @Post('reports/:id/approve') approveReport(@Param('id') id: string) { return this.service.approveReport(id); }

  @Get('advances') listAdvances() { return this.service.listAdvances(); }
  @Get('advances/:id') getAdvance(@Param('id') id: string) { return this.service.getAdvance(id); }
}
