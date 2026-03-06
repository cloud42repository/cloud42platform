import { Test, TestingModule } from '@nestjs/testing';
import { ZohoCommerceController } from '../../zoho-commerce/zoho-commerce.controller';
import { ZohoCommerceService } from '../../zoho-commerce/zoho-commerce.service';

const mockService: Partial<ZohoCommerceService> = {};

describe('ZohoCommerceController', () => {
  let controller: ZohoCommerceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoCommerceController],
      providers: [{ provide: ZohoCommerceService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoCommerceController>(ZohoCommerceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
