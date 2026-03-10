import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-invoice';

@Injectable({ providedIn: 'root' })
export class ZohoInvoiceService {
  private readonly api = inject(ApiService);

  // Customers
  listCustomers(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/customers', {}, query);
  }
  getCustomer(id: string) {
    return this.api.get(PREFIX, '/customers/:id', { id });
  }
  createCustomer(body: unknown) {
    return this.api.post(PREFIX, '/customers', {}, body);
  }
  updateCustomer(id: string, body: unknown) {
    return this.api.put(PREFIX, '/customers/:id', { id }, body);
  }
  deleteCustomer(id: string) {
    return this.api.delete(PREFIX, '/customers/:id', { id });
  }

  // Invoices
  listInvoices(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/invoices', {}, query);
  }
  getInvoice(id: string) {
    return this.api.get(PREFIX, '/invoices/:id', { id });
  }
  createInvoice(body: unknown) {
    return this.api.post(PREFIX, '/invoices', {}, body);
  }
  updateInvoice(id: string, body: unknown) {
    return this.api.put(PREFIX, '/invoices/:id', { id }, body);
  }
  deleteInvoice(id: string) {
    return this.api.delete(PREFIX, '/invoices/:id', { id });
  }
  sendInvoice(id: string) {
    return this.api.post(PREFIX, '/invoices/:id/send', { id });
  }

  // Estimates
  listEstimates(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/estimates', {}, query);
  }
  getEstimate(id: string) {
    return this.api.get(PREFIX, '/estimates/:id', { id });
  }
  createEstimate(body: unknown) {
    return this.api.post(PREFIX, '/estimates', {}, body);
  }
  updateEstimate(id: string, body: unknown) {
    return this.api.put(PREFIX, '/estimates/:id', { id }, body);
  }
  deleteEstimate(id: string) {
    return this.api.delete(PREFIX, '/estimates/:id', { id });
  }

  // Recurring Invoices
  listRecurringInvoices(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/recurring-invoices', {}, query);
  }
  getRecurringInvoice(id: string) {
    return this.api.get(PREFIX, '/recurring-invoices/:id', { id });
  }
  createRecurringInvoice(body: unknown) {
    return this.api.post(PREFIX, '/recurring-invoices', {}, body);
  }
  deleteRecurringInvoice(id: string) {
    return this.api.delete(PREFIX, '/recurring-invoices/:id', { id });
  }

  // Payments
  listPayments(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/payments', {}, query);
  }
  createPayment(body: unknown) {
    return this.api.post(PREFIX, '/payments', {}, body);
  }
  deletePayment(id: string) {
    return this.api.delete(PREFIX, '/payments/:id', { id });
  }
}
