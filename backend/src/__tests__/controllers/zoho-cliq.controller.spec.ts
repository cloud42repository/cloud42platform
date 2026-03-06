import { Test, TestingModule } from '@nestjs/testing';
import { ZohoCliqController } from '../../zoho-cliq/zoho-cliq.controller';
import { ZohoCliqService } from '../../zoho-cliq/zoho-cliq.service';

const mockService: Partial<ZohoCliqService> = {};

describe('ZohoCliqController', () => {
  let controller: ZohoCliqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoCliqController],
      providers: [{ provide: ZohoCliqService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoCliqController>(ZohoCliqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
