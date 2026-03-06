import { Test, TestingModule } from '@nestjs/testing';
import { ZohoInventoryController } from '../../zoho-inventory/zoho-inventory.controller';
import { ZohoInventoryService } from '../../zoho-inventory/zoho-inventory.service';

const mockService: Partial<ZohoInventoryService> = {};

describe('ZohoInventoryController', () => {
  let controller: ZohoInventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoInventoryController],
      providers: [{ provide: ZohoInventoryService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoInventoryController>(ZohoInventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
