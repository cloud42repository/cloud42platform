import MockAdapter from "axios-mock-adapter";
import { ZohoInvoiceClient } from "../../zoho-invoice/ZohoInvoiceClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const ORG_ID = "org-inv-001";

const makeClient = (region?: "com" | "eu" | "in") =>
  new ZohoInvoiceClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("inv-token"),
    organizationId: ORG_ID,
    region,
  });

describe("ZohoInvoiceClient", () => {
  let client: ZohoInvoiceClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  // â”€â”€â”€ URL construction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("uses the correct default base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("zohoapis.com/invoice/v3");
  });

  it("uses EU base URL for region=eu", () => {
    expect(makeClient("eu").axiosInstance.defaults.baseURL ?? "").toContain("zohoapis.eu/invoice/v3");
  });

  it("appends organization_id to every request", async () => {
    mock.onGet("/invoices").reply((cfg) => [200, { code: 0, params: cfg.params }]);
    const res = await client.get<{ params: Record<string, string> }>("/invoices");
    expect(res.params.organization_id).toBe(ORG_ID);
  });

  // â”€â”€â”€ Invoices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listInvoices() calls GET /invoices", async () => {
    mock.onGet("/invoices").reply(200, { code: 0, invoices: [{ invoice_id: "INV-1" }] });
    const res = await client.listInvoices();
    expect(res.invoices[0].invoice_id).toBe("INV-1");
  });

  it("getInvoice() calls GET /invoices/:id", async () => {
    mock.onGet("/invoices/INV-1").reply(200, { code: 0, invoice: { invoice_id: "INV-1" } });
    const res = await client.getInvoice("INV-1");
    expect(res.invoice.invoice_id).toBe("INV-1");
  });

  it("createInvoice() calls POST /invoices", async () => {
    mock.onPost("/invoices").reply(200, { code: 0, invoice: { invoice_id: "INV-2" } });
    const res = await client.createInvoice({ customer_id: "C1", line_items: [] } as any);
    expect(res.invoice.invoice_id).toBe("INV-2");
  });

  it("updateInvoice() calls PUT /invoices/:id", async () => {
    mock.onPut("/invoices/INV-1").reply(200, { code: 0, invoice: { invoice_id: "INV-1" } });
    const res = await client.updateInvoice("INV-1", {} as any);
    expect(res.invoice.invoice_id).toBe("INV-1");
  });

  it("sendInvoice() calls POST /invoices/:id/email", async () => {
    mock.onPost("/invoices/INV-1/email").reply(200, { code: 0, message: "Email sent" });
    const res = await client.sendInvoice("INV-1");
    expect(res.message).toBe("Email sent");
  });

  it("deleteInvoice() calls DELETE /invoices/:id", async () => {
    mock.onDelete("/invoices/INV-1").reply(200, { code: 0, message: "deleted" });
    await expect(client.deleteInvoice("INV-1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Customers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listCustomers() calls GET /customers", async () => {
    mock.onGet("/customers").reply(200, { code: 0, customers: [{ customer_id: "CUS-1" }] });
    const res = await client.listCustomers();
    expect(res.customers[0].customer_id).toBe("CUS-1");
  });

  it("createCustomer() calls POST /customers", async () => {
    mock.onPost("/customers").reply(200, { code: 0, customer: { customer_id: "CUS-2" } });
    const res = await client.createCustomer({ contact_name: "Acme" } as any);
    expect(res.customer.customer_id).toBe("CUS-2");
  });

  it("deleteCustomer() calls DELETE /customers/:id", async () => {
    mock.onDelete("/customers/CUS-1").reply(200, { code: 0, message: "deleted" });
    await expect(client.deleteCustomer("CUS-1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Estimates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listEstimates() calls GET /estimates", async () => {
    mock.onGet("/estimates").reply(200, { code: 0, estimates: [] });
    const res = await client.listEstimates();
    expect(Array.isArray(res.estimates)).toBe(true);
  });

  it("createEstimate() calls POST /estimates", async () => {
    mock.onPost("/estimates").reply(200, { code: 0, estimate: { estimate_id: "EST-1" } });
    const res = await client.createEstimate({ customer_id: "C1" } as any);
    expect(res.estimate.estimate_id).toBe("EST-1");
  });

  // â”€â”€â”€ Payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listPayments() calls GET /customerpayments", async () => {
    mock.onGet("/customerpayments").reply(200, { code: 0, payments: [] });
    const res = await client.listPayments();
    expect(Array.isArray(res.payments)).toBe(true);
  });

  it("createPayment() calls POST /customerpayments", async () => {
    mock.onPost("/customerpayments").reply(200, { code: 0, payment: { payment_id: "PAY-1" } });
    const res = await client.createPayment({ customer_id: "C1" } as any);
    expect(res.payment.payment_id).toBe("PAY-1");
  });
});
