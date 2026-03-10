import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-expense';

@Injectable({ providedIn: 'root' })
export class ZohoExpenseService {
  private readonly api = inject(ApiService);

  // Categories
  listCategories() {
    return this.api.get(PREFIX, '/categories');
  }
  getCategory(id: string) {
    return this.api.get(PREFIX, '/categories/:id', { id });
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

  // Reports
  listReports(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/reports', {}, query);
  }
  getReport(id: string) {
    return this.api.get(PREFIX, '/reports/:id', { id });
  }
  createReport(body: unknown) {
    return this.api.post(PREFIX, '/reports', {}, body);
  }
  updateReport(id: string, body: unknown) {
    return this.api.put(PREFIX, '/reports/:id', { id }, body);
  }
  deleteReport(id: string) {
    return this.api.delete(PREFIX, '/reports/:id', { id });
  }
  submitReport(id: string) {
    return this.api.post(PREFIX, '/reports/:id/submit', { id });
  }
  approveReport(id: string) {
    return this.api.post(PREFIX, '/reports/:id/approve', { id });
  }

  // Advances
  listAdvances() {
    return this.api.get(PREFIX, '/advances');
  }
  getAdvance(id: string) {
    return this.api.get(PREFIX, '/advances/:id', { id });
  }
}
