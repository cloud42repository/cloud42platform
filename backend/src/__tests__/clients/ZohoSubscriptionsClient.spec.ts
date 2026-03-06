import MockAdapter from "axios-mock-adapter";
import { ZohoSubscriptionsClient } from "../../zoho-subscriptions/ZohoSubscriptionsClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const ORG_ID = "org-subs-001";

const makeClient = () =>
  new ZohoSubscriptionsClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("subs-token"),
    organizationId: ORG_ID,
  });

describe("ZohoSubscriptionsClient", () => {
  let client: ZohoSubscriptionsClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("zohoapis.com/subscriptions/v1");
  });

  it("appends organization_id to every request", async () => {
    mock.onGet("/plans").reply((cfg) => [200, { code: 0, params: cfg.params }]);
    const res = await client.get<{ params: Record<string, string> }>("/plans");
    expect(res.params.organization_id).toBe(ORG_ID);
  });

  // â”€â”€â”€ Plans â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listPlans() calls GET /plans", async () => {
    mock.onGet("/plans").reply(200, { code: 0, plans: [{ plan_code: "P1" }] });
    const res = await client.listPlans();
    expect(res.plans[0].plan_code).toBe("P1");
  });

  it("getPlan() calls GET /plans/:code", async () => {
    mock.onGet("/plans/P1").reply(200, { code: 0, plan: { plan_code: "P1" } });
    const res = await client.getPlan("P1");
    expect(res.plan.plan_code).toBe("P1");
  });

  it("createPlan() calls POST /plans", async () => {
    mock.onPost("/plans").reply(200, { code: 0, plan: { plan_code: "P2" } });
    const res = await client.createPlan({ plan_code: "P2", name: "Pro" } as any);
    expect(res.plan.plan_code).toBe("P2");
  });

  it("updatePlan() calls PUT /plans/:code", async () => {
    mock.onPut("/plans/P1").reply(200, { code: 0, plan: { plan_code: "P1" } });
    const res = await client.updatePlan("P1", { name: "Pro Max" } as any);
    expect(res.plan.plan_code).toBe("P1");
  });

  it("deletePlan() calls DELETE /plans/:code", async () => {
    mock.onDelete("/plans/P1").reply(200, { code: 0, message: "deleted" });
    await expect(client.deletePlan("P1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Customers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listCustomers() calls GET /customers", async () => {
    mock.onGet("/customers").reply(200, { code: 0, customers: [{ customer_id: "CUS-1" }] });
    const res = await client.listCustomers();
    expect(res.customers[0].customer_id).toBe("CUS-1");
  });

  it("createCustomer() calls POST /customers", async () => {
    mock.onPost("/customers").reply(200, { code: 0, customer: { customer_id: "CUS-2" } });
    const res = await client.createCustomer({ display_name: "ACME" } as any);
    expect(res.customer.customer_id).toBe("CUS-2");
  });

  it("deleteCustomer() calls DELETE /customers/:id", async () => {
    mock.onDelete("/customers/CUS-1").reply(200, { code: 0, message: "deleted" });
    await expect(client.deleteCustomer("CUS-1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Subscriptions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listSubscriptions() calls GET /subscriptions", async () => {
    mock.onGet("/subscriptions").reply(200, { code: 0, subscriptions: [{ subscription_id: "SUB-1" }] });
    const res = await client.listSubscriptions();
    expect(res.subscriptions[0].subscription_id).toBe("SUB-1");
  });

  it("getSubscription() calls GET /subscriptions/:id", async () => {
    mock.onGet("/subscriptions/SUB-1").reply(200, { code: 0, subscription: { subscription_id: "SUB-1" } });
    const res = await client.getSubscription("SUB-1");
    expect(res.subscription.subscription_id).toBe("SUB-1");
  });

  it("createSubscription() calls POST /subscriptions", async () => {
    mock.onPost("/subscriptions").reply(200, { code: 0, subscription: { subscription_id: "SUB-2" } });
    const res = await client.createSubscription({ customer_id: "CUS-1", plan: { plan_code: "P1" } } as any);
    expect(res.subscription.subscription_id).toBe("SUB-2");
  });

  it("cancelSubscription() calls POST /subscriptions/:id/cancel", async () => {
    mock.onPost("/subscriptions/SUB-1/cancel").reply(200, { code: 0, subscription: { subscription_id: "SUB-1", status: "cancelled" } });
    const res = await client.cancelSubscription("SUB-1");
    expect(res.subscription.status).toBe("cancelled");
  });

  // â”€â”€â”€ Addons / Coupons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listAddons() calls GET /addons", async () => {
    mock.onGet("/addons").reply(200, { code: 0, addons: [] });
    const res = await client.listAddons();
    expect(Array.isArray(res.addons)).toBe(true);
  });

  it("listCoupons() calls GET /coupons", async () => {
    mock.onGet("/coupons").reply(200, { code: 0, coupons: [] });
    const res = await client.listCoupons();
    expect(Array.isArray(res.coupons)).toBe(true);
  });
});
