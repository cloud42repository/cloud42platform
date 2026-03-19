import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoProjectsController } from '../../zoho-projects/zoho-projects.controller';

describe('ZohoProjectsController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoProjectsController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoProjectsController>(ZohoProjectsController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Projects ---
  it('GET /zoho-projects/projects → listProjects()', async () => {
    const result = await controller.listProjects({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-projects/projects/:id → getProject()', async () => {
    const result = await controller.getProject('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-projects/projects → createProject()', async () => {
    const result = await controller.createProject({ name: 'Test Project' });
    expect(result).toBeDefined();
  });

  it('POST /zoho-projects/projects/:id → updateProject()', async () => {
    const result = await controller.updateProject('000000000000001', { name: 'Updated Project' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-projects/projects/:id → deleteProject()', async () => {
    const result = await controller.deleteProject('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Tasks ---
  it('GET /zoho-projects/projects/:projectId/tasks → listTasks()', async () => {
    const result = await controller.listTasks('000000000000001', {});
    expect(result).toBeDefined();
  });

  it('GET /zoho-projects/projects/:projectId/tasks/:taskId → getTask()', async () => {
    const result = await controller.getTask('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });

  it('POST /zoho-projects/projects/:projectId/tasks → createTask()', async () => {
    const result = await controller.createTask('000000000000001', { name: 'Test Task' });
    expect(result).toBeDefined();
  });

  it('POST /zoho-projects/projects/:projectId/tasks/:taskId → updateTask()', async () => {
    const result = await controller.updateTask('000000000000001', '000000000000002', { name: 'Updated Task' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-projects/projects/:projectId/tasks/:taskId → deleteTask()', async () => {
    const result = await controller.deleteTask('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });

  // --- Milestones ---
  it('GET /zoho-projects/projects/:projectId/milestones → listMilestones()', async () => {
    const result = await controller.listMilestones('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Bugs ---
  it('GET /zoho-projects/projects/:projectId/bugs → listBugs()', async () => {
    const result = await controller.listBugs('000000000000001');
    expect(result).toBeDefined();
  });

  it('GET /zoho-projects/projects/:projectId/bugs/:bugId → getBug()', async () => {
    const result = await controller.getBug('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });

  it('POST /zoho-projects/projects/:projectId/bugs → createBug()', async () => {
    const result = await controller.createBug('000000000000001', { title: 'Test Bug' });
    expect(result).toBeDefined();
  });

  it('POST /zoho-projects/projects/:projectId/bugs/:bugId → updateBug()', async () => {
    const result = await controller.updateBug('000000000000001', '000000000000002', { title: 'Updated' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-projects/projects/:projectId/bugs/:bugId → deleteBug()', async () => {
    const result = await controller.deleteBug('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });

  // --- Time Logs ---
  it('GET /zoho-projects/projects/:projectId/timelogs → listTimeLogs()', async () => {
    const result = await controller.listTimeLogs('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-projects/projects/:projectId/tasks/:taskId/timelogs → addTimeLog()', async () => {
    const result = await controller.addTimeLog('000000000000001', '000000000000002', { date: '2026-01-01', hours: '2' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-projects/projects/:projectId/tasks/:taskId/timelogs/:logId → deleteTimeLog()', async () => {
    const result = await controller.deleteTimeLog('000000000000001', '000000000000002', '000000000000003');
    expect(result).toBeDefined();
  });
});
