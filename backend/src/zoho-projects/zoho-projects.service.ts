import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoProjectsClient } from './ZohoProjectsClient';

@Injectable()
export class ZohoProjectsService {
  readonly client: ZohoProjectsClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoProjectsClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      portalId: config.get('ZOHO_PORTAL_ID'),
    });
  }

  listProjects(params?: Record<string, unknown>) { return this.client.listProjects(params as any); }
  getProject(id: string) { return this.client.getProject(id); }
  createProject(data: unknown) { return this.client.createProject(data as any); }
  updateProject(id: string, data: unknown) { return this.client.updateProject(id, data as any); }
  deleteProject(id: string) { return this.client.deleteProject(id); }

  listTasks(projectId: string, params?: Record<string, unknown>) { return this.client.listTasks(projectId, params as any); }
  getTask(projectId: string, taskId: string) { return this.client.getTask(projectId, taskId); }
  createTask(projectId: string, data: unknown) { return this.client.createTask(projectId, data as any); }
  updateTask(projectId: string, taskId: string, data: unknown) { return this.client.updateTask(projectId, taskId, data as any); }
  deleteTask(projectId: string, taskId: string) { return this.client.deleteTask(projectId, taskId); }

  listMilestones(projectId: string) { return this.client.listMilestones(projectId); }

  listBugs(projectId: string) { return this.client.listBugs(projectId); }
  getBug(projectId: string, bugId: string) { return this.client.getBug(projectId, bugId); }
  createBug(projectId: string, data: unknown) { return this.client.createBug(projectId, data as any); }
  updateBug(projectId: string, bugId: string, data: unknown) { return this.client.updateBug(projectId, bugId, data as any); }
  deleteBug(projectId: string, bugId: string) { return this.client.deleteBug(projectId, bugId); }

  listTimeLogs(projectId: string) { return this.client.listTimeLogs(projectId); }
  addTimeLog(projectId: string, taskId: string, data: unknown) { return this.client.addTimeLog(projectId, taskId, data as any); }
  deleteTimeLog(projectId: string, taskId: string, logId: string) { return this.client.deleteTimeLog(projectId, taskId, logId); }
}
