import { Test, TestingModule } from '@nestjs/testing';
import { SoftvalueController } from '../../softvalue/softvalue.controller';
import { SoftvalueService } from '../../softvalue/softvalue.service';

const mockService: Partial<SoftvalueService> = {};

describe('SoftvalueController', () => {
  let controller: SoftvalueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoftvalueController],
      providers: [{ provide: SoftvalueService, useValue: mockService }],
    }).compile();

    controller = module.get<SoftvalueController>(SoftvalueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
