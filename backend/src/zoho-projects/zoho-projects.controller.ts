import {
  Controller, Get, Post, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoProjectsService } from './zoho-projects.service';

@Controller('zoho-projects')
export class ZohoProjectsController {
  constructor(private readonly service: ZohoProjectsService) {}

  @Get('projects') listProjects(@Query() q: Record<string, unknown>) { return this.service.listProjects(q); }
  @Get('projects/:id') getProject(@Param('id') id: string) { return this.service.getProject(id); }
  @Post('projects') createProject(@Body() body: unknown) { return this.service.createProject(body); }
  @Post('projects/:id') updateProject(@Param('id') id: string, @Body() body: unknown) { return this.service.updateProject(id, body); }
  @Delete('projects/:id') deleteProject(@Param('id') id: string) { return this.service.deleteProject(id); }

  @Get('projects/:projectId/tasks') listTasks(@Param('projectId') projectId: string, @Query() q: Record<string, unknown>) { return this.service.listTasks(projectId, q); }
  @Get('projects/:projectId/tasks/:taskId') getTask(@Param('projectId') projectId: string, @Param('taskId') taskId: string) { return this.service.getTask(projectId, taskId); }
  @Post('projects/:projectId/tasks') createTask(@Param('projectId') projectId: string, @Body() body: unknown) { return this.service.createTask(projectId, body); }
  @Post('projects/:projectId/tasks/:taskId') updateTask(@Param('projectId') projectId: string, @Param('taskId') taskId: string, @Body() body: unknown) { return this.service.updateTask(projectId, taskId, body); }
  @Delete('projects/:projectId/tasks/:taskId') deleteTask(@Param('projectId') projectId: string, @Param('taskId') taskId: string) { return this.service.deleteTask(projectId, taskId); }

  @Get('projects/:projectId/milestones') listMilestones(@Param('projectId') projectId: string) { return this.service.listMilestones(projectId); }

  @Get('projects/:projectId/bugs') listBugs(@Param('projectId') projectId: string) { return this.service.listBugs(projectId); }
  @Get('projects/:projectId/bugs/:bugId') getBug(@Param('projectId') projectId: string, @Param('bugId') bugId: string) { return this.service.getBug(projectId, bugId); }
  @Post('projects/:projectId/bugs') createBug(@Param('projectId') projectId: string, @Body() body: unknown) { return this.service.createBug(projectId, body); }
  @Post('projects/:projectId/bugs/:bugId') updateBug(@Param('projectId') projectId: string, @Param('bugId') bugId: string, @Body() body: unknown) { return this.service.updateBug(projectId, bugId, body); }
  @Delete('projects/:projectId/bugs/:bugId') deleteBug(@Param('projectId') projectId: string, @Param('bugId') bugId: string) { return this.service.deleteBug(projectId, bugId); }

  @Get('projects/:projectId/timelogs') listTimeLogs(@Param('projectId') projectId: string) { return this.service.listTimeLogs(projectId); }
  @Post('projects/:projectId/tasks/:taskId/timelogs') addTimeLog(@Param('projectId') projectId: string, @Param('taskId') taskId: string, @Body() body: unknown) { return this.service.addTimeLog(projectId, taskId, body); }
  @Delete('projects/:projectId/tasks/:taskId/timelogs/:logId') deleteTimeLog(@Param('projectId') projectId: string, @Param('taskId') taskId: string, @Param('logId') logId: string) { return this.service.deleteTimeLog(projectId, taskId, logId); }

  // ── OAuth ────────────────────────────────────────────────────────────
  @Get('oauth/authorize') getAuthUrl(@Query('scope') scope: string) { return this.service.getAuthUrl(scope); }
  @Post('oauth/exchange') exchangeGrantCode(@Body() body: { code: string }) { return this.service.exchangeGrantCode(body.code); }
  @Post('oauth/revoke') revokeAuth() { return this.service.revokeAuth(); }
}
