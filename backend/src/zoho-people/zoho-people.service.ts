import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoPeopleClient } from './ZohoPeopleClient';

@Injectable()
export class ZohoPeopleService {
  readonly client: ZohoPeopleClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoPeopleClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  listEmployees(params?: Record<string, unknown>) { return this.client.listEmployees(params as any); }
  getEmployee(id: string) { return this.client.getEmployee(id); }
  addEmployee(data: unknown) { return this.client.addEmployee(data as any); }
  updateEmployee(id: string, data: unknown) { return this.client.updateEmployee(id, data as any); }
  deleteEmployee(id: string) { return this.client.deleteEmployee(id); }

  listDepartments() { return this.client.listDepartments(); }
  listLeaveTypes() { return this.client.listLeaveTypes(); }

  listLeaveRequests(params?: Record<string, unknown>) { return this.client.listLeaveRequests(params as any); }
  addLeaveRequest(data: unknown) { return this.client.addLeaveRequest(data as any); }
  approveLeave(leaveId: string) { return this.client.approveLeave(leaveId); }
  rejectLeave(leaveId: string, reason?: string) { return this.client.rejectLeave(leaveId, reason); }

  listAttendance(empId: string, from?: string, to?: string) {
    return this.client.listAttendance(empId, from && to ? { from, to } : undefined);
  }

  getFormRecords(formName: string, params?: Record<string, unknown>) { return this.client.getFormRecords(formName, params as any); }
  addFormRecord(formName: string, data: Record<string, unknown>) { return this.client.addFormRecord(formName, data); }
  updateFormRecord(formName: string, recordId: string, data: Record<string, unknown>) { return this.client.updateFormRecord(formName, recordId, data); }
}
