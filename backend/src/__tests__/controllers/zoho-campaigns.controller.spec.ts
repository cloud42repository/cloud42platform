import { Test, TestingModule } from '@nestjs/testing';
import { ZohoCampaignsController } from '../../zoho-campaigns/zoho-campaigns.controller';
import { ZohoCampaignsService } from '../../zoho-campaigns/zoho-campaigns.service';

const mockService: Partial<ZohoCampaignsService> = {};

describe('ZohoCampaignsController', () => {
  let controller: ZohoCampaignsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoCampaignsController],
      providers: [{ provide: ZohoCampaignsService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoCampaignsController>(ZohoCampaignsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
