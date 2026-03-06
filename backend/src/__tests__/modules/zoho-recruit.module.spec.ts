import 'reflect-metadata';
import { ZohoRecruitModule } from '../../zoho-recruit/zoho-recruit.module';
import { ZohoRecruitService } from '../../zoho-recruit/zoho-recruit.service';
import { ZohoRecruitController } from '../../zoho-recruit/zoho-recruit.controller';

describe('ZohoRecruitModule', () => {
  it('should be defined', () => {
    expect(ZohoRecruitModule).toBeDefined();
  });

  it('should register ZohoRecruitController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoRecruitModule);
    expect(controllers).toContain(ZohoRecruitController);
  });

  it('should register ZohoRecruitService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoRecruitModule);
    expect(providers).toContain(ZohoRecruitService);
  });

  it('should export ZohoRecruitService', () => {
    const exports = Reflect.getMetadata('exports', ZohoRecruitModule);
    expect(exports).toContain(ZohoRecruitService);
  });
});
