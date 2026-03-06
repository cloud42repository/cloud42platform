import { Test, TestingModule } from '@nestjs/testing';
import { ZohoRecruitController } from '../../zoho-recruit/zoho-recruit.controller';
import { ZohoRecruitService } from '../../zoho-recruit/zoho-recruit.service';

const mockService: Partial<ZohoRecruitService> = {};

describe('ZohoRecruitController', () => {
  let controller: ZohoRecruitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoRecruitController],
      providers: [{ provide: ZohoRecruitService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoRecruitController>(ZohoRecruitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
