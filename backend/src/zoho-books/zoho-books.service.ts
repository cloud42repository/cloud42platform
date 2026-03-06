import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoBooksClient } from './ZohoBooksClient';
import type { ZohoRegion } from '../base/types';

@Injectable()
export class ZohoBooksService {
  readonly client: ZohoBooksClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoBooksClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      region: (config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
      organizationId: config.get('ZOHO_ORGANIZATION_ID') ?? '',
    });
  }

  // Contacts
  listContacts(params?: Record<string, unknown>) { return this.client.listContacts(params as any); }
  getContact(id: string) { return this.client.getContact(id); }
  createContact(data: unknown) { return this.client.createContact(data as any); }
  updateContact(id: string, data: unknown) { return this.client.updateContact(id, data as any); }
  deleteContact(id: string) { return this.client.deleteContact(id); }

  // Invoices
  listInvoices(params?: Record<string, unknown>) { return this.client.listInvoices(params as any); }
  getInvoice(id: string) { return this.client.getInvoice(id); }
  createInvoice(data: unknown) { return this.client.createInvoice(data as any); }
  updateInvoice(id: string, data: unknown) { return this.client.updateInvoice(id, data as any); }
  deleteInvoice(id: string) { return this.client.deleteInvoice(id); }
  sendInvoice(id: string, emailData?: Record<string, unknown>) { return this.client.sendInvoice(id, emailData); }
  markInvoiceAsSent(id: string) { return this.client.markInvoiceAsSent(id); }
  voidInvoice(id: string) { return this.client.voidInvoice(id); }

  // Bills
  listBills(params?: Record<string, unknown>) { return this.client.listBills(params as any); }
  getBill(id: string) { return this.client.getBill(id); }
  createBill(data: unknown) { return this.client.createBill(data as any); }
  updateBill(id: string, data: unknown) { return this.client.updateBill(id, data as any); }
  deleteBill(id: string) { return this.client.deleteBill(id); }

  // Expenses
  listExpenses(params?: Record<string, unknown>) { return this.client.listExpenses(params as any); }
  getExpense(id: string) { return this.client.getExpense(id); }
  createExpense(data: unknown) { return this.client.createExpense(data as any); }
  updateExpense(id: string, data: unknown) { return this.client.updateExpense(id, data as any); }
  deleteExpense(id: string) { return this.client.deleteExpense(id); }

  // Payments
  listPayments(params?: Record<string, unknown>) { return this.client.listPayments(params as any); }
  getPayment(id: string) { return this.client.getPayment(id); }
  createPayment(data: unknown) { return this.client.createPayment(data as any); }
  deletePayment(id: string) { return this.client.deletePayment(id); }

  // Items
  listItems(params?: Record<string, unknown>) { return this.client.listItems(params as any); }
  getItem(id: string) { return this.client.getItem(id); }
  createItem(data: unknown) { return this.client.createItem(data as any); }
  updateItem(id: string, data: unknown) { return this.client.updateItem(id, data as any); }
  deleteItem(id: string) { return this.client.deleteItem(id); }
}
