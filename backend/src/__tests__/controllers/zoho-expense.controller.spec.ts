import { Test, TestingModule } from '@nestjs/testing';
import { ZohoExpenseController } from '../../zoho-expense/zoho-expense.controller';
import { ZohoExpenseService } from '../../zoho-expense/zoho-expense.service';

const mockService: Partial<ZohoExpenseService> = {};

describe('ZohoExpenseController', () => {
  let controller: ZohoExpenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoExpenseController],
      providers: [{ provide: ZohoExpenseService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoExpenseController>(ZohoExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
