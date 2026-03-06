import 'reflect-metadata';
import { ZohoCrmModule } from '../../zoho-crm/zoho-crm.module';
import { ZohoCrmService } from '../../zoho-crm/zoho-crm.service';
import { ZohoCrmController } from '../../zoho-crm/zoho-crm.controller';

describe('ZohoCrmModule', () => {
  it('should be defined', () => {
    expect(ZohoCrmModule).toBeDefined();
  });

  it('should register ZohoCrmController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoCrmModule);
    expect(controllers).toContain(ZohoCrmController);
  });

  it('should register ZohoCrmService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoCrmModule);
    expect(providers).toContain(ZohoCrmService);
  });

  it('should export ZohoCrmService', () => {
    const exports = Reflect.getMetadata('exports', ZohoCrmModule);
    expect(exports).toContain(ZohoCrmService);
  });
});
