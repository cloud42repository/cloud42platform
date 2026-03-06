import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoInvoiceClient } from './ZohoInvoiceClient';
import type { ZohoRegion } from '../base/types';

@Injectable()
export class ZohoInvoiceService {
  readonly client: ZohoInvoiceClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoInvoiceClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      region: (config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
      organizationId: config.get('ZOHO_ORGANIZATION_ID') ?? '',
    });
  }

  // Customers
  listCustomers(params?: Record<string, unknown>) { return this.client.listCustomers(params as any); }
  getCustomer(id: string) { return this.client.getCustomer(id); }
  createCustomer(data: unknown) { return this.client.createCustomer(data as any); }
  updateCustomer(id: string, data: unknown) { return this.client.updateCustomer(id, data as any); }
  deleteCustomer(id: string) { return this.client.deleteCustomer(id); }

  // Invoices
  listInvoices(params?: Record<string, unknown>) { return this.client.listInvoices(params as any); }
  getInvoice(id: string) { return this.client.getInvoice(id); }
  createInvoice(data: unknown) { return this.client.createInvoice(data as any); }
  updateInvoice(id: string, data: unknown) { return this.client.updateInvoice(id, data as any); }
  deleteInvoice(id: string) { return this.client.deleteInvoice(id); }
  sendInvoice(id: string) { return this.client.sendInvoice(id); }

  // Estimates
  listEstimates(params?: Record<string, unknown>) { return this.client.listEstimates(params as any); }
  getEstimate(id: string) { return this.client.getEstimate(id); }
  createEstimate(data: unknown) { return this.client.createEstimate(data as any); }
  updateEstimate(id: string, data: unknown) { return this.client.updateEstimate(id, data as any); }
  deleteEstimate(id: string) { return this.client.deleteEstimate(id); }

  // Recurring invoices
  listRecurringInvoices(params?: Record<string, unknown>) { return this.client.listRecurringInvoices(params as any); }
  getRecurringInvoice(id: string) { return this.client.getRecurringInvoice(id); }
  createRecurringInvoice(data: unknown) { return this.client.createRecurringInvoice(data as any); }
  deleteRecurringInvoice(id: string) { return this.client.deleteRecurringInvoice(id); }

  // Payments
  listPayments(params?: Record<string, unknown>) { return this.client.listPayments(params as any); }
  createPayment(data: unknown) { return this.client.createPayment(data as any); }
  deletePayment(id: string) { return this.client.deletePayment(id); }
}
