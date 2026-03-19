import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoSubscriptionsController } from '../../zoho-subscriptions/zoho-subscriptions.controller';

describe('ZohoSubscriptionsController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoSubscriptionsController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoSubscriptionsController>(ZohoSubscriptionsController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Plans ---
  it('GET /zoho-subscriptions/plans → listPlans()', async () => {
    const result = await controller.listPlans({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-subscriptions/plans/:code → getPlan()', async () => {
    const result = await controller.getPlan('plan-code-1');
    expect(result).toBeDefined();
  });

  it('POST /zoho-subscriptions/plans → createPlan()', async () => {
    const result = await controller.createPlan({ plan_code: 'test-plan', name: 'Test Plan', recurring_price: 9.99, interval: 1, interval_unit: 'months' });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-subscriptions/plans/:code → updatePlan()', async () => {
    const result = await controller.updatePlan('plan-code-1', { name: 'Updated Plan' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-subscriptions/plans/:code → deletePlan()', async () => {
    const result = await controller.deletePlan('plan-code-1');
    expect(result).toBeDefined();
  });

  // --- Addons ---
  it('GET /zoho-subscriptions/addons → listAddons()', async () => {
    const result = await controller.listAddons();
    expect(result).toBeDefined();
  });

  it('GET /zoho-subscriptions/addons/:code → getAddon()', async () => {
    const result = await controller.getAddon('addon-code-1');
    expect(result).toBeDefined();
  });

  // --- Coupons ---
  it('GET /zoho-subscriptions/coupons → listCoupons()', async () => {
    const result = await controller.listCoupons();
    expect(result).toBeDefined();
  });

  it('GET /zoho-subscriptions/coupons/:code → getCoupon()', async () => {
    const result = await controller.getCoupon('coupon-code-1');
    expect(result).toBeDefined();
  });

  // --- Customers ---
  it('GET /zoho-subscriptions/customers → listCustomers()', async () => {
    const result = await controller.listCustomers({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-subscriptions/customers/:id → getCustomer()', async () => {
    const result = await controller.getCustomer('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-subscriptions/customers → createCustomer()', async () => {
    const result = await controller.createCustomer({ display_name: 'Test Customer', email: 'test@test.com' });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-subscriptions/customers/:id → updateCustomer()', async () => {
    const result = await controller.updateCustomer('000000000000001', { display_name: 'Updated' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-subscriptions/customers/:id → deleteCustomer()', async () => {
    const result = await controller.deleteCustomer('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Subscriptions ---
  it('GET /zoho-subscriptions/subscriptions → listSubscriptions()', async () => {
    const result = await controller.listSubscriptions({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-subscriptions/subscriptions/:id → getSubscription()', async () => {
    const result = await controller.getSubscription('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-subscriptions/subscriptions → createSubscription()', async () => {
    const result = await controller.createSubscription({ customer_id: '1', plan: { plan_code: 'test-plan' } });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-subscriptions/subscriptions/:id → updateSubscription()', async () => {
    const result = await controller.updateSubscription('000000000000001', { plan: { plan_code: 'updated-plan' } });
    expect(result).toBeDefined();
  });

  it('POST /zoho-subscriptions/subscriptions/:id/cancel → cancelSubscription()', async () => {
    const result = await controller.cancelSubscription('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-subscriptions/subscriptions/:id/reactivate → reactivateSubscription()', async () => {
    const result = await controller.reactivateSubscription('000000000000001');
    expect(result).toBeDefined();
  });
});
