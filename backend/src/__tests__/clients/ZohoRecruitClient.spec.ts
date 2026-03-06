import MockAdapter from "axios-mock-adapter";
import { ZohoRecruitClient } from "../../zoho-recruit/ZohoRecruitClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const makeClient = () =>
  new ZohoRecruitClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("recruit-token"),
  });

describe("ZohoRecruitClient", () => {
  let client: ZohoRecruitClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("recruit.zoho.com/recruit/v2");
  });

  it("injects auth header", async () => {
    mock.onGet("/JobOpenings").reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/JobOpenings");
    expect(res.auth).toBe("Zoho-oauthtoken recruit-token");
  });

  // â”€â”€â”€ Job Openings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listJobOpenings() calls GET /JobOpenings", async () => {
    mock.onGet("/JobOpenings").reply(200, { code: 0, data: [{ id: "JO-1" }] });
    const res = await client.listJobOpenings();
    expect(res.data[0].id).toBe("JO-1");
  });

  it("getJobOpening() calls GET /JobOpenings/:id", async () => {
    mock.onGet("/JobOpenings/JO-1").reply(200, { code: 0, data: [{ id: "JO-1" }] });
    const res = await client.getJobOpening("JO-1");
    expect(res.data[0].id).toBe("JO-1");
  });

  it("createJobOpenings() calls POST /JobOpenings with data array", async () => {
    mock.onPost("/JobOpenings").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.createJobOpenings([{ Job_Opening_Name: "Dev" } as any]);
    expect((res as any).body.data[0].Job_Opening_Name).toBe("Dev");
  });

  it("deleteJobOpening() calls DELETE /JobOpenings/:id", async () => {
    mock.onDelete("/JobOpenings/JO-1").reply(200, { code: 0, data: [{ code: "SUCCESS" }] });
    const res = await client.deleteJobOpening("JO-1");
    expect(res.data[0].code).toBe("SUCCESS");
  });

  // â”€â”€â”€ Candidates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listCandidates() calls GET /Candidates", async () => {
    mock.onGet("/Candidates").reply(200, { code: 0, data: [{ id: "CA-1" }] });
    const res = await client.listCandidates();
    expect(res.data[0].id).toBe("CA-1");
  });

  it("getCandidate() calls GET /Candidates/:id", async () => {
    mock.onGet("/Candidates/CA-1").reply(200, { code: 0, data: [{ id: "CA-1" }] });
    const res = await client.getCandidate("CA-1");
    expect(res.data[0].id).toBe("CA-1");
  });

  it("createCandidates() calls POST /Candidates", async () => {
    mock.onPost("/Candidates").reply(200, { code: 0, data: [{ code: "SUCCESS" }] });
    const res = await client.createCandidates([{ Last_Name: "Smith" } as any]);
    expect(res.data[0].code).toBe("SUCCESS");
  });

  it("deleteCandidate() calls DELETE /Candidates/:id", async () => {
    mock.onDelete("/Candidates/CA-1").reply(200, { code: 0, data: [{ code: "SUCCESS" }] });
    await expect(client.deleteCandidate("CA-1")).resolves.toBeDefined();
  });

  it("searchCandidates() calls GET /Candidates/search", async () => {
    mock.onGet("/Candidates/search").reply(200, { code: 0, data: [] });
    const res = await client.searchCandidates({ criteria: "(Last_Name:equals:Smith)" });
    expect(Array.isArray(res.data)).toBe(true);
  });

  // â”€â”€â”€ Interviews â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listInterviews() calls GET /Interviews", async () => {
    mock.onGet("/Interviews").reply(200, { code: 0, data: [] });
    const res = await client.listInterviews();
    expect(Array.isArray(res.data)).toBe(true);
  });

  it("createInterviews() calls POST /Interviews", async () => {
    mock.onPost("/Interviews").reply(200, { code: 0, data: [{ code: "SUCCESS" }] });
    await expect(client.createInterviews([{ Candidate_Id: { id: "CA-1" } } as any])).resolves.toBeDefined();
  });

  // â”€â”€â”€ Offers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listOffers() calls GET /Offers", async () => {
    mock.onGet("/Offers").reply(200, { code: 0, data: [] });
    const res = await client.listOffers();
    expect(Array.isArray(res.data)).toBe(true);
  });
});
