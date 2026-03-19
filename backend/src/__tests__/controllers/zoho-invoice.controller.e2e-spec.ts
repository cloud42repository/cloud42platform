import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoInvoiceController } from '../../zoho-invoice/zoho-invoice.controller';

describe('ZohoInvoiceController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoInvoiceController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoInvoiceController>(ZohoInvoiceController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Customers ---
  it('GET /zoho-invoice/customers → listCustomers()', async () => {
    const result = await controller.listCustomers({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-invoice/customers/:id → getCustomer()', async () => {
    const result = await controller.getCustomer('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-invoice/customers → createCustomer()', async () => {
    const result = await controller.createCustomer({ customer_name: 'Test Customer' });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-invoice/customers/:id → updateCustomer()', async () => {
    const result = await controller.updateCustomer('000000000000001', { customer_name: 'Updated' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-invoice/customers/:id → deleteCustomer()', async () => {
    const result = await controller.deleteCustomer('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Invoices ---
  it('GET /zoho-invoice/invoices → listInvoices()', async () => {
    const result = await controller.listInvoices({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-invoice/invoices/:id → getInvoice()', async () => {
    const result = await controller.getInvoice('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-invoice/invoices → createInvoice()', async () => {
    const result = await controller.createInvoice({ customer_id: '1', line_items: [{ item_id: '1', quantity: 1 }] });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-invoice/invoices/:id → updateInvoice()', async () => {
    const result = await controller.updateInvoice('000000000000001', { customer_id: '1' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-invoice/invoices/:id → deleteInvoice()', async () => {
    const result = await controller.deleteInvoice('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-invoice/invoices/:id/send → sendInvoice()', async () => {
    const result = await controller.sendInvoice('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Estimates ---
  it('GET /zoho-invoice/estimates → listEstimates()', async () => {
    const result = await controller.listEstimates({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-invoice/estimates/:id → getEstimate()', async () => {
    const result = await controller.getEstimate('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-invoice/estimates → createEstimate()', async () => {
    const result = await controller.createEstimate({ customer_id: '1', line_items: [{ item_id: '1', quantity: 1 }] });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-invoice/estimates/:id → updateEstimate()', async () => {
    const result = await controller.updateEstimate('000000000000001', { customer_id: '1' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-invoice/estimates/:id → deleteEstimate()', async () => {
    const result = await controller.deleteEstimate('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Recurring Invoices ---
  it('GET /zoho-invoice/recurring-invoices → listRecurringInvoices()', async () => {
    const result = await controller.listRecurringInvoices({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-invoice/recurring-invoices/:id → getRecurringInvoice()', async () => {
    const result = await controller.getRecurringInvoice('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-invoice/recurring-invoices → createRecurringInvoice()', async () => {
    const result = await controller.createRecurringInvoice({ customer_id: '1', recurrence_name: 'Monthly' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-invoice/recurring-invoices/:id → deleteRecurringInvoice()', async () => {
    const result = await controller.deleteRecurringInvoice('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Payments ---
  it('GET /zoho-invoice/payments → listPayments()', async () => {
    const result = await controller.listPayments({});
    expect(result).toBeDefined();
  });

  it('POST /zoho-invoice/payments → createPayment()', async () => {
    const result = await controller.createPayment({ customer_id: '1', amount: 100 });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-invoice/payments/:id → deletePayment()', async () => {
    const result = await controller.deletePayment('000000000000001');
    expect(result).toBeDefined();
  });
});
