import { ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Category â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ExpenseCategory {
  category_id?: string;
  category_name?: string;
  description?: string;
  is_enabled?: boolean;
}

// â”€â”€â”€ Expense â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ExpenseStatus = "unsubmitted" | "submitted" | "approved" | "rejected" | "reimbursed";

export interface Expense {
  expense_id?: string;
  merchant_name?: string;
  date?: string;
  amount?: number;
  currency_code?: string;
  category_id?: string;
  category_name?: string;
  report_id?: string;
  employee_id?: string;
  receipt_url?: string;
  notes?: string;
  status?: ExpenseStatus;
  is_billable?: boolean;
  created_time?: string;
}

export interface CreateExpenseRecordDTO {
  amount: number;
  date: string;
  merchant_name?: string;
  currency_code?: string;
  category_id?: string;
  notes?: string;
  is_billable?: boolean;
}

export type UpdateExpenseRecordDTO = Partial<CreateExpenseRecordDTO>;

// â”€â”€â”€ Expense Report â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ReportStatus = "draft" | "submitted" | "approved" | "rejected" | "reimbursed";

export interface ExpenseReport {
  report_id?: string;
  report_name?: string;
  employee_id?: string;
  employee_name?: string;
  submitted_date?: string;
  from_date?: string;
  to_date?: string;
  total?: number;
  status?: ReportStatus;
  expenses?: Expense[];
}

export interface CreateExpenseReportDTO {
  report_name: string;
  from_date?: string;
  to_date?: string;
  description?: string;
  expense_ids?: string[];
}

export type UpdateExpenseReportDTO = Partial<CreateExpenseReportDTO>;

// â”€â”€â”€ Advance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ExpenseAdvance {
  advance_id?: string;
  employee_id?: string;
  amount?: number;
  currency_code?: string;
  date?: string;
  description?: string;
  balance?: number;
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ExpenseListParams extends ZohoListParams {
  status?: ExpenseStatus;
  employee_id?: string;
  from_date?: string;
  to_date?: string;
  category_id?: string;
}
