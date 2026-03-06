import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoInvoiceService } from './zoho-invoice.service';

@Controller('zoho-invoice')
export class ZohoInvoiceController {
  constructor(private readonly service: ZohoInvoiceService) {}

  @Get('customers') listCustomers(@Query() q: Record<string, unknown>) { return this.service.listCustomers(q); }
  @Get('customers/:id') getCustomer(@Param('id') id: string) { return this.service.getCustomer(id); }
  @Post('customers') createCustomer(@Body() body: unknown) { return this.service.createCustomer(body); }
  @Put('customers/:id') updateCustomer(@Param('id') id: string, @Body() body: unknown) { return this.service.updateCustomer(id, body); }
  @Delete('customers/:id') deleteCustomer(@Param('id') id: string) { return this.service.deleteCustomer(id); }

  @Get('invoices') listInvoices(@Query() q: Record<string, unknown>) { return this.service.listInvoices(q); }
  @Get('invoices/:id') getInvoice(@Param('id') id: string) { return this.service.getInvoice(id); }
  @Post('invoices') createInvoice(@Body() body: unknown) { return this.service.createInvoice(body); }
  @Put('invoices/:id') updateInvoice(@Param('id') id: string, @Body() body: unknown) { return this.service.updateInvoice(id, body); }
  @Delete('invoices/:id') deleteInvoice(@Param('id') id: string) { return this.service.deleteInvoice(id); }
  @Post('invoices/:id/send') sendInvoice(@Param('id') id: string) { return this.service.sendInvoice(id); }

  @Get('estimates') listEstimates(@Query() q: Record<string, unknown>) { return this.service.listEstimates(q); }
  @Get('estimates/:id') getEstimate(@Param('id') id: string) { return this.service.getEstimate(id); }
  @Post('estimates') createEstimate(@Body() body: unknown) { return this.service.createEstimate(body); }
  @Put('estimates/:id') updateEstimate(@Param('id') id: string, @Body() body: unknown) { return this.service.updateEstimate(id, body); }
  @Delete('estimates/:id') deleteEstimate(@Param('id') id: string) { return this.service.deleteEstimate(id); }

  @Get('recurring-invoices') listRecurringInvoices(@Query() q: Record<string, unknown>) { return this.service.listRecurringInvoices(q); }
  @Get('recurring-invoices/:id') getRecurringInvoice(@Param('id') id: string) { return this.service.getRecurringInvoice(id); }
  @Post('recurring-invoices') createRecurringInvoice(@Body() body: unknown) { return this.service.createRecurringInvoice(body); }
  @Delete('recurring-invoices/:id') deleteRecurringInvoice(@Param('id') id: string) { return this.service.deleteRecurringInvoice(id); }

  @Get('payments') listPayments(@Query() q: Record<string, unknown>) { return this.service.listPayments(q); }
  @Post('payments') createPayment(@Body() body: unknown) { return this.service.createPayment(body); }
  @Delete('payments/:id') deletePayment(@Param('id') id: string) { return this.service.deletePayment(id); }
}
