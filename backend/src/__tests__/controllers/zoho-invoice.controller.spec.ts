import { Test, TestingModule } from '@nestjs/testing';
import { ZohoInvoiceController } from '../../zoho-invoice/zoho-invoice.controller';
import { ZohoInvoiceService } from '../../zoho-invoice/zoho-invoice.service';

const mockService: Partial<ZohoInvoiceService> = {};

describe('ZohoInvoiceController', () => {
  let controller: ZohoInvoiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoInvoiceController],
      providers: [{ provide: ZohoInvoiceService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoInvoiceController>(ZohoInvoiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
