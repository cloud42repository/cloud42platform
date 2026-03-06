import { Test, TestingModule } from '@nestjs/testing';
import { ZohoMailController } from '../../zoho-mail/zoho-mail.controller';
import { ZohoMailService } from '../../zoho-mail/zoho-mail.service';

const mockService: Partial<ZohoMailService> = {};

describe('ZohoMailController', () => {
  let controller: ZohoMailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoMailController],
      providers: [{ provide: ZohoMailService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoMailController>(ZohoMailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
