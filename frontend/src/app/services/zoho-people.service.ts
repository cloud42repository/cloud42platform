import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-people';

@Injectable({ providedIn: 'root' })
export class ZohoPeopleService {
  private readonly api = inject(ApiService);

  // Employees
  listEmployees(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/employees', {}, query);
  }
  getEmployee(id: string) {
    return this.api.get(PREFIX, '/employees/:id', { id });
  }
  addEmployee(body: unknown) {
    return this.api.post(PREFIX, '/employees', {}, body);
  }
  updateEmployee(id: string, body: unknown) {
    return this.api.post(PREFIX, '/employees/:id', { id }, body);
  }
  deleteEmployee(id: string) {
    return this.api.delete(PREFIX, '/employees/:id', { id });
  }

  // Departments
  listDepartments() {
    return this.api.get(PREFIX, '/departments');
  }

  // Leave Types
  listLeaveTypes() {
    return this.api.get(PREFIX, '/leave-types');
  }

  // Leave Requests
  listLeaveRequests(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/leave-requests', {}, query);
  }
  addLeaveRequest(body: unknown) {
    return this.api.post(PREFIX, '/leave-requests', {}, body);
  }
  approveLeave(id: string) {
    return this.api.post(PREFIX, '/leave-requests/:id/approve', { id });
  }
  rejectLeave(id: string, body: unknown = {}) {
    return this.api.post(PREFIX, '/leave-requests/:id/reject', { id }, body);
  }

  // Attendance
  listAttendance(empId: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/attendance/:empId', { empId }, query);
  }

  // Forms
  getFormRecords(formName: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/forms/:formName/records', { formName }, query);
  }
  addFormRecord(formName: string, body: unknown) {
    return this.api.post(PREFIX, '/forms/:formName/records', { formName }, body);
  }
  updateFormRecord(formName: string, id: string, body: unknown) {
    return this.api.post(PREFIX, '/forms/:formName/records/:id', { formName, id }, body);
  }
}
