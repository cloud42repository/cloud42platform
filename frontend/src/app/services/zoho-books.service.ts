import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-books';

@Injectable({ providedIn: 'root' })
export class ZohoBooksService {
  private readonly api = inject(ApiService);

  // Contacts
  listContacts(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/contacts', {}, query);
  }
  getContact(id: string) {
    return this.api.get(PREFIX, '/contacts/:id', { id });
  }
  createContact(body: unknown) {
    return this.api.post(PREFIX, '/contacts', {}, body);
  }
  updateContact(id: string, body: unknown) {
    return this.api.put(PREFIX, '/contacts/:id', { id }, body);
  }
  deleteContact(id: string) {
    return this.api.delete(PREFIX, '/contacts/:id', { id });
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
  sendInvoice(id: string, body: unknown = {}) {
    return this.api.post(PREFIX, '/invoices/:id/send', { id }, body);
  }
  markInvoiceAsSent(id: string) {
    return this.api.post(PREFIX, '/invoices/:id/sent', { id });
  }
  voidInvoice(id: string) {
    return this.api.post(PREFIX, '/invoices/:id/void', { id });
  }

  // Bills
  listBills(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/bills', {}, query);
  }
  getBill(id: string) {
    return this.api.get(PREFIX, '/bills/:id', { id });
  }
  createBill(body: unknown) {
    return this.api.post(PREFIX, '/bills', {}, body);
  }
  updateBill(id: string, body: unknown) {
    return this.api.put(PREFIX, '/bills/:id', { id }, body);
  }
  deleteBill(id: string) {
    return this.api.delete(PREFIX, '/bills/:id', { id });
  }

  // Expenses
  listExpenses(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/expenses', {}, query);
  }
  getExpense(id: string) {
    return this.api.get(PREFIX, '/expenses/:id', { id });
  }
  createExpense(body: unknown) {
    return this.api.post(PREFIX, '/expenses', {}, body);
  }
  updateExpense(id: string, body: unknown) {
    return this.api.put(PREFIX, '/expenses/:id', { id }, body);
  }
  deleteExpense(id: string) {
    return this.api.delete(PREFIX, '/expenses/:id', { id });
  }

  // Payments
  listPayments(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/payments', {}, query);
  }
  getPayment(id: string) {
    return this.api.get(PREFIX, '/payments/:id', { id });
  }
  createPayment(body: unknown) {
    return this.api.post(PREFIX, '/payments', {}, body);
  }
  deletePayment(id: string) {
    return this.api.delete(PREFIX, '/payments/:id', { id });
  }

  // Items
  listItems(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/items', {}, query);
  }
  getItem(id: string) {
    return this.api.get(PREFIX, '/items/:id', { id });
  }
  createItem(body: unknown) {
    return this.api.post(PREFIX, '/items', {}, body);
  }
  updateItem(id: string, body: unknown) {
    return this.api.put(PREFIX, '/items/:id', { id }, body);
  }
  deleteItem(id: string) {
    return this.api.delete(PREFIX, '/items/:id', { id });
  }
}
