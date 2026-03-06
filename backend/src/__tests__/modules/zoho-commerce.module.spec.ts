import 'reflect-metadata';
import { ZohoCommerceModule } from '../../zoho-commerce/zoho-commerce.module';
import { ZohoCommerceService } from '../../zoho-commerce/zoho-commerce.service';
import { ZohoCommerceController } from '../../zoho-commerce/zoho-commerce.controller';

describe('ZohoCommerceModule', () => {
  it('should be defined', () => {
    expect(ZohoCommerceModule).toBeDefined();
  });

  it('should register ZohoCommerceController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoCommerceModule);
    expect(controllers).toContain(ZohoCommerceController);
  });

  it('should register ZohoCommerceService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoCommerceModule);
    expect(providers).toContain(ZohoCommerceService);
  });

  it('should export ZohoCommerceService', () => {
    const exports = Reflect.getMetadata('exports', ZohoCommerceModule);
    expect(exports).toContain(ZohoCommerceService);
  });
});
