import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-payroll';

@Injectable({ providedIn: 'root' })
export class ZohoPayrollService {
  private readonly api = inject(ApiService);

  // Employees
  listEmployees(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/employees', {}, query);
  }
  getEmployee(id: string) {
    return this.api.get(PREFIX, '/employees/:id', { id });
  }
  createEmployee(body: unknown) {
    return this.api.post(PREFIX, '/employees', {}, body);
  }
  updateEmployee(id: string, body: unknown) {
    return this.api.put(PREFIX, '/employees/:id', { id }, body);
  }
  terminateEmployee(id: string, body: unknown) {
    return this.api.post(PREFIX, '/employees/:id/terminate', { id }, body);
  }

  // Pay Components
  listPayComponents() {
    return this.api.get(PREFIX, '/pay-components');
  }
  getPayComponent(id: string) {
    return this.api.get(PREFIX, '/pay-components/:id', { id });
  }

  // Pay Runs
  listPayRuns(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/pay-runs', {}, query);
  }
  getPayRun(id: string) {
    return this.api.get(PREFIX, '/pay-runs/:id', { id });
  }
  createPayRun(body: unknown) {
    return this.api.post(PREFIX, '/pay-runs', {}, body);
  }
  approvePayRun(id: string) {
    return this.api.post(PREFIX, '/pay-runs/:id/approve', { id });
  }

  // Payslips
  listPayslips(payRunId: string) {
    return this.api.get(PREFIX, '/pay-runs/:payRunId/payslips', { payRunId });
  }
  getPayslip(payRunId: string, payslipId: string) {
    return this.api.get(PREFIX, '/pay-runs/:payRunId/payslips/:payslipId', { payRunId, payslipId });
  }

  // Declarations
  listDeclarations(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/declarations', {}, query);
  }
  getDeclaration(id: string) {
    return this.api.get(PREFIX, '/declarations/:id', { id });
  }
}
