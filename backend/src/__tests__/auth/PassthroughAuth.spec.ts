import { PassthroughAuth } from "../../auth/PassthroughAuth";

describe("PassthroughAuth", () => {
  it("returns the token supplied at construction", async () => {
    const auth = new PassthroughAuth("static-token");
    expect(await auth.getAccessToken()).toBe("static-token");
  });

  it("returns an updated token after update()", async () => {
    const auth = new PassthroughAuth("old");
    auth.update("new-token");
    expect(await auth.getAccessToken()).toBe("new-token");
  });

  it("invalidate() is a no-op and does not clear the token", async () => {
    const auth = new PassthroughAuth("keep-me");
    auth.invalidate();
    expect(await auth.getAccessToken()).toBe("keep-me");
  });
});
