import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoExpenseClient } from './ZohoExpenseClient';

@Injectable()
export class ZohoExpenseService {
  readonly client: ZohoExpenseClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoExpenseClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      organizationId: config.get('ZOHO_ORGANIZATION_ID'),
    });
  }

  listCategories() { return this.client.listCategories(); }
  getCategory(id: string) { return this.client.getCategory(id); }

  listExpenses(params?: Record<string, unknown>) { return this.client.listExpenses(params as any); }
  getExpense(id: string) { return this.client.getExpense(id); }
  createExpense(data: unknown) { return this.client.createExpense(data as any); }
  updateExpense(id: string, data: unknown) { return this.client.updateExpense(id, data as any); }
  deleteExpense(id: string) { return this.client.deleteExpense(id); }

  listReports(params?: Record<string, unknown>) { return this.client.listReports(params as any); }
  getReport(id: string) { return this.client.getReport(id); }
  createReport(data: unknown) { return this.client.createReport(data as any); }
  updateReport(id: string, data: unknown) { return this.client.updateReport(id, data as any); }
  deleteReport(id: string) { return this.client.deleteReport(id); }
  submitReport(id: string) { return this.client.submitReport(id); }
  approveReport(id: string) { return this.client.approveReport(id); }

  listAdvances() { return this.client.listAdvances(); }
  getAdvance(id: string) { return this.client.getAdvance(id); }
}
