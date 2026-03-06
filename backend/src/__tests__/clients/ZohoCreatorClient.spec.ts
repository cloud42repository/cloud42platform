import MockAdapter from "axios-mock-adapter";
import { ZohoCreatorClient } from "../../zoho-creator/ZohoCreatorClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const OWNER = "mycompany";

const makeClient = (ownerName?: string) =>
  new ZohoCreatorClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("creator-token"),
    ownerName,
  });

describe("ZohoCreatorClient", () => {
  let client: ZohoCreatorClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient(OWNER);
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("creator.zoho.com/api/v2");
  });

  it("injects auth header", async () => {
    mock.onGet(`/${OWNER}/applications`).reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>(`/${OWNER}/applications`);
    expect(res.auth).toBe("Zoho-oauthtoken creator-token");
  });

  it("prepends ownerName prefix when set", async () => {
    mock.onGet(`/${OWNER}/applications`).reply(200, { code: 0, applications: [] });
    const res = await client.listApplications();
    expect(Array.isArray(res.applications)).toBe(true);
  });

  it("omits owner prefix when ownerName is not set", async () => {
    const c = makeClient();
    const m = new MockAdapter(c.axiosInstance);
    m.onGet("/applications").reply(200, { code: 0, applications: [] });
    const res = await c.listApplications();
    expect(Array.isArray(res.applications)).toBe(true);
    m.restore();
  });

  // â”€â”€â”€ Applications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listApplications() calls GET /:owner/applications", async () => {
    mock.onGet(`/${OWNER}/applications`).reply(200, { code: 0, applications: [{ link_name: "crm_app" }] });
    const res = await client.listApplications();
    expect(res.applications[0].link_name).toBe("crm_app");
  });

  it("getApplication() calls GET /:owner/applications/:appName", async () => {
    mock.onGet(`/${OWNER}/applications/crm_app`).reply(200, { code: 0, application: { link_name: "crm_app" } });
    const res = await client.getApplication("crm_app");
    expect(res.application.link_name).toBe("crm_app");
  });

  // â”€â”€â”€ Forms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listForms() calls GET /:owner/:appName/forms", async () => {
    mock.onGet(`/${OWNER}/crm_app/forms`).reply(200, { code: 0, forms: [{ link_name: "contact_form" }] });
    const res = await client.listForms("crm_app");
    expect(res.forms[0].link_name).toBe("contact_form");
  });

  it("getForm() calls GET /:owner/:appName/forms/:formName", async () => {
    mock.onGet(`/${OWNER}/crm_app/forms/contact_form`).reply(200, { code: 0, form: { link_name: "contact_form" } });
    const res = await client.getForm("crm_app", "contact_form");
    expect(res.form.link_name).toBe("contact_form");
  });

  // â”€â”€â”€ Records â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listRecords() calls GET /:owner/:appName/report/:reportName", async () => {
    mock.onGet(`/${OWNER}/crm_app/report/contacts_view`).reply(200, { code: 0, data: [] });
    const res = await client.listRecords("crm_app", "contacts_view") as any;
    expect(Array.isArray(res.data)).toBe(true);
  });

  it("getRecord() calls GET /:owner/:appName/report/:reportName/:id", async () => {
    mock.onGet(`/${OWNER}/crm_app/report/contacts_view/R1`).reply(200, { code: 0, data: { ID: "R1" } });
    const res = await client.getRecord("crm_app", "contacts_view", "R1") as any;
    expect(res.data.ID).toBe("R1");
  });

  it("createRecord() calls POST /:owner/:appName/form/:formName", async () => {
    mock.onPost(`/${OWNER}/crm_app/form/contact_form`).reply(200, { code: 0, result: { id: "R2" } });
    const res = await client.createRecord("crm_app", "contact_form", { data: { Name: "ACME" } } as any);
    expect(res.result.id).toBe("R2");
  });

  it("deleteRecord() calls DELETE /:owner/:appName/report/:reportName/:id", async () => {
    mock.onDelete(`/${OWNER}/crm_app/report/contacts_view/R1`).reply(200, { code: 0 });
    await expect(client.deleteRecord("crm_app", "contacts_view", "R1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Reports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listReports() calls GET /:owner/:appName/reports", async () => {
    mock.onGet(`/${OWNER}/crm_app/reports`).reply(200, { code: 0, reports: [] });
    const res = await client.listReports("crm_app");
    expect(Array.isArray(res.reports)).toBe(true);
  });

  // â”€â”€â”€ Workflows â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("triggerWorkflow() calls POST /:owner/:appName/workflow/:name", async () => {
    mock.onPost(`/${OWNER}/crm_app/workflow/send_email`).reply(200, { code: 0, result: "triggered" });
    const res = await client.triggerWorkflow("crm_app", "send_email") as any;
    expect(res.result).toBe("triggered");
  });
});
