// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectVmCopy } from "./EmbeddedCoursePage";

type FakeWindow = Parameters<typeof connectVmCopy>[0] & { navigator: { clipboard?: { writeText: (text: string) => Promise<void> } } };

function fakePage(clipboard?: { writeText: (text: string) => Promise<void> }) {
  document.body.innerHTML = '<button class="copy-btn">Copy</button><div id="toast"></div>';
  return { navigator: { clipboard }, document, setTimeout: window.setTimeout.bind(window) } as unknown as FakeWindow;
}

// What the tutorial page does after a copy attempt: update the button and show a message.
function pageShowsCopied() {
  const button = document.querySelector<HTMLElement>(".copy-btn")!;
  button.textContent = "Copied!";
  button.classList.add("is-copied");
  document.getElementById("toast")!.textContent = "Code copied to clipboard.";
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("connectVmCopy", () => {
  it("sends each copy to the VM, then copies it in the browser, and says so", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const copyToVm = vi.fn().mockReturnValue(true);
    const page = fakePage({ writeText });
    connectVmCopy(page, { current: copyToVm });
    await page.navigator.clipboard!.writeText("sudo apt update");
    pageShowsCopied();
    await vi.runAllTimersAsync();
    expect(copyToVm).toHaveBeenCalledWith("sudo apt update");
    expect(writeText).toHaveBeenCalledWith("sudo apt update");
    expect(document.querySelector(".copy-btn")!.textContent).toBe("Copied! + VM");
    expect(document.getElementById("toast")!.textContent).toBe("Code copied to clipboard. + VM");
  });

  it("leaves the page's message alone when the VM is not connected", async () => {
    const page = fakePage({ writeText: vi.fn().mockResolvedValue(undefined) });
    connectVmCopy(page, { current: () => false });
    await page.navigator.clipboard!.writeText("code");
    pageShowsCopied();
    await vi.runAllTimersAsync();
    expect(document.getElementById("toast")!.textContent).toBe("Code copied to clipboard.");
  });

  it("still copies to the VM when the browser blocks the clipboard", async () => {
    const copyToVm = vi.fn().mockReturnValue(true);
    const page = fakePage({ writeText: vi.fn().mockRejectedValue(new Error("denied")) });
    connectVmCopy(page, { current: copyToVm });
    await expect(page.navigator.clipboard!.writeText("code")).rejects.toThrow("denied");
    expect(copyToVm).toHaveBeenCalledWith("code");
  });

  it("works on pages without a clipboard, so the page falls back as before", async () => {
    const copyToVm = vi.fn().mockReturnValue(true);
    const page = fakePage();
    connectVmCopy(page, { current: copyToVm });
    await expect(page.navigator.clipboard!.writeText("code")).rejects.toThrow();
    expect(copyToVm).toHaveBeenCalledWith("code");
  });

  it("wraps the clipboard only once per page", async () => {
    const copyToVm = vi.fn().mockReturnValue(true);
    const page = fakePage({ writeText: vi.fn().mockResolvedValue(undefined) });
    connectVmCopy(page, { current: copyToVm });
    connectVmCopy(page, { current: copyToVm });
    await page.navigator.clipboard!.writeText("code");
    expect(copyToVm).toHaveBeenCalledTimes(1);
  });
});
