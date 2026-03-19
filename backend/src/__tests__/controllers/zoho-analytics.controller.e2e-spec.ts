import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoAnalyticsController } from '../../zoho-analytics/zoho-analytics.controller';

describe('ZohoAnalyticsController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoAnalyticsController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoAnalyticsController>(ZohoAnalyticsController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Workspaces ---
  it('GET /zoho-analytics/workspaces → listWorkspaces()', async () => {
    const result = await controller.listWorkspaces();
    expect(result).toBeDefined();
  });

  it('GET /zoho-analytics/workspaces/:id → getWorkspace()', async () => {
    const result = await controller.getWorkspace('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-analytics/workspaces → createWorkspace()', async () => {
    const result = await controller.createWorkspace({ workspaceName: 'Test Workspace' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-analytics/workspaces/:id → deleteWorkspace()', async () => {
    const result = await controller.deleteWorkspace('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Views ---
  it('GET /zoho-analytics/workspaces/:workspaceId/views → listViews()', async () => {
    const result = await controller.listViews('000000000000001', {});
    expect(result).toBeDefined();
  });

  it('GET /zoho-analytics/workspaces/:workspaceId/views/:viewId → getView()', async () => {
    const result = await controller.getView('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });

  it('POST /zoho-analytics/workspaces/:workspaceId/views → createView()', async () => {
    const result = await controller.createView('000000000000001', { viewName: 'Test View', viewType: 'TABLE' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-analytics/workspaces/:workspaceId/views/:viewId → deleteView()', async () => {
    const result = await controller.deleteView('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });

  // --- Reports & Dashboards ---
  it('GET /zoho-analytics/workspaces/:workspaceId/reports → listReports()', async () => {
    const result = await controller.listReports('000000000000001');
    expect(result).toBeDefined();
  });

  it('GET /zoho-analytics/workspaces/:workspaceId/dashboards → listDashboards()', async () => {
    const result = await controller.listDashboards('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Import / Export ---
  it('POST /zoho-analytics/import → importData()', async () => {
    const result = await controller.importData({ config: { workspaceId: '1', viewId: '1' }, data: [{ col1: 'val1' }] });
    expect(result).toBeDefined();
  });

  it('GET /zoho-analytics/workspaces/:workspaceId/views/:viewId/export → exportData()', async () => {
    const result = await controller.exportData('000000000000001', '000000000000002', 'csv');
    expect(result).toBeDefined();
  });
});
