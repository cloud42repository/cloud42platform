import 'reflect-metadata';
import { ZohoCreatorModule } from '../../zoho-creator/zoho-creator.module';
import { ZohoCreatorService } from '../../zoho-creator/zoho-creator.service';
import { ZohoCreatorController } from '../../zoho-creator/zoho-creator.controller';

describe('ZohoCreatorModule', () => {
  it('should be defined', () => {
    expect(ZohoCreatorModule).toBeDefined();
  });

  it('should register ZohoCreatorController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoCreatorModule);
    expect(controllers).toContain(ZohoCreatorController);
  });

  it('should register ZohoCreatorService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoCreatorModule);
    expect(providers).toContain(ZohoCreatorService);
  });

  it('should export ZohoCreatorService', () => {
    const exports = Reflect.getMetadata('exports', ZohoCreatorModule);
    expect(exports).toContain(ZohoCreatorService);
  });
});
