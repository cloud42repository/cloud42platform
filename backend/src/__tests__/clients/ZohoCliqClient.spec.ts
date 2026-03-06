import MockAdapter from "axios-mock-adapter";
import { ZohoCliqClient } from "../../zoho-cliq/ZohoCliqClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const makeClient = () =>
  new ZohoCliqClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("cliq-token"),
  });

describe("ZohoCliqClient", () => {
  let client: ZohoCliqClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("cliq.zoho.com/api/v2");
  });

  it("injects auth header", async () => {
    mock.onGet("/channels").reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/channels");
    expect(res.auth).toBe("Zoho-oauthtoken cliq-token");
  });

  // â”€â”€â”€ Channels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listChannels() calls GET /channels", async () => {
    mock.onGet("/channels").reply(200, { code: 0, channels: [{ id: "CH-1", name: "general" }] });
    const res = await client.listChannels();
    expect(res.channels[0].name).toBe("general");
  });

  it("getChannel() calls GET /channels/:uniqueName", async () => {
    mock.onGet("/channels/general").reply(200, { code: 0, channel: { id: "CH-1", name: "general" } });
    const res = await client.getChannel("general");
    expect(res.channel.name).toBe("general");
  });

  it("createChannel() calls POST /channels", async () => {
    mock.onPost("/channels").reply(200, { code: 0, channel: { id: "CH-2", name: "newchan" } });
    const res = await client.createChannel({ name: "newchan" });
    expect(res.channel.name).toBe("newchan");
  });

  it("deleteChannel() calls DELETE /channels/:uniqueName", async () => {
    mock.onDelete("/channels/general").reply(200, { code: 0 });
    await expect(client.deleteChannel("general")).resolves.toBeDefined();
  });

  it("addChannelMember() calls POST /channels/:name/members with email_ids", async () => {
    mock.onPost("/channels/general/members").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.addChannelMember("general", ["a@test.com"]) as any;
    expect(res.body.email_ids).toContain("a@test.com");
  });

  // â”€â”€â”€ Messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listChannelMessages() calls GET /channels/:name/messages", async () => {
    mock.onGet("/channels/general/messages").reply(200, { code: 0, messages: [] });
    const res = await client.listChannelMessages("general");
    expect(Array.isArray(res.messages)).toBe(true);
  });

  it("sendChannelMessage() calls POST /channels/:name/message", async () => {
    mock.onPost("/channels/general/message").reply(200, { code: 0, message: { id: "MSG-1" } });
    const res = await client.sendChannelMessage("general", { text: "Hello" } as any);
    expect(res.message.id).toBe("MSG-1");
  });

  it("sendDirectMessage() calls POST /buddies/:email/message", async () => {
    mock.onPost("/buddies/user@test.com/message").reply(200, { code: 0, message: { id: "MSG-2" } });
    const res = await client.sendDirectMessage("user@test.com", { text: "Hi" } as any);
    expect(res.message.id).toBe("MSG-2");
  });

  it("deleteMessage() calls DELETE /channels/:name/messages/:msgId", async () => {
    mock.onDelete("/channels/general/messages/MSG-1").reply(200, { code: 0 });
    await expect(client.deleteMessage("general", "MSG-1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ User Groups â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listUserGroups() calls GET /usergroups", async () => {
    mock.onGet("/usergroups").reply(200, { code: 0, usergroups: [] });
    const res = await client.listUserGroups();
    expect(Array.isArray(res.usergroups)).toBe(true);
  });

  it("createUserGroup() calls POST /usergroups", async () => {
    mock.onPost("/usergroups").reply(200, { code: 0, usergroup: { id: "UG-1", name: "devteam" } });
    const res = await client.createUserGroup({ name: "Dev Team" });
    expect(res.usergroup.name).toBe("devteam");
  });

  // â”€â”€â”€ Bots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listBots() calls GET /bots", async () => {
    mock.onGet("/bots").reply(200, { code: 0, bots: [{ id: "BOT-1", name: "helperbot" }] });
    const res = await client.listBots();
    expect(res.bots[0].name).toBe("helperbot");
  });

  it("sendBotMessage() calls POST /bots/:name/message", async () => {
    mock.onPost("/bots/helperbot/message").reply(200, { code: 0, message: { id: "MSG-3" } });
    const res = await client.sendBotMessage("helperbot", { text: "Status?" } as any);
    expect(res.message.id).toBe("MSG-3");
  });
});
