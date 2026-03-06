import MockAdapter from "axios-mock-adapter";
import { ZohoCRMClient } from "../../zoho-crm/ZohoCRMClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const makeClient = (region?: "com" | "eu" | "in") =>
  new ZohoCRMClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("crm-token"),
    region,
  });

describe("ZohoCRMClient", () => {
  let client: ZohoCRMClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  // â”€â”€â”€ URL construction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("uses the correct default base URL for region=com", () => {
    expect(makeClient("com").axiosInstance.defaults.baseURL ?? "").toContain("zohoapis.com/crm/v6");
  });

  it("uses the EU base URL for region=eu", () => {
    expect(makeClient("eu").axiosInstance.defaults.baseURL ?? "").toContain("zohoapis.eu/crm/v6");
  });

  it("uses the IN base URL for region=in", () => {
    expect(makeClient("in").axiosInstance.defaults.baseURL ?? "").toContain("zohoapis.in/crm/v6");
  });

  // â”€â”€â”€ Auth header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("injects Zoho-oauthtoken header", async () => {
    mock.onGet("/Contacts").reply((config) => [200, { code: 0, auth: config.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/Contacts");
    expect(res.auth).toBe("Zoho-oauthtoken crm-token");
  });

  // â”€â”€â”€ Leads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listLeads() calls GET /Leads", async () => {
    mock.onGet("/Leads").reply(200, { code: 0, data: [{ id: "1", Last_Name: "Doe" }] });
    const res = await client.listLeads();
    expect(res.data[0].Last_Name).toBe("Doe");
  });

  it("listLeads() forwards query params", async () => {
    mock.onGet("/Leads").reply((cfg) => [200, { code: 0, params: cfg.params, data: [] }]);
    await client.listLeads({ page: 2 });
    const call = mock.history.get[0];
    expect(call.params).toMatchObject({ page: 2 });
  });

  it("getLead() calls GET /Leads/:id", async () => {
    mock.onGet("/Leads/L1").reply(200, { code: 0, data: [{ id: "L1" }] });
    const res = await client.getLead("L1");
    expect(res.data[0].id).toBe("L1");
  });

  it("createLeads() calls POST /Leads with data array", async () => {
    mock.onPost("/Leads").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.createLeads([{ Last_Name: "Smith" } as any]);
    expect((res as any).body.data[0].Last_Name).toBe("Smith");
  });

  it("updateLeads() calls PUT /Leads", async () => {
    mock.onPut("/Leads").reply(200, { code: 0, data: [{ code: "SUCCESS" }] });
    const res = await client.updateLeads([{ id: "L1", Last_Name: "Jones" }]);
    expect(res.data[0].code).toBe("SUCCESS");
  });

  it("deleteLead() calls DELETE /Leads/:id", async () => {
    mock.onDelete("/Leads/L1").reply(200, { code: 0, data: [{ code: "SUCCESS" }] });
    const res = await client.deleteLead("L1");
    expect(res.data[0].code).toBe("SUCCESS");
  });

  it("searchLeads() calls GET /Leads/search", async () => {
    mock.onGet("/Leads/search").reply(200, { code: 0, data: [] });
    const res = await client.searchLeads({ criteria: "(Last_Name:equals:Doe)" });
    expect(res.data).toHaveLength(0);
  });

  // â”€â”€â”€ Contacts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listContacts() calls GET /Contacts", async () => {
    mock.onGet("/Contacts").reply(200, { code: 0, data: [{ id: "C1" }] });
    const res = await client.listContacts();
    expect(res.data[0].id).toBe("C1");
  });

  it("getContact() calls GET /Contacts/:id", async () => {
    mock.onGet("/Contacts/C1").reply(200, { code: 0, data: [{ id: "C1" }] });
    const res = await client.getContact("C1");
    expect(res.data[0].id).toBe("C1");
  });

  it("createContacts() calls POST /Contacts", async () => {
    mock.onPost("/Contacts").reply(200, { code: 0, data: [{ code: "SUCCESS" }] });
    const res = await client.createContacts([{ Last_Name: "Test" } as any]);
    expect(res.data[0].code).toBe("SUCCESS");
  });

  it("deleteContact() calls DELETE /Contacts/:id", async () => {
    mock.onDelete("/Contacts/C1").reply(200, { code: 0, data: [{ code: "SUCCESS" }] });
    const res = await client.deleteContact("C1");
    expect(res.data[0].code).toBe("SUCCESS");
  });

  // â”€â”€â”€ Accounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listAccounts() calls GET /Accounts", async () => {
    mock.onGet("/Accounts").reply(200, { code: 0, data: [{ id: "A1", Account_Name: "ACME" }] });
    const res = await client.listAccounts();
    expect(res.data[0].Account_Name).toBe("ACME");
  });

  it("createAccounts() calls POST /Accounts", async () => {
    mock.onPost("/Accounts").reply(200, { code: 0, data: [{ code: "SUCCESS" }] });
    await expect(client.createAccounts([{ Account_Name: "ACME" } as any])).resolves.toBeDefined();
  });

  // â”€â”€â”€ Deals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listDeals() calls GET /Deals", async () => {
    mock.onGet("/Deals").reply(200, { code: 0, data: [{ id: "D1" }] });
    const res = await client.listDeals();
    expect(res.data[0].id).toBe("D1");
  });

  it("createDeals() calls POST /Deals", async () => {
    mock.onPost("/Deals").reply(200, { code: 0, data: [{ code: "SUCCESS" }] });
    await expect(client.createDeals([{ Deal_Name: "Deal1" } as any])).resolves.toBeDefined();
  });

  // â”€â”€â”€ Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listTasks() calls GET /Tasks", async () => {
    mock.onGet("/Tasks").reply(200, { code: 0, data: [] });
    const res = await client.listTasks();
    expect(res.data).toHaveLength(0);
  });

  it("createTasks() calls POST /Tasks", async () => {
    mock.onPost("/Tasks").reply(200, { code: 0, data: [{ code: "SUCCESS" }] });
    await expect(client.createTasks([{ Subject: "Follow up" } as any])).resolves.toBeDefined();
  });

  // â”€â”€â”€ Notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listNotes() calls GET /Notes", async () => {
    mock.onGet("/Notes").reply(200, { code: 0, data: [{ id: "N1", Note_Content: "hi" }] });
    const res = await client.listNotes();
    expect(res.data[0].Note_Content).toBe("hi");
  });

  // â”€â”€â”€ Generic module â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listRecords() calls GET /:module", async () => {
    mock.onGet("/Products").reply(200, { code: 0, data: [{ id: "P1" }] });
    const res = await client.listRecords("Products");
    expect((res.data[0] as any).id).toBe("P1");
  });

  it("createRecords() calls POST /:module", async () => {
    mock.onPost("/Products").reply(200, { code: 0, data: [{ code: "SUCCESS" }] });
    await expect(client.createRecords("Products", [{ Product_Name: "Widget" }])).resolves.toBeDefined();
  });

  it("searchRecords() calls GET /:module/search", async () => {
    mock.onGet("/Vendors/search").reply(200, { code: 0, data: [] });
    const res = await client.searchRecords("Vendors", { criteria: "(Name:equals:ACME)" });
    expect(res.data).toHaveLength(0);
  });
});
