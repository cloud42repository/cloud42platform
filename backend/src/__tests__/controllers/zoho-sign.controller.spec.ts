import { Test, TestingModule } from '@nestjs/testing';
import { ZohoSignController } from '../../zoho-sign/zoho-sign.controller';
import { ZohoSignService } from '../../zoho-sign/zoho-sign.service';

const mockService: Partial<ZohoSignService> = {};

describe('ZohoSignController', () => {
  let controller: ZohoSignController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoSignController],
      providers: [{ provide: ZohoSignService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoSignController>(ZohoSignController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
