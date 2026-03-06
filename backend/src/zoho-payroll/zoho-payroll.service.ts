import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoPayrollClient } from './ZohoPayrollClient';

@Injectable()
export class ZohoPayrollService {
  readonly client: ZohoPayrollClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoPayrollClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      organizationId: config.get('ZOHO_ORGANIZATION_ID'),
    });
  }

  listEmployees(params?: Record<string, unknown>) { return this.client.listEmployees(params as any); }
  getEmployee(id: string) { return this.client.getEmployee(id); }
  createEmployee(data: unknown) { return this.client.createEmployee(data as any); }
  updateEmployee(id: string, data: unknown) { return this.client.updateEmployee(id, data as any); }
  terminateEmployee(id: string, terminationDate: string, reason?: string) { return this.client.terminateEmployee(id, terminationDate, reason); }

  listPayComponents() { return this.client.listPayComponents(); }
  getPayComponent(id: string) { return this.client.getPayComponent(id); }

  listPayRuns(params?: Record<string, unknown>) { return this.client.listPayRuns(params as any); }
  getPayRun(id: string) { return this.client.getPayRun(id); }
  createPayRun(data: unknown) { return this.client.createPayRun(data as any); }
  approvePayRun(id: string) { return this.client.approvePayRun(id); }

  listPayslips(payRunId: string) { return this.client.listPayslips(payRunId); }
  getPayslip(payRunId: string, payslipId: string) { return this.client.getPayslip(payRunId, payslipId); }

  listDeclarations(params?: Record<string, unknown>) { return this.client.listDeclarations(params as any); }
  getDeclaration(id: string) { return this.client.getDeclaration(id); }
}
