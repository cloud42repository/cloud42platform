import { Test, TestingModule } from '@nestjs/testing';
import { ZohoAnalyticsController } from '../../zoho-analytics/zoho-analytics.controller';
import { ZohoAnalyticsService } from '../../zoho-analytics/zoho-analytics.service';

const mockService: Partial<ZohoAnalyticsService> = {};

describe('ZohoAnalyticsController', () => {
  let controller: ZohoAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoAnalyticsController],
      providers: [{ provide: ZohoAnalyticsService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoAnalyticsController>(ZohoAnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
