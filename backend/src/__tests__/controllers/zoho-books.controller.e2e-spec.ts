import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoBooksController } from '../../zoho-books/zoho-books.controller';

describe('ZohoBooksController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoBooksController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoBooksController>(ZohoBooksController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Contacts ---
  it('GET /zoho-books/contacts → listContacts()', async () => {
    const result = await controller.listContacts({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-books/contacts/:id → getContact()', async () => {
    const result = await controller.getContact('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-books/contacts → createContact()', async () => {
    const result = await controller.createContact({ contact_name: 'Test Contact' });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-books/contacts/:id → updateContact()', async () => {
    const result = await controller.updateContact('000000000000001', { contact_name: 'Updated' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-books/contacts/:id → deleteContact()', async () => {
    const result = await controller.deleteContact('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Invoices ---
  it('GET /zoho-books/invoices → listInvoices()', async () => {
    const result = await controller.listInvoices({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-books/invoices/:id → getInvoice()', async () => {
    const result = await controller.getInvoice('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-books/invoices → createInvoice()', async () => {
    const result = await controller.createInvoice({ customer_id: '1', line_items: [{ item_id: '1', quantity: 1 }] });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-books/invoices/:id → updateInvoice()', async () => {
    const result = await controller.updateInvoice('000000000000001', { customer_id: '1' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-books/invoices/:id → deleteInvoice()', async () => {
    const result = await controller.deleteInvoice('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-books/invoices/:id/send → sendInvoice()', async () => {
    const result = await controller.sendInvoice('000000000000001', { to_mail_ids: ['test@test.com'] });
    expect(result).toBeDefined();
  });

  it('POST /zoho-books/invoices/:id/sent → markInvoiceAsSent()', async () => {
    const result = await controller.markInvoiceAsSent('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-books/invoices/:id/void → voidInvoice()', async () => {
    const result = await controller.voidInvoice('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Bills ---
  it('GET /zoho-books/bills → listBills()', async () => {
    const result = await controller.listBills({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-books/bills/:id → getBill()', async () => {
    const result = await controller.getBill('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-books/bills → createBill()', async () => {
    const result = await controller.createBill({ vendor_id: '1', line_items: [{ account_id: '1', amount: 100 }] });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-books/bills/:id → updateBill()', async () => {
    const result = await controller.updateBill('000000000000001', { vendor_id: '1' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-books/bills/:id → deleteBill()', async () => {
    const result = await controller.deleteBill('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Expenses ---
  it('GET /zoho-books/expenses → listExpenses()', async () => {
    const result = await controller.listExpenses({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-books/expenses/:id → getExpense()', async () => {
    const result = await controller.getExpense('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-books/expenses → createExpense()', async () => {
    const result = await controller.createExpense({ account_id: '1', amount: 50 });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-books/expenses/:id → updateExpense()', async () => {
    const result = await controller.updateExpense('000000000000001', { amount: 75 });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-books/expenses/:id → deleteExpense()', async () => {
    const result = await controller.deleteExpense('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Payments ---
  it('GET /zoho-books/payments → listPayments()', async () => {
    const result = await controller.listPayments({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-books/payments/:id → getPayment()', async () => {
    const result = await controller.getPayment('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-books/payments → createPayment()', async () => {
    const result = await controller.createPayment({ customer_id: '1', amount: 100 });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-books/payments/:id → deletePayment()', async () => {
    const result = await controller.deletePayment('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Items ---
  it('GET /zoho-books/items → listItems()', async () => {
    const result = await controller.listItems({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-books/items/:id → getItem()', async () => {
    const result = await controller.getItem('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-books/items → createItem()', async () => {
    const result = await controller.createItem({ name: 'Test Item', rate: 10 });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-books/items/:id → updateItem()', async () => {
    const result = await controller.updateItem('000000000000001', { name: 'Updated Item' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-books/items/:id → deleteItem()', async () => {
    const result = await controller.deleteItem('000000000000001');
    expect(result).toBeDefined();
  });
});
