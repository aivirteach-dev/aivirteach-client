import { describe, expect, it, vi } from "vitest";
import { hasResumableSession } from "./resume-session";

describe("hasResumableSession", () => {
  it("resumes a saved login the server accepts", async () => {
    const me = vi.fn().mockResolvedValue({ userId: "u1", email: "a@example.edu" });
    await expect(hasResumableSession({ isLocal: false, hasSession: () => true, me })).resolves.toBe(true);
    expect(me).toHaveBeenCalledOnce();
  });

  it("keeps the login form when nothing is saved", async () => {
    const me = vi.fn();
    await expect(hasResumableSession({ isLocal: false, hasSession: () => false, me })).resolves.toBe(false);
    expect(me).not.toHaveBeenCalled();
  });

  it("keeps the login form when the saved login is no longer accepted", async () => {
    const me = vi.fn().mockRejectedValue(new Error("Please log in to continue."));
    await expect(hasResumableSession({ isLocal: false, hasSession: () => true, me })).resolves.toBe(false);
  });

  it("never skips the local demo's account picker", async () => {
    const me = vi.fn();
    await expect(hasResumableSession({ isLocal: true, hasSession: () => true, me })).resolves.toBe(false);
    expect(me).not.toHaveBeenCalled();
  });
});
