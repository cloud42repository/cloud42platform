import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoCliqController } from '../../zoho-cliq/zoho-cliq.controller';

describe('ZohoCliqController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoCliqController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoCliqController>(ZohoCliqController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Channels ---
  it('GET /zoho-cliq/channels → listChannels()', async () => {
    const result = await controller.listChannels({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-cliq/channels/:name → getChannel()', async () => {
    const result = await controller.getChannel('general');
    expect(result).toBeDefined();
  });

  it('POST /zoho-cliq/channels → createChannel()', async () => {
    const result = await controller.createChannel({ name: 'test-channel', description: 'Test' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-cliq/channels/:name → deleteChannel()', async () => {
    const result = await controller.deleteChannel('test-channel');
    expect(result).toBeDefined();
  });

  it('POST /zoho-cliq/channels/:name/members → addChannelMember()', async () => {
    const result = await controller.addChannelMember('general', { emails: ['test@test.com'] });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-cliq/channels/:name/members → removeChannelMember()', async () => {
    const result = await controller.removeChannelMember('general', 'test@test.com');
    expect(result).toBeDefined();
  });

  // --- Channel Messages ---
  it('GET /zoho-cliq/channels/:name/messages → listChannelMessages()', async () => {
    const result = await controller.listChannelMessages('general');
    expect(result).toBeDefined();
  });

  it('POST /zoho-cliq/channels/:name/message → sendChannelMessage()', async () => {
    const result = await controller.sendChannelMessage('general', { text: 'Hello from test' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-cliq/channels/:name/messages/:messageId → deleteMessage()', async () => {
    const result = await controller.deleteMessage('general', '000000000000001');
    expect(result).toBeDefined();
  });

  // --- Direct Messages ---
  it('POST /zoho-cliq/direct/:email → sendDirectMessage()', async () => {
    const result = await controller.sendDirectMessage('test@test.com', { text: 'Hi' });
    expect(result).toBeDefined();
  });

  // --- User Groups ---
  it('GET /zoho-cliq/usergroups → listUserGroups()', async () => {
    const result = await controller.listUserGroups();
    expect(result).toBeDefined();
  });

  it('GET /zoho-cliq/usergroups/:name → getUserGroup()', async () => {
    const result = await controller.getUserGroup('test-group');
    expect(result).toBeDefined();
  });

  it('POST /zoho-cliq/usergroups → createUserGroup()', async () => {
    const result = await controller.createUserGroup({ name: 'test-group', description: 'Test' });
    expect(result).toBeDefined();
  });

  // --- Bots ---
  it('GET /zoho-cliq/bots → listBots()', async () => {
    const result = await controller.listBots();
    expect(result).toBeDefined();
  });

  it('POST /zoho-cliq/bots/:name/message → sendBotMessage()', async () => {
    const result = await controller.sendBotMessage('test-bot', { text: 'Bot message' });
    expect(result).toBeDefined();
  });
});
