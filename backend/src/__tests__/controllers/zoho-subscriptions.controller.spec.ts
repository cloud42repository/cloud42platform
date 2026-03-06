import { Test, TestingModule } from '@nestjs/testing';
import { ZohoSubscriptionsController } from '../../zoho-subscriptions/zoho-subscriptions.controller';
import { ZohoSubscriptionsService } from '../../zoho-subscriptions/zoho-subscriptions.service';

const mockService: Partial<ZohoSubscriptionsService> = {};

describe('ZohoSubscriptionsController', () => {
  let controller: ZohoSubscriptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoSubscriptionsController],
      providers: [{ provide: ZohoSubscriptionsService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoSubscriptionsController>(ZohoSubscriptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
