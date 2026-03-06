import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoBooksService } from './zoho-books.service';

@Controller('zoho-books')
export class ZohoBooksController {
  constructor(private readonly service: ZohoBooksService) {}

  // Contacts
  @Get('contacts') listContacts(@Query() q: Record<string, unknown>) { return this.service.listContacts(q); }
  @Get('contacts/:id') getContact(@Param('id') id: string) { return this.service.getContact(id); }
  @Post('contacts') createContact(@Body() body: unknown) { return this.service.createContact(body); }
  @Put('contacts/:id') updateContact(@Param('id') id: string, @Body() body: unknown) { return this.service.updateContact(id, body); }
  @Delete('contacts/:id') deleteContact(@Param('id') id: string) { return this.service.deleteContact(id); }

  // Invoices
  @Get('invoices') listInvoices(@Query() q: Record<string, unknown>) { return this.service.listInvoices(q); }
  @Get('invoices/:id') getInvoice(@Param('id') id: string) { return this.service.getInvoice(id); }
  @Post('invoices') createInvoice(@Body() body: unknown) { return this.service.createInvoice(body); }
  @Put('invoices/:id') updateInvoice(@Param('id') id: string, @Body() body: unknown) { return this.service.updateInvoice(id, body); }
  @Delete('invoices/:id') deleteInvoice(@Param('id') id: string) { return this.service.deleteInvoice(id); }
  @Post('invoices/:id/send') sendInvoice(@Param('id') id: string, @Body() body: Record<string, unknown>) { return this.service.sendInvoice(id, body); }
  @Post('invoices/:id/sent') markInvoiceAsSent(@Param('id') id: string) { return this.service.markInvoiceAsSent(id); }
  @Post('invoices/:id/void') voidInvoice(@Param('id') id: string) { return this.service.voidInvoice(id); }

  // Bills
  @Get('bills') listBills(@Query() q: Record<string, unknown>) { return this.service.listBills(q); }
  @Get('bills/:id') getBill(@Param('id') id: string) { return this.service.getBill(id); }
  @Post('bills') createBill(@Body() body: unknown) { return this.service.createBill(body); }
  @Put('bills/:id') updateBill(@Param('id') id: string, @Body() body: unknown) { return this.service.updateBill(id, body); }
  @Delete('bills/:id') deleteBill(@Param('id') id: string) { return this.service.deleteBill(id); }

  // Expenses
  @Get('expenses') listExpenses(@Query() q: Record<string, unknown>) { return this.service.listExpenses(q); }
  @Get('expenses/:id') getExpense(@Param('id') id: string) { return this.service.getExpense(id); }
  @Post('expenses') createExpense(@Body() body: unknown) { return this.service.createExpense(body); }
  @Put('expenses/:id') updateExpense(@Param('id') id: string, @Body() body: unknown) { return this.service.updateExpense(id, body); }
  @Delete('expenses/:id') deleteExpense(@Param('id') id: string) { return this.service.deleteExpense(id); }

  // Payments
  @Get('payments') listPayments(@Query() q: Record<string, unknown>) { return this.service.listPayments(q); }
  @Get('payments/:id') getPayment(@Param('id') id: string) { return this.service.getPayment(id); }
  @Post('payments') createPayment(@Body() body: unknown) { return this.service.createPayment(body); }
  @Delete('payments/:id') deletePayment(@Param('id') id: string) { return this.service.deletePayment(id); }

  // Items
  @Get('items') listItems(@Query() q: Record<string, unknown>) { return this.service.listItems(q); }
  @Get('items/:id') getItem(@Param('id') id: string) { return this.service.getItem(id); }
  @Post('items') createItem(@Body() body: unknown) { return this.service.createItem(body); }
  @Put('items/:id') updateItem(@Param('id') id: string, @Body() body: unknown) { return this.service.updateItem(id, body); }
  @Delete('items/:id') deleteItem(@Param('id') id: string) { return this.service.deleteItem(id); }
}
