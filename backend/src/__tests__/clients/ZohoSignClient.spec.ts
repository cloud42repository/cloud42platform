import MockAdapter from "axios-mock-adapter";
import { ZohoSignClient } from "../../zoho-sign/ZohoSignClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const makeClient = () =>
  new ZohoSignClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("sign-token"),
  });

describe("ZohoSignClient", () => {
  let client: ZohoSignClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("sign.zoho.com/api/v1");
  });

  it("injects auth header", async () => {
    mock.onGet("/requests").reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/requests");
    expect(res.auth).toBe("Zoho-oauthtoken sign-token");
  });

  // â”€â”€â”€ Requests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listRequests() calls GET /requests", async () => {
    mock.onGet("/requests").reply(200, { code: 0, requests: [{ request_id: "REQ-1" }] });
    const res = await client.listRequests();
    expect(res.requests[0].request_id).toBe("REQ-1");
  });

  it("getRequest() calls GET /requests/:id", async () => {
    mock.onGet("/requests/REQ-1").reply(200, { code: 0, requests: { request_id: "REQ-1" } });
    const res = await client.getRequest("REQ-1");
    expect(res.requests.request_id).toBe("REQ-1");
  });

  it("createRequest() calls POST /requests with requests payload", async () => {
    mock.onPost("/requests").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.createRequest({ request_name: "Contract" } as any);
    expect((res as any).body.requests.request_name).toBe("Contract");
  });

  it("sendRequest() calls POST /requests/:id/submit", async () => {
    mock.onPost("/requests/REQ-1/submit").reply(200, { code: 0, requests: { request_id: "REQ-1", status: "inprogress" } });
    const res = await client.sendRequest("REQ-1");
    expect(res.requests.status).toBe("inprogress");
  });

  it("deleteRequest() calls DELETE /requests/:id", async () => {
    mock.onDelete("/requests/REQ-1").reply(200, { code: 0, message: "Request deleted" });
    const res = await client.deleteRequest("REQ-1");
    expect(res.message).toBe("Request deleted");
  });

  it("recallRequest() calls POST /requests/:id/recall", async () => {
    mock.onPost("/requests/REQ-1/recall").reply(200, { code: 0, requests: { request_id: "REQ-1" } });
    const res = await client.recallRequest("REQ-1");
    expect(res.requests.request_id).toBe("REQ-1");
  });

  it("remindRequest() calls POST /requests/:id/remind", async () => {
    mock.onPost("/requests/REQ-1/remind").reply(200, { code: 0, message: "Reminder sent" });
    const res = await client.remindRequest("REQ-1");
    expect(res.message).toBe("Reminder sent");
  });

  // â”€â”€â”€ Templates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listTemplates() calls GET /templates", async () => {
    mock.onGet("/templates").reply(200, { code: 0, templates: [{ templates_id: "TPL-1" }] });
    const res = await client.listTemplates();
    expect(res.templates[0].templates_id).toBe("TPL-1");
  });

  it("getTemplate() calls GET /templates/:id", async () => {
    mock.onGet("/templates/TPL-1").reply(200, { code: 0, templates: { templates_id: "TPL-1" } });
    const res = await client.getTemplate("TPL-1");
    expect(res.templates.templates_id).toBe("TPL-1");
  });

  it("createRequestFromTemplate() calls POST /templates/:id/createdocument", async () => {
    mock.onPost("/templates/TPL-1/createdocument").reply(200, { code: 0, requests: { request_id: "REQ-2" } });
    const res = await client.createRequestFromTemplate("TPL-1", { recipients: [] });
    expect(res.requests.request_id).toBe("REQ-2");
  });

  // â”€â”€â”€ Documents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("getDocument() calls GET /requests/:reqId/documents/:docId", async () => {
    mock.onGet("/requests/REQ-1/documents/DOC-1").reply(200, { code: 0, document: { document_id: "DOC-1" } });
    const res = await client.getDocument("REQ-1", "DOC-1");
    expect(res.document.document_id).toBe("DOC-1");
  });
});
