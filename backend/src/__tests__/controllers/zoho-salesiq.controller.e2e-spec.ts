import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoSalesIQController } from '../../zoho-salesiq/zoho-salesiq.controller';

describe('ZohoSalesIQController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoSalesIQController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoSalesIQController>(ZohoSalesIQController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Visitors ---
  it('GET /zoho-salesiq/:screenName/visitors → listVisitors()', async () => {
    const result = await controller.listVisitors('my-screen', {});
    expect(result).toBeDefined();
  });

  it('GET /zoho-salesiq/:screenName/visitors/:visitorId → getVisitor()', async () => {
    const result = await controller.getVisitor('my-screen', '000000000000001');
    expect(result).toBeDefined();
  });

  it('GET /zoho-salesiq/:screenName/visitors/search → searchVisitors()', async () => {
    const result = await controller.searchVisitors('my-screen', { name: 'Test' });
    expect(result).toBeDefined();
  });

  // --- Chats ---
  it('GET /zoho-salesiq/:screenName/chats → listChats()', async () => {
    const result = await controller.listChats('my-screen', {});
    expect(result).toBeDefined();
  });

  it('GET /zoho-salesiq/:screenName/chats/:chatId → getChat()', async () => {
    const result = await controller.getChat('my-screen', '000000000000001');
    expect(result).toBeDefined();
  });

  it('GET /zoho-salesiq/:screenName/chats/:chatId/messages → listChatMessages()', async () => {
    const result = await controller.listChatMessages('my-screen', '000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-salesiq/:screenName/chats/:chatId/messages → sendChatMessage()', async () => {
    const result = await controller.sendChatMessage('my-screen', '000000000000001', 'Hello from test');
    expect(result).toBeDefined();
  });

  it('POST /zoho-salesiq/:screenName/chats/:chatId/rating → setRating()', async () => {
    const result = await controller.setRating('my-screen', '000000000000001', 5);
    expect(result).toBeDefined();
  });

  // --- Operators ---
  it('GET /zoho-salesiq/:screenName/operators → listOperators()', async () => {
    const result = await controller.listOperators('my-screen');
    expect(result).toBeDefined();
  });

  it('GET /zoho-salesiq/:screenName/operators/:operatorId → getOperator()', async () => {
    const result = await controller.getOperator('my-screen', '000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-salesiq/:screenName/operators/:operatorId/availability → setOperatorAvailability()', async () => {
    const result = await controller.setOperatorAvailability('my-screen', '000000000000001', 'available');
    expect(result).toBeDefined();
  });

  // --- Departments ---
  it('GET /zoho-salesiq/:screenName/departments → listDepartments()', async () => {
    const result = await controller.listDepartments('my-screen');
    expect(result).toBeDefined();
  });

  it('GET /zoho-salesiq/:screenName/departments/:id → getDepartment()', async () => {
    const result = await controller.getDepartment('my-screen', '000000000000001');
    expect(result).toBeDefined();
  });

  // --- Bots ---
  it('GET /zoho-salesiq/:screenName/bots → listBots()', async () => {
    const result = await controller.listBots('my-screen');
    expect(result).toBeDefined();
  });

  it('POST /zoho-salesiq/:screenName/bots/:botId/messages → sendBotMessage()', async () => {
    const result = await controller.sendBotMessage('my-screen', '000000000000001', { message: 'Hello bot' });
    expect(result).toBeDefined();
  });

  // --- Feedback ---
  it('GET /zoho-salesiq/:screenName/feedback-forms → listFeedbackForms()', async () => {
    const result = await controller.listFeedbackForms('my-screen');
    expect(result).toBeDefined();
  });
});
