import { Test, TestingModule } from '@nestjs/testing';
import { ZohoCreatorController } from '../../zoho-creator/zoho-creator.controller';
import { ZohoCreatorService } from '../../zoho-creator/zoho-creator.service';

const mockService: Partial<ZohoCreatorService> = {};

describe('ZohoCreatorController', () => {
  let controller: ZohoCreatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoCreatorController],
      providers: [{ provide: ZohoCreatorService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoCreatorController>(ZohoCreatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
