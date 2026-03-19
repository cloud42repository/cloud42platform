import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoCampaignsController } from '../../zoho-campaigns/zoho-campaigns.controller';

describe('ZohoCampaignsController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoCampaignsController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoCampaignsController>(ZohoCampaignsController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Mailing Lists ---
  it('GET /zoho-campaigns/lists → listMailingLists()', async () => {
    const result = await controller.listMailingLists({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-campaigns/lists/:listKey → getMailingList()', async () => {
    const result = await controller.getMailingList('list-key-1');
    expect(result).toBeDefined();
  });

  it('POST /zoho-campaigns/lists → createMailingList()', async () => {
    const result = await controller.createMailingList({ listname: 'Test List', signup_form: '1' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-campaigns/lists/:listKey → deleteMailingList()', async () => {
    const result = await controller.deleteMailingList('list-key-1');
    expect(result).toBeDefined();
  });

  // --- Subscribers ---
  it('GET /zoho-campaigns/lists/:listKey/subscribers → listSubscribers()', async () => {
    const result = await controller.listSubscribers('list-key-1', {});
    expect(result).toBeDefined();
  });

  it('POST /zoho-campaigns/lists/:listKey/subscribers → addSubscriber()', async () => {
    const result = await controller.addSubscriber('list-key-1', { contact_email: 'test@test.com' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-campaigns/lists/:listKey/subscribers → removeSubscriber()', async () => {
    const result = await controller.removeSubscriber('list-key-1', 'test@test.com');
    expect(result).toBeDefined();
  });

  // --- Topics ---
  it('GET /zoho-campaigns/topics → listTopics()', async () => {
    const result = await controller.listTopics();
    expect(result).toBeDefined();
  });

  // --- Campaigns ---
  it('GET /zoho-campaigns/campaigns → listCampaigns()', async () => {
    const result = await controller.listCampaigns({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-campaigns/campaigns/:campaignKey → getCampaign()', async () => {
    const result = await controller.getCampaign('campaign-key-1');
    expect(result).toBeDefined();
  });

  it('POST /zoho-campaigns/campaigns/:campaignKey/send → sendCampaign()', async () => {
    const result = await controller.sendCampaign('campaign-key-1');
    expect(result).toBeDefined();
  });

  it('POST /zoho-campaigns/campaigns/:campaignKey/schedule → scheduleCampaign()', async () => {
    const result = await controller.scheduleCampaign('campaign-key-1', { scheduleTime: '2026-12-01T10:00:00Z' });
    expect(result).toBeDefined();
  });
});
