import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoCreatorController } from '../../zoho-creator/zoho-creator.controller';

describe('ZohoCreatorController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoCreatorController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoCreatorController>(ZohoCreatorController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Applications ---
  it('GET /zoho-creator/applications → listApplications()', async () => {
    const result = await controller.listApplications();
    expect(result).toBeDefined();
  });

  it('GET /zoho-creator/applications/:appLinkName → getApplication()', async () => {
    const result = await controller.getApplication('my-app');
    expect(result).toBeDefined();
  });

  // --- Forms ---
  it('GET /zoho-creator/applications/:appLinkName/forms → listForms()', async () => {
    const result = await controller.listForms('my-app');
    expect(result).toBeDefined();
  });

  it('GET /zoho-creator/applications/:appLinkName/forms/:formLinkName → getForm()', async () => {
    const result = await controller.getForm('my-app', 'my-form');
    expect(result).toBeDefined();
  });

  // --- Records ---
  it('GET /zoho-creator/applications/:appLinkName/reports/:reportLinkName/records → listRecords()', async () => {
    const result = await controller.listRecords('my-app', 'my-report', {});
    expect(result).toBeDefined();
  });

  it('GET /zoho-creator/applications/:appLinkName/reports/:reportLinkName/records/:id → getRecord()', async () => {
    const result = await controller.getRecord('my-app', 'my-report', '000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-creator/applications/:appLinkName/forms/:formLinkName/records → createRecord()', async () => {
    const result = await controller.createRecord('my-app', 'my-form', { data: { field1: 'value1' } });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-creator/applications/:appLinkName/reports/:reportLinkName/records/:id → updateRecord()', async () => {
    const result = await controller.updateRecord('my-app', 'my-report', '000000000000001', { data: { field1: 'updated' } });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-creator/applications/:appLinkName/reports/:reportLinkName/records/:id → deleteRecord()', async () => {
    const result = await controller.deleteRecord('my-app', 'my-report', '000000000000001');
    expect(result).toBeDefined();
  });

  it('GET /zoho-creator/applications/:appLinkName/reports/:reportLinkName/records/search → searchRecords()', async () => {
    const result = await controller.searchRecords('my-app', 'my-report', 'field1 == "value1"', {});
    expect(result).toBeDefined();
  });

  // --- Reports ---
  it('GET /zoho-creator/applications/:appLinkName/reports → listReports()', async () => {
    const result = await controller.listReports('my-app');
    expect(result).toBeDefined();
  });

  // --- Workflows ---
  it('POST /zoho-creator/applications/:appLinkName/workflows/:workflowName/trigger → triggerWorkflow()', async () => {
    const result = await controller.triggerWorkflow('my-app', 'my-workflow', { param1: 'value1' });
    expect(result).toBeDefined();
  });
});
