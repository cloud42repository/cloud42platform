import 'reflect-metadata';
import { ZohoProjectsModule } from '../../zoho-projects/zoho-projects.module';
import { ZohoProjectsService } from '../../zoho-projects/zoho-projects.service';
import { ZohoProjectsController } from '../../zoho-projects/zoho-projects.controller';

describe('ZohoProjectsModule', () => {
  it('should be defined', () => {
    expect(ZohoProjectsModule).toBeDefined();
  });

  it('should register ZohoProjectsController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoProjectsModule);
    expect(controllers).toContain(ZohoProjectsController);
  });

  it('should register ZohoProjectsService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoProjectsModule);
    expect(providers).toContain(ZohoProjectsService);
  });

  it('should export ZohoProjectsService', () => {
    const exports = Reflect.getMetadata('exports', ZohoProjectsModule);
    expect(exports).toContain(ZohoProjectsService);
  });
});
