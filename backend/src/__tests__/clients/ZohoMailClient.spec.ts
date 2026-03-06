import MockAdapter from "axios-mock-adapter";
import { ZohoMailClient } from "../../zoho-mail/ZohoMailClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const ACCOUNT_ID = "ACC-001";

const makeClient = () =>
  new ZohoMailClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("mail-token"),
  });

describe("ZohoMailClient", () => {
  let client: ZohoMailClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("mail.zoho.com/api");
  });

  it("injects auth header", async () => {
    mock.onGet("/accounts").reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/accounts");
    expect(res.auth).toBe("Zoho-oauthtoken mail-token");
  });

  // â”€â”€â”€ Accounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listAccounts() calls GET /accounts", async () => {
    mock.onGet("/accounts").reply(200, { code: 0, data: [{ accountId: ACCOUNT_ID }] });
    const res = await client.listAccounts();
    expect(res.data[0].accountId).toBe(ACCOUNT_ID);
  });

  it("getAccount() calls GET /accounts/:id", async () => {
    mock.onGet(`/accounts/${ACCOUNT_ID}`).reply(200, { code: 0, data: { accountId: ACCOUNT_ID } });
    const res = await client.getAccount(ACCOUNT_ID);
    expect(res.data.accountId).toBe(ACCOUNT_ID);
  });

  // â”€â”€â”€ Folders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listFolders() calls GET /accounts/:id/folders", async () => {
    mock.onGet(`/accounts/${ACCOUNT_ID}/folders`).reply(200, { code: 0, data: [{ folderId: "F1" }] });
    const res = await client.listFolders(ACCOUNT_ID);
    expect(res.data[0].folderId).toBe("F1");
  });

  // â”€â”€â”€ Messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listMessages() calls GET /accounts/:id/folders/:folderId/messages", async () => {
    mock.onGet(`/accounts/${ACCOUNT_ID}/folders/F1/messages`).reply(200, { code: 0, data: [{ messageId: "M1" }] });
    const res = await client.listMessages(ACCOUNT_ID, "F1");
    expect(res.data[0].messageId).toBe("M1");
  });

  it("getMessage() calls GET /accounts/:id/messages/:msgId", async () => {
    mock.onGet(`/accounts/${ACCOUNT_ID}/messages/M1`).reply(200, { code: 0, data: { messageId: "M1" } });
    const res = await client.getMessage(ACCOUNT_ID, "M1");
    expect(res.data.messageId).toBe("M1");
  });

  it("sendMessage() calls POST /accounts/:id/messages", async () => {
    mock.onPost(`/accounts/${ACCOUNT_ID}/messages`).reply(200, { code: 0, data: { messageId: "M2" } });
    const res = await client.sendMessage(ACCOUNT_ID, {
      toAddress: "user@example.com",
      subject: "Hello",
      content: "Hi there",
    } as any);
    expect(res.data.messageId).toBe("M2");
  });

  it("deleteMessage() calls DELETE /accounts/:id/messages/:msgId", async () => {
    mock.onDelete(`/accounts/${ACCOUNT_ID}/messages/M1`).reply(200, { code: 0, status: "success" });
    const res = await client.deleteMessage(ACCOUNT_ID, "M1");
    expect(res.status).toBe("success");
  });

  it("searchMessages() calls GET /accounts/:id/messages/search with searchKey param", async () => {
    mock.onGet(`/accounts/${ACCOUNT_ID}/messages/search`).reply((cfg) => [200, { code: 0, params: cfg.params }]);
    const res = await client.searchMessages(ACCOUNT_ID, "invoice") as any;
    expect(res.params.searchKey).toBe("invoice");
  });

  it("moveMessage() calls POST /accounts/:id/updatemessage with mode=move", async () => {
    mock.onPost(`/accounts/${ACCOUNT_ID}/updatemessage`).reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.moveMessage(ACCOUNT_ID, "M1", "F2") as any;
    expect(res.body.mode).toBe("move");
    expect(res.body.folderId).toBe("F2");
  });

  it("markRead() calls POST /accounts/:id/updatemessage with mode=markAsRead", async () => {
    mock.onPost(`/accounts/${ACCOUNT_ID}/updatemessage`).reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.markRead(ACCOUNT_ID, "M1", true) as any;
    expect(res.body.mode).toBe("markAsRead");
    expect(res.body.isRead).toBe(true);
  });

  // â”€â”€â”€ Contacts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listContacts() calls GET /accounts/:id/contacts", async () => {
    mock.onGet(`/accounts/${ACCOUNT_ID}/contacts`).reply(200, { code: 0, data: [{ contactId: "CTG-1" }] });
    const res = await client.listContacts(ACCOUNT_ID);
    expect(res.data[0].contactId).toBe("CTG-1");
  });

  it("createContact() calls POST /accounts/:id/contacts", async () => {
    mock.onPost(`/accounts/${ACCOUNT_ID}/contacts`).reply(200, { code: 0, data: { contactId: "CTG-2" } });
    const res = await client.createContact(ACCOUNT_ID, { firstName: "Jane" } as any);
    expect(res.data.contactId).toBe("CTG-2");
  });

  it("deleteContact() calls DELETE /accounts/:id/contacts/:contactId", async () => {
    mock.onDelete(`/accounts/${ACCOUNT_ID}/contacts/CTG-1`).reply(200, { code: 0 });
    await expect(client.deleteContact(ACCOUNT_ID, "CTG-1")).resolves.toBeDefined();
  });
});
