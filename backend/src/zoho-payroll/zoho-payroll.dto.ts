import { ZohoAddress, ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Employee â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type PayrollEmployeeStatus = "active" | "inactive" | "terminated";

export interface PayrollEmployee {
  employee_id?: string;
  employee_number?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  date_of_birth?: string;
  date_of_joining?: string;
  designation?: string;
  department?: string;
  employment_type?: "full_time" | "part_time" | "contract";
  status?: PayrollEmployeeStatus;
  address?: ZohoAddress;
  bank_accounts?: PayrollBankAccount[];
}

export interface CreatePayrollEmployeeDTO {
  first_name: string;
  last_name: string;
  email?: string;
  date_of_joining?: string;
  designation?: string;
  department?: string;
  employment_type?: "full_time" | "part_time" | "contract";
}

export type UpdatePayrollEmployeeDTO = Partial<CreatePayrollEmployeeDTO>;

// â”€â”€â”€ Bank Account â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PayrollBankAccount {
  bank_name?: string;
  account_number?: string;
  routing_number?: string;
  account_type?: "checking" | "savings";
}

// â”€â”€â”€ Pay Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ComponentType = "earnings" | "deductions" | "taxes";

export interface PayComponent {
  component_id?: string;
  component_name?: string;
  type?: ComponentType;
  amount?: number;
  calculation_type?: "flat" | "percentage";
  is_mandatory?: boolean;
}

// â”€â”€â”€ Pay Run â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type PayRunStatus = "draft" | "approved" | "paid" | "cancelled";

export interface PayRun {
  pay_run_id?: string;
  pay_period?: string;
  pay_date?: string;
  status?: PayRunStatus;
  total_cost?: number;
  employee_count?: number;
  payslips?: Payslip[];
}

export interface CreatePayRunDTO {
  pay_period: string;
  pay_date: string;
  employee_ids?: string[];
}

// â”€â”€â”€ Payslip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface Payslip {
  payslip_id?: string;
  employee_id?: string;
  employee_name?: string;
  pay_run_id?: string;
  pay_period?: string;
  basic_pay?: number;
  gross_earnings?: number;
  total_deductions?: number;
  net_pay?: number;
  status?: "draft" | "approved" | "paid";
}

// â”€â”€â”€ Declaration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface TaxDeclaration {
  declaration_id?: string;
  employee_id?: string;
  fiscal_year?: string;
  status?: "draft" | "submitted" | "approved";
  declarations?: { section: string; amount: number }[];
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PayrollListParams extends ZohoListParams {
  status?: string;
  department?: string;
  employment_type?: string;
}
