import 'reflect-metadata';
import { ZohoWorkdriveModule } from '../../zoho-workdrive/zoho-workdrive.module';
import { ZohoWorkdriveService } from '../../zoho-workdrive/zoho-workdrive.service';
import { ZohoWorkdriveController } from '../../zoho-workdrive/zoho-workdrive.controller';

describe('ZohoWorkdriveModule', () => {
  it('should be defined', () => {
    expect(ZohoWorkdriveModule).toBeDefined();
  });

  it('should register ZohoWorkdriveController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoWorkdriveModule);
    expect(controllers).toContain(ZohoWorkdriveController);
  });

  it('should register ZohoWorkdriveService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoWorkdriveModule);
    expect(providers).toContain(ZohoWorkdriveService);
  });

  it('should export ZohoWorkdriveService', () => {
    const exports = Reflect.getMetadata('exports', ZohoWorkdriveModule);
    expect(exports).toContain(ZohoWorkdriveService);
  });
});
