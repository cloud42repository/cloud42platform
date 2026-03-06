import { ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Project â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ProjectStatus = "active" | "completed" | "archived";

export interface ProjectsProject {
  id?: string;
  name: string;
  description?: string;
  owner?: { id: string; name?: string };
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget?: number;
  billing_type?: "based_on_project_hours" | "based_on_task_hours" | "based_on_staff_hours" | "fixed_cost";
  rate?: number;
  custom_fields?: Record<string, unknown>;
  created_time?: string;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  owner_id?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  billing_type?: string;
  rate?: number;
}

export type UpdateProjectDTO = Partial<CreateProjectDTO>;

// â”€â”€â”€ Task â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type TaskStatus = "open" | "closed";
export type TaskPriority = "none" | "low" | "medium" | "high";

export interface ProjectsTask {
  id?: string;
  name: string;
  description?: string;
  project_id?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  start_date?: string;
  end_date?: string;
  due_date?: string;
  hours?: number;
  assignees?: { id: string; name?: string }[];
  parent_task_id?: string;
  created_time?: string;
}

export interface CreateProjectTaskDTO {
  name: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  start_date?: string;
  end_date?: string;
  assignee_id?: string;
}

export type UpdateProjectTaskDTO = Partial<CreateProjectTaskDTO>;

// â”€â”€â”€ Milestone â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ProjectsMilestone {
  id?: string;
  name: string;
  project_id?: string;
  status?: string;
  flag?: "internal" | "external";
  end_date?: string;
  completed_date?: string;
}

// â”€â”€â”€ Bug â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type BugSeverity = "critical" | "major" | "minor" | "trivial";

export interface ProjectsBug {
  id?: string;
  title: string;
  description?: string;
  project_id?: string;
  status?: string;
  severity?: BugSeverity;
  priority?: TaskPriority;
  assignee?: { id: string; name?: string };
  created_time?: string;
}

export interface CreateBugDTO {
  title: string;
  description?: string;
  severity?: BugSeverity;
  priority?: TaskPriority;
  assignee_id?: string;
}

export type UpdateBugDTO = Partial<CreateBugDTO>;

// â”€â”€â”€ Timesheet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ProjectsTimeLog {
  id?: string;
  project_id?: string;
  task_id?: string;
  user_id?: string;
  bill_status?: "billable" | "non_billable";
  hours?: string;
  notes?: string;
  log_date?: string;
}

export interface CreateTimeLogDTO {
  task_id: string;
  user_id?: string;
  log_date: string;
  hours: string;
  notes?: string;
  bill_status?: "billable" | "non_billable";
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ProjectsListParams extends ZohoListParams {
  status?: ProjectStatus;
  search?: string;
  sort_column?: string;
  sort_order?: "asc" | "desc";
}
