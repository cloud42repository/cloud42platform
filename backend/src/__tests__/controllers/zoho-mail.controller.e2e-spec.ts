import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoMailController } from '../../zoho-mail/zoho-mail.controller';

describe('ZohoMailController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoMailController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoMailController>(ZohoMailController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Accounts ---
  it('GET /zoho-mail/accounts → listAccounts()', async () => {
    const result = await controller.listAccounts();
    expect(result).toBeDefined();
  });

  it('GET /zoho-mail/accounts/:accountId → getAccount()', async () => {
    const result = await controller.getAccount('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Folders ---
  it('GET /zoho-mail/accounts/:accountId/folders → listFolders()', async () => {
    const result = await controller.listFolders('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Messages ---
  it('GET /zoho-mail/accounts/:accountId/folders/:folderId/messages → listMessages()', async () => {
    const result = await controller.listMessages('000000000000001', '000000000000002', {});
    expect(result).toBeDefined();
  });

  it('GET /zoho-mail/accounts/:accountId/messages/search → searchMessages()', async () => {
    const result = await controller.searchMessages('000000000000001', 'test query', {});
    expect(result).toBeDefined();
  });

  it('GET /zoho-mail/accounts/:accountId/messages/:messageId → getMessage()', async () => {
    const result = await controller.getMessage('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });

  it('POST /zoho-mail/accounts/:accountId/messages → sendMessage()', async () => {
    const result = await controller.sendMessage('000000000000001', { toAddress: 'test@test.com', subject: 'Test', content: 'Hello' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-mail/accounts/:accountId/messages/:messageId → deleteMessage()', async () => {
    const result = await controller.deleteMessage('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });

  it('POST /zoho-mail/accounts/:accountId/messages/:messageId/move → moveMessage()', async () => {
    const result = await controller.moveMessage('000000000000001', '000000000000002', { targetFolderId: '000000000000003' });
    expect(result).toBeDefined();
  });

  it('POST /zoho-mail/accounts/:accountId/messages/:messageId/read → markRead()', async () => {
    const result = await controller.markRead('000000000000001', '000000000000002', { isRead: true });
    expect(result).toBeDefined();
  });

  // --- Contacts ---
  it('GET /zoho-mail/accounts/:accountId/contacts → listContacts()', async () => {
    const result = await controller.listContacts('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-mail/accounts/:accountId/contacts → createContact()', async () => {
    const result = await controller.createContact('000000000000001', { firstName: 'Test', email: 'test@test.com' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-mail/accounts/:accountId/contacts/:contactId → deleteContact()', async () => {
    const result = await controller.deleteContact('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });
});
