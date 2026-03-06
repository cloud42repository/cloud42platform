import 'reflect-metadata';
import { ZohoInvoiceModule } from '../../zoho-invoice/zoho-invoice.module';
import { ZohoInvoiceService } from '../../zoho-invoice/zoho-invoice.service';
import { ZohoInvoiceController } from '../../zoho-invoice/zoho-invoice.controller';

describe('ZohoInvoiceModule', () => {
  it('should be defined', () => {
    expect(ZohoInvoiceModule).toBeDefined();
  });

  it('should register ZohoInvoiceController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoInvoiceModule);
    expect(controllers).toContain(ZohoInvoiceController);
  });

  it('should register ZohoInvoiceService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoInvoiceModule);
    expect(providers).toContain(ZohoInvoiceService);
  });

  it('should export ZohoInvoiceService', () => {
    const exports = Reflect.getMetadata('exports', ZohoInvoiceModule);
    expect(exports).toContain(ZohoInvoiceService);
  });
});
