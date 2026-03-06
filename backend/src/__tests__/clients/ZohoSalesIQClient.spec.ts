import MockAdapter from "axios-mock-adapter";
import { ZohoSalesIQClient } from "../../zoho-salesiq/ZohoSalesIQClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const SCREEN = "mysite";

const makeClient = () =>
  new ZohoSalesIQClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("salesiq-token"),
  });

describe("ZohoSalesIQClient", () => {
  let client: ZohoSalesIQClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("salesiq.zoho.com/api/v2");
  });

  it("injects auth header", async () => {
    mock.onGet(`/${SCREEN}/visitors`).reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>(`/${SCREEN}/visitors`);
    expect(res.auth).toBe("Zoho-oauthtoken salesiq-token");
  });

  // â”€â”€â”€ Visitors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listVisitors() calls GET /:screenName/visitors", async () => {
    mock.onGet(`/${SCREEN}/visitors`).reply(200, { code: 0, visitors: [{ id: "V1" }] });
    const res = await client.listVisitors(SCREEN);
    expect(res.visitors[0].id).toBe("V1");
  });

  it("getVisitor() calls GET /:screenName/visitors/:id", async () => {
    mock.onGet(`/${SCREEN}/visitors/V1`).reply(200, { code: 0, visitor: { id: "V1" } });
    const res = await client.getVisitor(SCREEN, "V1");
    expect(res.visitor.id).toBe("V1");
  });

  it("searchVisitors() calls GET /:screenName/visitors/search", async () => {
    mock.onGet(`/${SCREEN}/visitors/search`).reply(200, { code: 0, visitors: [] });
    const res = await client.searchVisitors(SCREEN, { email: "user@test.com" } as any);
    expect(Array.isArray(res.visitors)).toBe(true);
  });

  // â”€â”€â”€ Chats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listChats() calls GET /:screenName/chats", async () => {
    mock.onGet(`/${SCREEN}/chats`).reply(200, { code: 0, chats: [{ id: "CH-1" }] });
    const res = await client.listChats(SCREEN);
    expect(res.chats[0].id).toBe("CH-1");
  });

  it("getChat() calls GET /:screenName/chats/:id", async () => {
    mock.onGet(`/${SCREEN}/chats/CH-1`).reply(200, { code: 0, chat: { id: "CH-1" } });
    const res = await client.getChat(SCREEN, "CH-1");
    expect(res.chat.id).toBe("CH-1");
  });

  it("listChatMessages() calls GET /:screenName/chats/:id/messages", async () => {
    mock.onGet(`/${SCREEN}/chats/CH-1/messages`).reply(200, { code: 0, messages: [] });
    const res = await client.listChatMessages(SCREEN, "CH-1");
    expect(Array.isArray(res.messages)).toBe(true);
  });

  it("sendChatMessage() calls POST /:screenName/chats/:id/messages", async () => {
    mock.onPost(`/${SCREEN}/chats/CH-1/messages`).reply((cfg) => [200, { code: 0, message: { text: JSON.parse(cfg.data).text } }]);
    const res = await client.sendChatMessage(SCREEN, "CH-1", "Hello!");
    expect(res.message.text).toBe("Hello!");
  });

  it("setRating() calls POST /:screenName/chats/:id/rating", async () => {
    mock.onPost(`/${SCREEN}/chats/CH-1/rating`).reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.setRating(SCREEN, "CH-1", 5) as any;
    expect(res.body.rating).toBe(5);
  });

  // â”€â”€â”€ Operators â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listOperators() calls GET /:screenName/operators", async () => {
    mock.onGet(`/${SCREEN}/operators`).reply(200, { code: 0, operators: [{ id: "OP-1" }] });
    const res = await client.listOperators(SCREEN);
    expect(res.operators[0].id).toBe("OP-1");
  });

  it("getOperator() calls GET /:screenName/operators/:id", async () => {
    mock.onGet(`/${SCREEN}/operators/OP-1`).reply(200, { code: 0, operator: { id: "OP-1" } });
    const res = await client.getOperator(SCREEN, "OP-1");
    expect(res.operator.id).toBe("OP-1");
  });

  it("setOperatorAvailability() calls POST /:screenName/operators/:id/online with status", async () => {
    mock.onPost(`/${SCREEN}/operators/OP-1/online`).reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.setOperatorAvailability(SCREEN, "OP-1", "online") as any;
    expect(res.body.status).toBe("online");
  });

  // â”€â”€â”€ Departments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listDepartments() calls GET /:screenName/departments", async () => {
    mock.onGet(`/${SCREEN}/departments`).reply(200, { code: 0, departments: [] });
    const res = await client.listDepartments(SCREEN);
    expect(Array.isArray(res.departments)).toBe(true);
  });

  it("getDepartment() calls GET /:screenName/departments/:id", async () => {
    mock.onGet(`/${SCREEN}/departments/DEP-1`).reply(200, { code: 0, department: { id: "DEP-1" } });
    const res = await client.getDepartment(SCREEN, "DEP-1");
    expect(res.department.id).toBe("DEP-1");
  });

  // â”€â”€â”€ Bots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listBots() calls GET /:screenName/bots", async () => {
    mock.onGet(`/${SCREEN}/bots`).reply(200, { code: 0, bots: [{ id: "BOT-1" }] });
    const res = await client.listBots(SCREEN);
    expect(res.bots[0].id).toBe("BOT-1");
  });

  it("sendBotMessage() calls POST /:screenName/bots/:botId/send", async () => {
    mock.onPost(`/${SCREEN}/bots/BOT-1/send`).reply(200, { code: 0, result: "sent" });
    const res = await client.sendBotMessage(SCREEN, "BOT-1", { text: "hi" }) as any;
    expect(res.result).toBe("sent");
  });

  // â”€â”€â”€ Feedback Forms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listFeedbackForms() calls GET /:screenName/feedbackforms", async () => {
    mock.onGet(`/${SCREEN}/feedbackforms`).reply(200, { code: 0, feedbackforms: [] });
    const res = await client.listFeedbackForms(SCREEN);
    expect(Array.isArray(res.feedbackforms)).toBe(true);
  });
});
