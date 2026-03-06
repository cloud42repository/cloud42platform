import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  ExpenseCategory,
  Expense, CreateExpenseRecordDTO, UpdateExpenseRecordDTO,
  ExpenseReport, CreateExpenseReportDTO, UpdateExpenseReportDTO,
  ExpenseAdvance,
  ExpenseListParams,
} from "./zoho-expense.dto";

export interface ZohoExpenseConfig extends ZohoCredentials {
  organizationId?: string;
  /** Override the full API base URL. Defaults to https://expense.zoho.com/api/v1 */
  apiBaseUrl?: string;
}

/**
 * Zoho Expense v1 API client.
 * Docs: https://www.zoho.com/expense/api/v1/
 */
export class ZohoExpenseClient extends ZohoBaseClient {
  constructor(config: ZohoExpenseConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://expense.zoho.com/api/v1",
      defaultParams: config.organizationId
        ? { organization_id: config.organizationId }
        : undefined,
    });
  }

  // â”€â”€â”€ Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listCategories(): Promise<{ expense_categories: ExpenseCategory[] }> {
    return this.get("/expensecategories");
  }
  getCategory(id: string): Promise<{ expense_category: ExpenseCategory }> {
    return this.get(`/expensecategories/${id}`);
  }

  // â”€â”€â”€ Expenses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listExpenses(params?: ExpenseListParams): Promise<{ expenses: Expense[] }> {
    return this.get("/expenses", { params });
  }
  getExpense(id: string): Promise<{ expense: Expense }> {
    return this.get(`/expenses/${id}`);
  }
  createExpense(data: CreateExpenseRecordDTO): Promise<{ expense: Expense }> {
    return this.post("/expenses", data);
  }
  updateExpense(id: string, data: UpdateExpenseRecordDTO): Promise<{ expense: Expense }> {
    return this.put(`/expenses/${id}`, data);
  }
  deleteExpense(id: string): Promise<{ message: string }> {
    return this.delete(`/expenses/${id}`);
  }

  // â”€â”€â”€ Expense Reports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listReports(params?: ExpenseListParams): Promise<{ expense_reports: ExpenseReport[] }> {
    return this.get("/expensereports", { params });
  }
  getReport(id: string): Promise<{ expense_report: ExpenseReport }> {
    return this.get(`/expensereports/${id}`);
  }
  createReport(data: CreateExpenseReportDTO): Promise<{ expense_report: ExpenseReport }> {
    return this.post("/expensereports", data);
  }
  updateReport(id: string, data: UpdateExpenseReportDTO): Promise<{ expense_report: ExpenseReport }> {
    return this.put(`/expensereports/${id}`, data);
  }
  deleteReport(id: string): Promise<{ message: string }> {
    return this.delete(`/expensereports/${id}`);
  }
  submitReport(id: string): Promise<{ message: string }> {
    return this.post(`/expensereports/${id}/submit`, {});
  }
  approveReport(id: string): Promise<{ message: string }> {
    return this.post(`/expensereports/${id}/approve`, {});
  }

  // â”€â”€â”€ Advances â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listAdvances(): Promise<{ advance_payments: ExpenseAdvance[] }> {
    return this.get("/advancepayments");
  }
  getAdvance(id: string): Promise<{ advance_payment: ExpenseAdvance }> {
    return this.get(`/advancepayments/${id}`);
  }
}
