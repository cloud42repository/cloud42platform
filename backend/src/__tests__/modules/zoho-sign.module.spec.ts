import 'reflect-metadata';
import { ZohoSignModule } from '../../zoho-sign/zoho-sign.module';
import { ZohoSignService } from '../../zoho-sign/zoho-sign.service';
import { ZohoSignController } from '../../zoho-sign/zoho-sign.controller';

describe('ZohoSignModule', () => {
  it('should be defined', () => {
    expect(ZohoSignModule).toBeDefined();
  });

  it('should register ZohoSignController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoSignModule);
    expect(controllers).toContain(ZohoSignController);
  });

  it('should register ZohoSignService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoSignModule);
    expect(providers).toContain(ZohoSignService);
  });

  it('should export ZohoSignService', () => {
    const exports = Reflect.getMetadata('exports', ZohoSignModule);
    expect(exports).toContain(ZohoSignService);
  });
});
