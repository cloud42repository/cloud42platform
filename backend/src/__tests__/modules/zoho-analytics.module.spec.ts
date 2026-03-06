import 'reflect-metadata';
import { ZohoAnalyticsModule } from '../../zoho-analytics/zoho-analytics.module';
import { ZohoAnalyticsService } from '../../zoho-analytics/zoho-analytics.service';
import { ZohoAnalyticsController } from '../../zoho-analytics/zoho-analytics.controller';

describe('ZohoAnalyticsModule', () => {
  it('should be defined', () => {
    expect(ZohoAnalyticsModule).toBeDefined();
  });

  it('should register ZohoAnalyticsController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoAnalyticsModule);
    expect(controllers).toContain(ZohoAnalyticsController);
  });

  it('should register ZohoAnalyticsService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoAnalyticsModule);
    expect(providers).toContain(ZohoAnalyticsService);
  });

  it('should export ZohoAnalyticsService', () => {
    const exports = Reflect.getMetadata('exports', ZohoAnalyticsModule);
    expect(exports).toContain(ZohoAnalyticsService);
  });
});
