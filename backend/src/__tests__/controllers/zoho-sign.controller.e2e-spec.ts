import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoSignController } from '../../zoho-sign/zoho-sign.controller';

describe('ZohoSignController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoSignController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoSignController>(ZohoSignController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Requests ---
  it('GET /zoho-sign/requests → listRequests()', async () => {
    const result = await controller.listRequests({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-sign/requests/:id → getRequest()', async () => {
    const result = await controller.getRequest('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-sign/requests → createRequest()', async () => {
    const result = await controller.createRequest({ request_name: 'Test Doc', actions: [{ recipient_email: 'test@test.com', action_type: 'SIGN' }] });
    expect(result).toBeDefined();
  });

  it('POST /zoho-sign/requests/:id/send → sendRequest()', async () => {
    const result = await controller.sendRequest('000000000000001');
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-sign/requests/:id → deleteRequest()', async () => {
    const result = await controller.deleteRequest('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-sign/requests/:id/recall → recallRequest()', async () => {
    const result = await controller.recallRequest('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-sign/requests/:id/remind → remindRequest()', async () => {
    const result = await controller.remindRequest('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Templates ---
  it('GET /zoho-sign/templates → listTemplates()', async () => {
    const result = await controller.listTemplates({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-sign/templates/:id → getTemplate()', async () => {
    const result = await controller.getTemplate('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-sign/templates/:id/create-request → createRequestFromTemplate()', async () => {
    const result = await controller.createRequestFromTemplate('000000000000001', { actions: [{ recipient_email: 'test@test.com' }] });
    expect(result).toBeDefined();
  });

  // --- Documents ---
  it('GET /zoho-sign/requests/:requestId/documents/:documentId → getDocument()', async () => {
    const result = await controller.getDocument('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });

  it('GET /zoho-sign/requests/:requestId/documents/:documentId/download → downloadDocument()', async () => {
    const result = await controller.downloadDocument('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });
});
