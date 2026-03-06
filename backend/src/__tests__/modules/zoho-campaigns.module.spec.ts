import 'reflect-metadata';
import { ZohoCampaignsModule } from '../../zoho-campaigns/zoho-campaigns.module';
import { ZohoCampaignsService } from '../../zoho-campaigns/zoho-campaigns.service';
import { ZohoCampaignsController } from '../../zoho-campaigns/zoho-campaigns.controller';

describe('ZohoCampaignsModule', () => {
  it('should be defined', () => {
    expect(ZohoCampaignsModule).toBeDefined();
  });

  it('should register ZohoCampaignsController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoCampaignsModule);
    expect(controllers).toContain(ZohoCampaignsController);
  });

  it('should register ZohoCampaignsService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoCampaignsModule);
    expect(providers).toContain(ZohoCampaignsService);
  });

  it('should export ZohoCampaignsService', () => {
    const exports = Reflect.getMetadata('exports', ZohoCampaignsModule);
    expect(exports).toContain(ZohoCampaignsService);
  });
});
