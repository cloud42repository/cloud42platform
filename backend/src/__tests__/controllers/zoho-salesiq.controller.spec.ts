import { Test, TestingModule } from '@nestjs/testing';
import { ZohoSalesIQController } from '../../zoho-salesiq/zoho-salesiq.controller';
import { ZohoSalesIQService } from '../../zoho-salesiq/zoho-salesiq.service';

const mockService: Partial<ZohoSalesIQService> = {};

describe('ZohoSalesIQController', () => {
  let controller: ZohoSalesIQController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoSalesIQController],
      providers: [{ provide: ZohoSalesIQService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoSalesIQController>(ZohoSalesIQController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
