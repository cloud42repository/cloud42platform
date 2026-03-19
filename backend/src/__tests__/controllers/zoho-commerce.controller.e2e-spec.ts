import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoCommerceController } from '../../zoho-commerce/zoho-commerce.controller';

describe('ZohoCommerceController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoCommerceController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoCommerceController>(ZohoCommerceController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Products ---
  it('GET /zoho-commerce/products → listProducts()', async () => {
    const result = await controller.listProducts({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-commerce/products/:id → getProduct()', async () => {
    const result = await controller.getProduct('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-commerce/products → createProduct()', async () => {
    const result = await controller.createProduct({ name: 'Test Product', price: 29.99 });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-commerce/products/:id → updateProduct()', async () => {
    const result = await controller.updateProduct('000000000000001', { name: 'Updated Product' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-commerce/products/:id → deleteProduct()', async () => {
    const result = await controller.deleteProduct('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Categories ---
  it('GET /zoho-commerce/categories → listCategories()', async () => {
    const result = await controller.listCategories();
    expect(result).toBeDefined();
  });

  it('GET /zoho-commerce/categories/:id → getCategory()', async () => {
    const result = await controller.getCategory('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-commerce/categories → createCategory()', async () => {
    const result = await controller.createCategory({ name: 'Test Category' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-commerce/categories/:id → deleteCategory()', async () => {
    const result = await controller.deleteCategory('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Customers ---
  it('GET /zoho-commerce/customers → listCustomers()', async () => {
    const result = await controller.listCustomers({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-commerce/customers/:id → getCustomer()', async () => {
    const result = await controller.getCustomer('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Orders ---
  it('GET /zoho-commerce/orders → listOrders()', async () => {
    const result = await controller.listOrders({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-commerce/orders/:id → getOrder()', async () => {
    const result = await controller.getOrder('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-commerce/orders → createOrder()', async () => {
    const result = await controller.createOrder({ customer_id: '1', line_items: [{ product_id: '1', quantity: 1 }] });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-commerce/orders/:id/status → updateOrderStatus()', async () => {
    const result = await controller.updateOrderStatus('000000000000001', { status: 'shipped' });
    expect(result).toBeDefined();
  });

  it('POST /zoho-commerce/orders/:id/cancel → cancelOrder()', async () => {
    const result = await controller.cancelOrder('000000000000001');
    expect(result).toBeDefined();
  });
});
