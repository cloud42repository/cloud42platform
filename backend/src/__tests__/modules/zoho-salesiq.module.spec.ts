import 'reflect-metadata';
import { ZohoSalesiqModule } from '../../zoho-salesiq/zoho-salesiq.module';
import { ZohoSalesIQService } from '../../zoho-salesiq/zoho-salesiq.service';
import { ZohoSalesIQController } from '../../zoho-salesiq/zoho-salesiq.controller';

describe('ZohoSalesiqModule', () => {
  it('should be defined', () => {
    expect(ZohoSalesiqModule).toBeDefined();
  });

  it('should register ZohoSalesIQController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoSalesiqModule);
    expect(controllers).toContain(ZohoSalesIQController);
  });

  it('should register ZohoSalesIQService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoSalesiqModule);
    expect(providers).toContain(ZohoSalesIQService);
  });

  it('should export ZohoSalesIQService', () => {
    const exports = Reflect.getMetadata('exports', ZohoSalesiqModule);
    expect(exports).toContain(ZohoSalesIQService);
  });
});
