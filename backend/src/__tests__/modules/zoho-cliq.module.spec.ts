import 'reflect-metadata';
import { ZohoCliqModule } from '../../zoho-cliq/zoho-cliq.module';
import { ZohoCliqService } from '../../zoho-cliq/zoho-cliq.service';
import { ZohoCliqController } from '../../zoho-cliq/zoho-cliq.controller';

describe('ZohoCliqModule', () => {
  it('should be defined', () => {
    expect(ZohoCliqModule).toBeDefined();
  });

  it('should register ZohoCliqController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoCliqModule);
    expect(controllers).toContain(ZohoCliqController);
  });

  it('should register ZohoCliqService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoCliqModule);
    expect(providers).toContain(ZohoCliqService);
  });

  it('should export ZohoCliqService', () => {
    const exports = Reflect.getMetadata('exports', ZohoCliqModule);
    expect(exports).toContain(ZohoCliqService);
  });
});
