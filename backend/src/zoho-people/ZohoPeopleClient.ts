import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  PeopleEmployee, CreateEmployeeDTO, UpdateEmployeeDTO,
  PeopleDepartment,
  PeopleLeaveType,
  PeopleLeaveRequest, CreateLeaveRequestDTO,
  PeopleAttendance,
  PeopleForm,
  PeopleListParams,
} from "./zoho-people.dto";

export interface ZohoPeopleConfig extends ZohoCredentials {
  /** Override the full API base URL. Defaults to https://people.zoho.com/people/api */
  apiBaseUrl?: string;
}

/**
 * Zoho People API client.
 * Docs: https://www.zoho.com/people/api/overview.html
 */
export class ZohoPeopleClient extends ZohoBaseClient {
  constructor(config: ZohoPeopleConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://people.zoho.com/people/api",
    });
  }

  // â”€â”€â”€ Employees â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listEmployees(params?: PeopleListParams): Promise<unknown> {
    return this.get("/forms/employee/getRecords", { params });
  }
  getEmployee(employeeId: string): Promise<unknown> {
    return this.get("/forms/employee/getDataByID", { params: { recordId: employeeId } });
  }
  addEmployee(data: CreateEmployeeDTO): Promise<unknown> {
    return this.post("/forms/employee/insertRecord", data);
  }
  updateEmployee(employeeId: string, data: UpdateEmployeeDTO): Promise<unknown> {
    return this.post("/forms/employee/updateRecord", { ...data, recordId: employeeId });
  }
  deleteEmployee(employeeId: string): Promise<unknown> {
    return this.post("/forms/employee/deleteRecord", { recordId: employeeId });
  }

  // â”€â”€â”€ Departments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listDepartments(): Promise<unknown> {
    return this.get("/topbar/v1/data", { params: { tabName: "Department" } });
  }

  // â”€â”€â”€ Leave Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listLeaveTypes(): Promise<unknown> {
    return this.get("/leave/v2/leavetypes");
  }

  // â”€â”€â”€ Leave Requests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listLeaveRequests(params?: PeopleListParams): Promise<unknown> {
    return this.get("/leave/v2/leaveList", { params });
  }
  addLeaveRequest(data: CreateLeaveRequestDTO): Promise<unknown> {
    return this.post("/leave/v2/addLeave", data);
  }
  approveLeave(leaveId: string): Promise<unknown> {
    return this.post("/leave/v2/updateStatus", { leaveId, status: "Approved" });
  }
  rejectLeave(leaveId: string, reason?: string): Promise<unknown> {
    return this.post("/leave/v2/updateStatus", { leaveId, status: "Rejected", comments: reason });
  }

  // â”€â”€â”€ Attendance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listAttendance(empId: string, dateRange?: { from: string; to: string }): Promise<unknown> {
    return this.get("/attendance/v1/attendanceList", { params: { empId, ...dateRange } });
  }

  // â”€â”€â”€ Forms (custom) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  getFormRecords(formName: string, params?: PeopleListParams): Promise<unknown> {
    return this.get(`/forms/${formName}/getRecords`, { params });
  }
  addFormRecord(formName: string, data: Record<string, unknown>): Promise<unknown> {
    return this.post(`/forms/${formName}/insertRecord`, data);
  }
  updateFormRecord(formName: string, recordId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.post(`/forms/${formName}/updateRecord`, { ...data, recordId });
  }
}
