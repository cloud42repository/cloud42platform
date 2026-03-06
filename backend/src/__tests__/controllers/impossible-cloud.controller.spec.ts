import { Test, TestingModule } from '@nestjs/testing';
import { ImpossibleCloudController } from '../../impossible-cloud/impossible-cloud.controller';
import { ImpossibleCloudService } from '../../impossible-cloud/impossible-cloud.service';

const mockService: Partial<ImpossibleCloudService> = {};

describe('ImpossibleCloudController', () => {
  let controller: ImpossibleCloudController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImpossibleCloudController],
      providers: [{ provide: ImpossibleCloudService, useValue: mockService }],
    }).compile();

    controller = module.get<ImpossibleCloudController>(ImpossibleCloudController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
