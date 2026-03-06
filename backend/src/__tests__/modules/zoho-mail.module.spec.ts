import 'reflect-metadata';
import { ZohoMailModule } from '../../zoho-mail/zoho-mail.module';
import { ZohoMailService } from '../../zoho-mail/zoho-mail.service';
import { ZohoMailController } from '../../zoho-mail/zoho-mail.controller';

describe('ZohoMailModule', () => {
  it('should be defined', () => {
    expect(ZohoMailModule).toBeDefined();
  });

  it('should register ZohoMailController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoMailModule);
    expect(controllers).toContain(ZohoMailController);
  });

  it('should register ZohoMailService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoMailModule);
    expect(providers).toContain(ZohoMailService);
  });

  it('should export ZohoMailService', () => {
    const exports = Reflect.getMetadata('exports', ZohoMailModule);
    expect(exports).toContain(ZohoMailService);
  });
});
