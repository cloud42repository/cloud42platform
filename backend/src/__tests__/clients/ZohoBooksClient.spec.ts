import MockAdapter from "axios-mock-adapter";
import { ZohoBooksClient } from "../../zoho-books/ZohoBooksClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const ORG_ID = "org-9001";

const makeClient = (region?: "com" | "eu" | "in") =>
  new ZohoBooksClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("books-token"),
    organizationId: ORG_ID,
    region,
  });

describe("ZohoBooksClient", () => {
  let client: ZohoBooksClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  // â”€â”€â”€ URL construction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("uses the correct default base URL (com region)", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("zohoapis.com/books/v3");
  });

  it("uses the EU base URL for region=eu", () => {
    expect(makeClient("eu").axiosInstance.defaults.baseURL ?? "").toContain("zohoapis.eu/books/v3");
  });

  it("appends organization_id as a default query param", async () => {
    mock.onGet("/invoices").reply((config) => [200, { code: 0, params: config.params }]);
    const res = await client.get<{ params: Record<string, string> }>("/invoices");
    expect(res.params.organization_id).toBe(ORG_ID);
  });

  // â”€â”€â”€ Auth header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("injects Zoho-oauthtoken header", async () => {
    mock.onGet("/contacts").reply((config) => [200, { code: 0, auth: config.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/contacts");
    expect(res.auth).toBe("Zoho-oauthtoken books-token");
  });

  // â”€â”€â”€ Contacts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listContacts() calls GET /contacts", async () => {
    mock.onGet("/contacts").reply(200, { code: 0, contacts: [{ contact_id: "C1", contact_name: "ACME" }] });
    const res = await client.listContacts();
    expect(res.contacts[0].contact_id).toBe("C1");
  });

  it("getContact() calls GET /contacts/:id", async () => {
    mock.onGet("/contacts/C1").reply(200, { code: 0, contact: { contact_id: "C1" } });
    const res = await client.getContact("C1");
    expect(res.contact.contact_id).toBe("C1");
  });

  it("createContact() calls POST /contacts", async () => {
    mock.onPost("/contacts").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.createContact({ contact_name: "ACME" } as any);
    expect((res as any).body.contact_name).toBe("ACME");
  });

  it("deleteContact() calls DELETE /contacts/:id", async () => {
    mock.onDelete("/contacts/C1").reply(200, { code: 0, message: "deleted" });
    const res = await client.deleteContact("C1");
    expect((res as any).message).toBe("deleted");
  });

  // â”€â”€â”€ Invoices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listInvoices() calls GET /invoices", async () => {
    mock.onGet("/invoices").reply(200, { code: 0, invoices: [{ invoice_id: "INV-001" }] });
    const res = await client.listInvoices();
    expect(res.invoices[0].invoice_id).toBe("INV-001");
  });

  it("getInvoice() calls GET /invoices/:id", async () => {
    mock.onGet("/invoices/INV-001").reply(200, { code: 0, invoice: { invoice_id: "INV-001" } });
    const res = await client.getInvoice("INV-001");
    expect(res.invoice.invoice_id).toBe("INV-001");
  });

  it("createInvoice() sends POST /invoices", async () => {
    mock.onPost("/invoices").reply(200, { code: 0, invoice: { invoice_id: "INV-002" } });
    const res = await client.createInvoice({ customer_id: "C1", line_items: [] } as any);
    expect(res.invoice.invoice_id).toBe("INV-002");
  });

  it("updateInvoice() sends PUT /invoices/:id", async () => {
    mock.onPut("/invoices/INV-001").reply(200, { code: 0, invoice: { invoice_id: "INV-001" } });
    const res = await client.updateInvoice("INV-001", {} as any);
    expect(res.invoice.invoice_id).toBe("INV-001");
  });

  it("sendInvoice() calls POST /invoices/:id/email", async () => {
    mock.onPost("/invoices/INV-001/email").reply(200, { code: 0, message: "Email sent" });
    const res = await client.sendInvoice("INV-001");
    expect((res as any).message).toBe("Email sent");
  });

  it("deleteInvoice() calls DELETE /invoices/:id", async () => {
    mock.onDelete("/invoices/INV-001").reply(200, { code: 0, message: "deleted" });
    await expect(client.deleteInvoice("INV-001")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Expenses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listExpenses() calls GET /expenses", async () => {
    mock.onGet("/expenses").reply(200, { code: 0, expenses: [] });
    const res = await client.listExpenses();
    expect(res.expenses).toHaveLength(0);
  });

  it("createExpense() calls POST /expenses", async () => {
    mock.onPost("/expenses").reply(200, { code: 0, expense: { expense_id: "EXP-1" } });
    const res = await client.createExpense({ account_id: "A1" } as any);
    expect(res.expense.expense_id).toBe("EXP-1");
  });

  // â”€â”€â”€ Payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listPayments() calls GET /customerpayments", async () => {
    mock.onGet("/customerpayments").reply(200, { code: 0, customerpayments: [] });
    const res = await client.listPayments();
    expect(Array.isArray(res.customerpayments)).toBe(true);
  });

  it("createPayment() calls POST /customerpayments", async () => {
    mock.onPost("/customerpayments").reply(200, { code: 0, payment: { payment_id: "PAY-1" } });
    const res = await client.createPayment({ customer_id: "C1" } as any);
    expect(res.payment.payment_id).toBe("PAY-1");
  });

  // â”€â”€â”€ Items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listItems() calls GET /items", async () => {
    mock.onGet("/items").reply(200, { code: 0, items: [{ item_id: "ITEM-1" }] });
    const res = await client.listItems();
    expect(res.items[0].item_id).toBe("ITEM-1");
  });

  it("createItem() calls POST /items", async () => {
    mock.onPost("/items").reply(200, { code: 0, item: { item_id: "ITEM-2" } });
    const res = await client.createItem({ name: "Widget" } as any);
    expect(res.item.item_id).toBe("ITEM-2");
  });

  // â”€â”€â”€ Bills â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listBills() calls GET /bills", async () => {
    mock.onGet("/bills").reply(200, { code: 0, bills: [] });
    const res = await client.listBills();
    expect(Array.isArray(res.bills)).toBe(true);
  });

  it("createBill() calls POST /bills", async () => {
    mock.onPost("/bills").reply(200, { code: 0, bill: { bill_id: "BILL-1" } });
    const res = await client.createBill({ vendor_id: "V1", line_items: [] } as any);
    expect(res.bill.bill_id).toBe("BILL-1");
  });
});
