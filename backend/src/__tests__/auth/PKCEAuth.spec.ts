import axios from "axios";
import { PKCEAuth } from "../../auth/PKCEAuth";
import { createHash } from "crypto";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const CFG = {
  clientId: "pkce-cid",
  redirectUri: "https://myapp.com/callback",
};

const mockTokenRes = (at = "pkce-at", rt = "pkce-rt", expiresIn = 3600) => ({
  data: { access_token: at, refresh_token: rt, expires_in: expiresIn, token_type: "Bearer", scope: "all" },
  status: 200,
  headers: {},
  config: { headers: {} as any },
  statusText: "OK",
});

describe("PKCEAuth", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── PKCE helpers ────────────────────────────────────────────────────────────

  describe("static helpers", () => {
    it("generateCodeVerifier() produces a URL-safe base64 string", () => {
      const v = PKCEAuth.generateCodeVerifier();
      expect(v).toMatch(/^[A-Za-z0-9\-_]+$/);
      expect(v.length).toBeGreaterThanOrEqual(40);
    });

    it("generateCodeChallenge() is the S256 of the verifier", () => {
      const verifier = "test-verifier";
      const expected = createHash("sha256")
        .update(verifier)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
      expect(PKCEAuth.generateCodeChallenge(verifier)).toBe(expected);
    });
  });

  // ── startFlow ───────────────────────────────────────────────────────────────

  describe("startFlow()", () => {
    it("returns a URL with code_challenge and code_challenge_method", () => {
      const auth = new PKCEAuth(CFG);
      const { url, codeVerifier } = auth.startFlow("ZohoCRM.modules.ALL");

      expect(codeVerifier).toBeDefined();
      expect(url).toContain("code_challenge=");
      expect(url).toContain("code_challenge_method=S256");
      expect(url).toContain("response_type=code");
      expect(url).toContain("access_type=offline");
    });

    it("includes state parameter when supplied", () => {
      const auth = new PKCEAuth(CFG);
      const { url } = auth.startFlow("scope", "my-state");
      expect(url).toContain("state=my-state");
    });
  });

  // ── exchangeCode ────────────────────────────────────────────────────────────

  describe("exchangeCode()", () => {
    it("posts with grant_type=authorization_code and code_verifier", async () => {
      mockedAxios.post = jest.fn().mockResolvedValue(mockTokenRes());
      const auth = new PKCEAuth(CFG);
      const tokens = await auth.exchangeCode("auth-code", "my-verifier");

      expect(tokens.accessToken).toBe("pkce-at");
      const body: string = (mockedAxios.post as jest.Mock).mock.calls[0][1];
      expect(body).toContain("grant_type=authorization_code");
      expect(body).toContain("code_verifier=my-verifier");
      // PKCE does NOT send client_secret
      expect(body).not.toContain("client_secret");
    });
  });

  // ── getAccessToken / invalidate ─────────────────────────────────────────────

  describe("getAccessToken()", () => {
    it("returns cached token when still valid", async () => {
      const auth = new PKCEAuth(CFG, {
        accessToken: "valid-at",
        refreshToken: "rt",
        expiresAt: Date.now() + 3_600_000,
      });
      const token = await auth.getAccessToken();
      expect(token).toBe("valid-at");
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it("silently refreshes when expired", async () => {
      mockedAxios.post = jest.fn().mockResolvedValue(mockTokenRes("refreshed-at"));
      const auth = new PKCEAuth(CFG, {
        accessToken: "expired",
        refreshToken: "rt-1",
        expiresAt: 0,
      });
      const token = await auth.getAccessToken();
      expect(token).toBe("refreshed-at");
      const body: string = (mockedAxios.post as jest.Mock).mock.calls[0][1];
      // refresh does NOT include client_secret for PKCE
      expect(body).not.toContain("client_secret");
    });

    it("throws when no tokens are available and not yet exchanged", async () => {
      const auth = new PKCEAuth(CFG);
      await expect(auth.getAccessToken()).rejects.toThrow("Call exchangeCode() first");
    });
  });
});
