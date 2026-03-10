import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-projects';

@Injectable({ providedIn: 'root' })
export class ZohoProjectsService {
  private readonly api = inject(ApiService);

  // Projects
  listProjects(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/projects', {}, query);
  }
  getProject(id: string) {
    return this.api.get(PREFIX, '/projects/:id', { id });
  }
  createProject(body: unknown) {
    return this.api.post(PREFIX, '/projects', {}, body);
  }
  updateProject(id: string, body: unknown) {
    return this.api.post(PREFIX, '/projects/:id', { id }, body);
  }
  deleteProject(id: string) {
    return this.api.delete(PREFIX, '/projects/:id', { id });
  }

  // Tasks
  listTasks(projectId: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/projects/:projectId/tasks', { projectId }, query);
  }
  getTask(projectId: string, taskId: string) {
    return this.api.get(PREFIX, '/projects/:projectId/tasks/:taskId', { projectId, taskId });
  }
  createTask(projectId: string, body: unknown) {
    return this.api.post(PREFIX, '/projects/:projectId/tasks', { projectId }, body);
  }
  updateTask(projectId: string, taskId: string, body: unknown) {
    return this.api.post(PREFIX, '/projects/:projectId/tasks/:taskId', { projectId, taskId }, body);
  }
  deleteTask(projectId: string, taskId: string) {
    return this.api.delete(PREFIX, '/projects/:projectId/tasks/:taskId', { projectId, taskId });
  }

  // Milestones
  listMilestones(projectId: string) {
    return this.api.get(PREFIX, '/projects/:projectId/milestones', { projectId });
  }

  // Bugs
  listBugs(projectId: string) {
    return this.api.get(PREFIX, '/projects/:projectId/bugs', { projectId });
  }
  getBug(projectId: string, bugId: string) {
    return this.api.get(PREFIX, '/projects/:projectId/bugs/:bugId', { projectId, bugId });
  }
  createBug(projectId: string, body: unknown) {
    return this.api.post(PREFIX, '/projects/:projectId/bugs', { projectId }, body);
  }
  updateBug(projectId: string, bugId: string, body: unknown) {
    return this.api.post(PREFIX, '/projects/:projectId/bugs/:bugId', { projectId, bugId }, body);
  }
  deleteBug(projectId: string, bugId: string) {
    return this.api.delete(PREFIX, '/projects/:projectId/bugs/:bugId', { projectId, bugId });
  }

  // Time Logs
  listTimeLogs(projectId: string) {
    return this.api.get(PREFIX, '/projects/:projectId/timelogs', { projectId });
  }
  addTimeLog(projectId: string, taskId: string, body: unknown) {
    return this.api.post(PREFIX, '/projects/:projectId/tasks/:taskId/timelogs', { projectId, taskId }, body);
  }
  deleteTimeLog(projectId: string, taskId: string, logId: string) {
    return this.api.delete(PREFIX, '/projects/:projectId/tasks/:taskId/timelogs/:logId', { projectId, taskId, logId });
  }
}
