import MockAdapter from "axios-mock-adapter";
import { ZohoCampaignsClient } from "../../zoho-campaigns/ZohoCampaignsClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const makeClient = () =>
  new ZohoCampaignsClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("campaigns-token"),
  });

describe("ZohoCampaignsClient", () => {
  let client: ZohoCampaignsClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("campaigns.zoho.com/api/v1.1");
  });

  it("injects auth header", async () => {
    mock.onGet("/topicList").reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/topicList");
    expect(res.auth).toBe("Zoho-oauthtoken campaigns-token");
  });

  // â”€â”€â”€ Mailing Lists â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listMailingLists() calls GET /getmailinglists", async () => {
    mock.onGet("/getmailinglists").reply(200, { code: 0, list_of_details: [] });
    await expect(client.listMailingLists()).resolves.toBeDefined();
  });

  it("createMailingList() calls POST /addList", async () => {
    mock.onPost("/addList").reply(200, { code: 0, message: "success" });
    await expect(client.createMailingList({ listname: "Newsletter" })).resolves.toBeDefined();
  });

  it("deleteMailingList() calls POST /deleteList with listkey", async () => {
    mock.onPost("/deleteList").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.deleteMailingList("LK-1") as any;
    expect(res.body.listkey).toBe("LK-1");
  });

  // â”€â”€â”€ Subscribers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listSubscribers() calls GET /list/listsubscribers with listkey", async () => {
    mock.onGet("/list/listsubscribers").reply((cfg) => [200, { code: 0, params: cfg.params }]);
    const res = await client.listSubscribers("LK-1") as any;
    expect(res.params.listkey).toBe("LK-1");
  });

  it("addSubscriber() calls POST /json/listsubscribe", async () => {
    mock.onPost("/json/listsubscribe").reply(200, { code: 0, message: "subscribed" });
    await expect(client.addSubscriber("LK-1", { Email: "user@test.com" } as any)).resolves.toBeDefined();
  });

  it("removeSubscriber() calls POST /json/listunsubscribe with email", async () => {
    mock.onPost("/json/listunsubscribe").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.removeSubscriber("LK-1", "user@test.com") as any;
    expect(res.body.emailids).toBe("user@test.com");
  });

  // â”€â”€â”€ Topics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listTopics() calls GET /topicList", async () => {
    mock.onGet("/topicList").reply(200, { code: 0, topics: [] });
    await expect(client.listTopics()).resolves.toBeDefined();
  });

  // â”€â”€â”€ Campaigns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listCampaigns() calls GET /getallmailings", async () => {
    mock.onGet("/getallmailings").reply(200, { code: 0, campaigns: [] });
    await expect(client.listCampaigns()).resolves.toBeDefined();
  });

  it("getCampaign() calls GET /getmailingdetails with campaignkey param", async () => {
    mock.onGet("/getmailingdetails").reply((cfg) => [200, { code: 0, params: cfg.params }]);
    const res = await client.getCampaign("CK-1") as any;
    expect(res.params.campaignkey).toBe("CK-1");
  });

  it("sendCampaign() calls POST /sendEmail with campaignkey", async () => {
    mock.onPost("/sendEmail").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.sendCampaign("CK-1") as any;
    expect(res.body.campaignkey).toBe("CK-1");
  });

  it("scheduleCampaign() calls POST /schedulecampaign with time", async () => {
    mock.onPost("/schedulecampaign").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.scheduleCampaign("CK-1", "2024-12-01 10:00") as any;
    expect(res.body.schedule_time).toBe("2024-12-01 10:00");
  });
});
