import MockAdapter from "axios-mock-adapter";
import { ZohoDeskClient } from "../../zoho-desk/ZohoDeskClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const makeClient = () =>
  new ZohoDeskClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("desk-token"),
  });

describe("ZohoDeskClient", () => {
  let client: ZohoDeskClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("desk.zoho.com/api/v1");
  });

  it("injects auth header", async () => {
    mock.onGet("/tickets").reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/tickets");
    expect(res.auth).toBe("Zoho-oauthtoken desk-token");
  });

  // â”€â”€â”€ Tickets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listTickets() calls GET /tickets", async () => {
    mock.onGet("/tickets").reply(200, { code: 0, data: [{ id: "T1", subject: "Help" }] });
    const res = await client.listTickets();
    expect(res.data[0].id).toBe("T1");
  });

  it("getTicket() calls GET /tickets/:id", async () => {
    mock.onGet("/tickets/T1").reply(200, { code: 0, id: "T1", subject: "Help" });
    const res = await client.getTicket("T1");
    expect((res as any).id).toBe("T1");
  });

  it("createTicket() calls POST /tickets", async () => {
    mock.onPost("/tickets").reply(200, { code: 0, id: "T2", subject: "New Issue" });
    const res = await client.createTicket({ subject: "New Issue", departmentId: "D1" } as any);
    expect((res as any).subject).toBe("New Issue");
  });

  it("updateTicket() calls PATCH /tickets/:id", async () => {
    mock.onPatch("/tickets/T1").reply(200, { code: 0, id: "T1", status: "Closed" });
    const res = await client.updateTicket("T1", { status: "Closed" } as any);
    expect((res as any).status).toBe("Closed");
  });

  it("deleteTicket() calls DELETE /tickets/:id", async () => {
    mock.onDelete("/tickets/T1").reply(204, { code: 0 });
    await expect(client.deleteTicket("T1")).resolves.toBeDefined();
  });

  it("searchTickets() calls GET /tickets/search", async () => {
    mock.onGet("/tickets/search").reply(200, { code: 0, data: [] });
    const res = await client.searchTickets({ subject: "Help" } as any);
    expect(Array.isArray(res.data)).toBe(true);
  });

  // â”€â”€â”€ Comments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listComments() calls GET /tickets/:id/comments", async () => {
    mock.onGet("/tickets/T1/comments").reply(200, { code: 0, data: [{ id: "C1" }] });
    const res = await client.listComments("T1");
    expect(res.data[0].id).toBe("C1");
  });

  it("addComment() calls POST /tickets/:id/comments", async () => {
    mock.onPost("/tickets/T1/comments").reply(200, { code: 0, id: "C2", content: "reply" });
    const res = await client.addComment("T1", { content: "reply" } as any);
    expect((res as any).content).toBe("reply");
  });

  it("deleteComment() calls DELETE /tickets/:id/comments/:commentId", async () => {
    mock.onDelete("/tickets/T1/comments/C1").reply(204, { code: 0 });
    await expect(client.deleteComment("T1", "C1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Contacts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listContacts() calls GET /contacts", async () => {
    mock.onGet("/contacts").reply(200, { code: 0, data: [{ id: "CTG-1" }] });
    const res = await client.listContacts();
    expect(res.data[0].id).toBe("CTG-1");
  });

  it("createContact() calls POST /contacts", async () => {
    mock.onPost("/contacts").reply(200, { code: 0, id: "CTG-2", firstName: "Jane" });
    const res = await client.createContact({ firstName: "Jane" } as any);
    expect((res as any).firstName).toBe("Jane");
  });

  it("deleteContact() calls DELETE /contacts/:id", async () => {
    mock.onDelete("/contacts/CTG-1").reply(204, { code: 0 });
    await expect(client.deleteContact("CTG-1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Agents / Departments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listAgents() calls GET /agents", async () => {
    mock.onGet("/agents").reply(200, { code: 0, data: [{ id: "AG-1" }] });
    const res = await client.listAgents();
    expect(res.data[0].id).toBe("AG-1");
  });

  it("listDepartments() calls GET /departments", async () => {
    mock.onGet("/departments").reply(200, { code: 0, data: [{ id: "DEP-1" }] });
    const res = await client.listDepartments();
    expect(res.data[0].id).toBe("DEP-1");
  });
});
