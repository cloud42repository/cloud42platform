import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoDeskController } from '../../zoho-desk/zoho-desk.controller';

describe('ZohoDeskController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoDeskController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoDeskController>(ZohoDeskController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Tickets ---
  it('GET /zoho-desk/tickets → listTickets()', async () => {
    const result = await controller.listTickets({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-desk/tickets/search → searchTickets()', async () => {
    const result = await controller.searchTickets({ subject: 'Test' });
    expect(result).toBeDefined();
  });

  it('GET /zoho-desk/tickets/:id → getTicket()', async () => {
    const result = await controller.getTicket('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-desk/tickets → createTicket()', async () => {
    const result = await controller.createTicket({ subject: 'Test Ticket', departmentId: '1', contactId: '1' });
    expect(result).toBeDefined();
  });

  it('PATCH /zoho-desk/tickets/:id → updateTicket()', async () => {
    const result = await controller.updateTicket('000000000000001', { subject: 'Updated' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-desk/tickets/:id → deleteTicket()', async () => {
    const result = await controller.deleteTicket('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Comments ---
  it('GET /zoho-desk/tickets/:ticketId/comments → listComments()', async () => {
    const result = await controller.listComments('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-desk/tickets/:ticketId/comments → addComment()', async () => {
    const result = await controller.addComment('000000000000001', { content: 'Test comment', isPublic: true });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-desk/tickets/:ticketId/comments/:commentId → deleteComment()', async () => {
    const result = await controller.deleteComment('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });

  // --- Contacts ---
  it('GET /zoho-desk/contacts → listContacts()', async () => {
    const result = await controller.listContacts({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-desk/contacts/:id → getContact()', async () => {
    const result = await controller.getContact('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-desk/contacts → createContact()', async () => {
    const result = await controller.createContact({ lastName: 'Test', email: 'test@test.com' });
    expect(result).toBeDefined();
  });

  it('PATCH /zoho-desk/contacts/:id → updateContact()', async () => {
    const result = await controller.updateContact('000000000000001', { lastName: 'Updated' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-desk/contacts/:id → deleteContact()', async () => {
    const result = await controller.deleteContact('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Agents ---
  it('GET /zoho-desk/agents → listAgents()', async () => {
    const result = await controller.listAgents({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-desk/agents/:id → getAgent()', async () => {
    const result = await controller.getAgent('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Departments ---
  it('GET /zoho-desk/departments → listDepartments()', async () => {
    const result = await controller.listDepartments();
    expect(result).toBeDefined();
  });

  it('GET /zoho-desk/departments/:id → getDepartment()', async () => {
    const result = await controller.getDepartment('000000000000001');
    expect(result).toBeDefined();
  });
});
