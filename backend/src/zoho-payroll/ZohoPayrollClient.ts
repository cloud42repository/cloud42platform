import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  PayrollEmployee, CreatePayrollEmployeeDTO, UpdatePayrollEmployeeDTO,
  PayComponent,
  PayRun, CreatePayRunDTO,
  Payslip,
  TaxDeclaration,
  PayrollListParams,
} from "./zoho-payroll.dto";

export interface ZohoPayrollConfig extends ZohoCredentials {
  organizationId?: string;
  /** Override the full API base URL. Defaults to https://payroll.zoho.com/api/v1 */
  apiBaseUrl?: string;
}

/**
 * Zoho Payroll v1 API client.
 * Docs: https://www.zoho.com/payroll/api/v1/
 */
export class ZohoPayrollClient extends ZohoBaseClient {
  constructor(config: ZohoPayrollConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://payroll.zoho.com/api/v1",
      defaultParams: config.organizationId
        ? { organization_id: config.organizationId }
        : undefined,
    });
  }

  // â”€â”€â”€ Employees â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listEmployees(params?: PayrollListParams): Promise<{ employees: PayrollEmployee[] }> {
    return this.get("/employees", { params });
  }
  getEmployee(id: string): Promise<{ employee: PayrollEmployee }> {
    return this.get(`/employees/${id}`);
  }
  createEmployee(data: CreatePayrollEmployeeDTO): Promise<{ employee: PayrollEmployee }> {
    return this.post("/employees", data);
  }
  updateEmployee(id: string, data: UpdatePayrollEmployeeDTO): Promise<{ employee: PayrollEmployee }> {
    return this.put(`/employees/${id}`, data);
  }
  terminateEmployee(id: string, terminationDate: string, reason?: string): Promise<{ employee: PayrollEmployee }> {
    return this.post(`/employees/${id}/terminate`, { termination_date: terminationDate, reason });
  }

  // â”€â”€â”€ Pay Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listPayComponents(): Promise<{ pay_components: PayComponent[] }> {
    return this.get("/paycomponents");
  }
  getPayComponent(id: string): Promise<{ pay_component: PayComponent }> {
    return this.get(`/paycomponents/${id}`);
  }

  // â”€â”€â”€ Pay Runs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listPayRuns(params?: PayrollListParams): Promise<{ pay_runs: PayRun[] }> {
    return this.get("/payruns", { params });
  }
  getPayRun(id: string): Promise<{ pay_run: PayRun }> {
    return this.get(`/payruns/${id}`);
  }
  createPayRun(data: CreatePayRunDTO): Promise<{ pay_run: PayRun }> {
    return this.post("/payruns", data);
  }
  approvePayRun(id: string): Promise<{ pay_run: PayRun }> {
    return this.post(`/payruns/${id}/approve`, {});
  }

  // â”€â”€â”€ Payslips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listPayslips(payRunId: string): Promise<{ payslips: Payslip[] }> {
    return this.get(`/payruns/${payRunId}/payslips`);
  }
  getPayslip(payRunId: string, payslipId: string): Promise<{ payslip: Payslip }> {
    return this.get(`/payruns/${payRunId}/payslips/${payslipId}`);
  }

  // â”€â”€â”€ Tax Declarations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listDeclarations(params?: PayrollListParams): Promise<{ declarations: TaxDeclaration[] }> {
    return this.get("/declarations", { params });
  }
  getDeclaration(id: string): Promise<{ declaration: TaxDeclaration }> {
    return this.get(`/declarations/${id}`);
  }
}
