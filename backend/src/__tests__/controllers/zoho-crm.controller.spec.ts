import { Test, TestingModule } from '@nestjs/testing';
import { ZohoCrmController } from '../../zoho-crm/zoho-crm.controller';
import { ZohoCrmService } from '../../zoho-crm/zoho-crm.service';

const mockService: Partial<ZohoCrmService> = {};

describe('ZohoCrmController', () => {
  let controller: ZohoCrmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoCrmController],
      providers: [{ provide: ZohoCrmService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoCrmController>(ZohoCrmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
