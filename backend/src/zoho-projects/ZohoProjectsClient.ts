import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  ProjectsProject, CreateProjectDTO, UpdateProjectDTO,
  ProjectsTask, CreateProjectTaskDTO, UpdateProjectTaskDTO,
  ProjectsMilestone,
  ProjectsBug, CreateBugDTO, UpdateBugDTO,
  ProjectsTimeLog, CreateTimeLogDTO,
  ProjectsListParams,
} from "./zoho-projects.dto";

export interface ZohoProjectsConfig extends ZohoCredentials {
  portalId?: string;
  organizationId?: string;
  /** Override the full API base URL. Defaults to https://projectsapi.zoho.com/restapi */
  apiBaseUrl?: string;
}

/**
 * Zoho Projects REST API client.
 * Docs: https://www.zoho.com/projects/help/rest-api/zohoprojectsapi.html
 */
export class ZohoProjectsClient extends ZohoBaseClient {
  private readonly portalId?: string;

  constructor(config: ZohoProjectsConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://projectsapi.zoho.com/restapi",
    });
    this.portalId = config.portalId;
  }

  private portalPath(path: string): string {
    return this.portalId ? `/portal/${this.portalId}${path}` : path;
  }

  // â”€â”€â”€ Projects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listProjects(params?: ProjectsListParams): Promise<{ projects: ProjectsProject[] }> {
    return this.get(this.portalPath("/projects/"), { params });
  }
  getProject(id: string): Promise<{ projects: ProjectsProject[] }> {
    return this.get(this.portalPath(`/projects/${id}/`));
  }
  createProject(data: CreateProjectDTO): Promise<{ projects: ProjectsProject[] }> {
    return this.post(this.portalPath("/projects/"), data);
  }
  updateProject(id: string, data: UpdateProjectDTO): Promise<{ projects: ProjectsProject[] }> {
    return this.post(this.portalPath(`/projects/${id}/`), data);
  }
  deleteProject(id: string): Promise<{ response: string }> {
    return this.delete(this.portalPath(`/projects/${id}/`));
  }

  // â”€â”€â”€ Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listTasks(projectId: string, params?: ProjectsListParams): Promise<{ tasks: ProjectsTask[] }> {
    return this.get(this.portalPath(`/projects/${projectId}/tasks/`), { params });
  }
  getTask(projectId: string, taskId: string): Promise<{ tasks: ProjectsTask[] }> {
    return this.get(this.portalPath(`/projects/${projectId}/tasks/${taskId}/`));
  }
  createTask(projectId: string, data: CreateProjectTaskDTO): Promise<{ tasks: ProjectsTask[] }> {
    return this.post(this.portalPath(`/projects/${projectId}/tasks/`), data);
  }
  updateTask(projectId: string, taskId: string, data: UpdateProjectTaskDTO): Promise<{ tasks: ProjectsTask[] }> {
    return this.post(this.portalPath(`/projects/${projectId}/tasks/${taskId}/`), data);
  }
  deleteTask(projectId: string, taskId: string): Promise<{ response: string }> {
    return this.delete(this.portalPath(`/projects/${projectId}/tasks/${taskId}/`));
  }

  // â”€â”€â”€ Milestones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listMilestones(projectId: string): Promise<{ milestones: ProjectsMilestone[] }> {
    return this.get(this.portalPath(`/projects/${projectId}/milestones/`));
  }

  // â”€â”€â”€ Bugs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listBugs(projectId: string): Promise<{ bugs: ProjectsBug[] }> {
    return this.get(this.portalPath(`/projects/${projectId}/bugs/`));
  }
  getBug(projectId: string, bugId: string): Promise<{ bugs: ProjectsBug[] }> {
    return this.get(this.portalPath(`/projects/${projectId}/bugs/${bugId}/`));
  }
  createBug(projectId: string, data: CreateBugDTO): Promise<{ bugs: ProjectsBug[] }> {
    return this.post(this.portalPath(`/projects/${projectId}/bugs/`), data);
  }
  updateBug(projectId: string, bugId: string, data: UpdateBugDTO): Promise<{ bugs: ProjectsBug[] }> {
    return this.post(this.portalPath(`/projects/${projectId}/bugs/${bugId}/`), data);
  }
  deleteBug(projectId: string, bugId: string): Promise<{ response: string }> {
    return this.delete(this.portalPath(`/projects/${projectId}/bugs/${bugId}/`));
  }

  // â”€â”€â”€ Timesheets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listTimeLogs(projectId: string): Promise<{ timelogs: { workhours?: ProjectsTimeLog[] } }> {
    return this.get(this.portalPath(`/projects/${projectId}/logs/`));
  }
  addTimeLog(projectId: string, taskId: string, data: CreateTimeLogDTO): Promise<unknown> {
    return this.post(this.portalPath(`/projects/${projectId}/tasks/${taskId}/logs/`), data);
  }
  deleteTimeLog(projectId: string, taskId: string, logId: string): Promise<{ response: string }> {
    return this.delete(this.portalPath(`/projects/${projectId}/tasks/${taskId}/logs/${logId}/`));
  }
}
