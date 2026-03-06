import { ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Employee â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type EmployeeStatus = "active" | "inactive" | "terminated";

export interface PeopleEmployee {
  Employee_ID?: string;
  EmployeeID?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Mobile?: string;
  Department?: string;
  Designation?: string;
  DateOfJoining?: string;
  ReportingManager?: string;
  EmploymentStatus?: EmployeeStatus;
  Photo?: string;
  [key: string]: unknown;
}

export interface CreateEmployeeDTO {
  FirstName: string;
  LastName: string;
  Email: string;
  Department?: string;
  Designation?: string;
  DateOfJoining?: string;
  ReportingManager?: string;
  Mobile?: string;
  [key: string]: unknown;
}

export type UpdateEmployeeDTO = Partial<CreateEmployeeDTO>;

// â”€â”€â”€ Department â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PeopleDepartment {
  departmentId?: string;
  departmentName?: string;
  parentDepartment?: string;
  description?: string;
}

// â”€â”€â”€ Leave Type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PeopleLeaveType {
  leaveTypeId?: string;
  leaveTypeName?: string;
  colorCode?: string;
  unit?: "days" | "hours";
}

// â”€â”€â”€ Leave Request â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export interface PeopleLeaveRequest {
  leaveId?: string;
  employeeId?: string;
  leaveTypeId?: string;
  from?: string;
  to?: string;
  dayCount?: number;
  reason?: string;
  status?: LeaveStatus;
  approverEmail?: string;
}

export interface CreateLeaveRequestDTO {
  employeeId: string;
  leaveTypeId: string;
  from: string;
  to: string;
  reason?: string;
}

// â”€â”€â”€ Attendance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PeopleAttendance {
  attendanceId?: string;
  employeeId?: string;
  attendanceDate?: string;
  checkIn?: string;
  checkOut?: string;
  workDuration?: number;
}

// â”€â”€â”€ Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PeopleForm {
  formLinkName?: string;
  formDisplayName?: string;
  fields?: { fieldLabel: string; fieldName: string; type: string }[];
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PeopleListParams extends ZohoListParams {
  status?: EmployeeStatus;
  searchColumn?: string;
  searchValue?: string;
  modifiedTime?: string;
}
