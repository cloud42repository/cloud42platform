import 'reflect-metadata';
import { ZohoSubscriptionsModule } from '../../zoho-subscriptions/zoho-subscriptions.module';
import { ZohoSubscriptionsService } from '../../zoho-subscriptions/zoho-subscriptions.service';
import { ZohoSubscriptionsController } from '../../zoho-subscriptions/zoho-subscriptions.controller';

describe('ZohoSubscriptionsModule', () => {
  it('should be defined', () => {
    expect(ZohoSubscriptionsModule).toBeDefined();
  });

  it('should register ZohoSubscriptionsController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoSubscriptionsModule);
    expect(controllers).toContain(ZohoSubscriptionsController);
  });

  it('should register ZohoSubscriptionsService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoSubscriptionsModule);
    expect(providers).toContain(ZohoSubscriptionsService);
  });

  it('should export ZohoSubscriptionsService', () => {
    const exports = Reflect.getMetadata('exports', ZohoSubscriptionsModule);
    expect(exports).toContain(ZohoSubscriptionsService);
  });
});
