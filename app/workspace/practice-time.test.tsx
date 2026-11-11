// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ recordPractice: vi.fn() }));
vi.mock("../lib/api", () => ({ api: { recordPractice: mocks.recordPractice } }));
import { isPracticing, minutesToSend, practiceStorageKey, usePracticeTimer } from "./practice-time";

const key = practiceStorageKey("course-1");
let visibility: DocumentVisibilityState = "visible";
let host: HTMLDivElement;
let root: Root;

function Timer({ vmRunning }: { vmRunning: boolean }) {
  usePracticeTimer("course-1", vmRunning);
  return null;
}

async function mount(vmRunning: boolean) {
  await act(async () => root.render(<Timer vmRunning={vmRunning} />));
}

async function advance(ms: number) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  vi.clearAllMocks();
  mocks.recordPractice.mockResolvedValue(undefined);
  window.localStorage.clear();
  visibility = "visible";
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => visibility });
  vi.spyOn(document, "hasFocus").mockReturnValue(true);
  host = document.createElement("div"); document.body.appendChild(host); root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("practice rules", () => {
  it("counts only a visible, focused Lab that is in use", () => {
    expect(isPracticing({ visible: true, focused: true, vmRunning: true, msSinceInput: 60 * 60_000 })).toBe(true);
    expect(isPracticing({ visible: true, focused: true, vmRunning: false, msSinceInput: 60_000 })).toBe(true);
    expect(isPracticing({ visible: true, focused: true, vmRunning: false, msSinceInput: 6 * 60_000 })).toBe(false);
    expect(isPracticing({ visible: false, focused: true, vmRunning: true, msSinceInput: 0 })).toBe(false);
    expect(isPracticing({ visible: true, focused: false, vmRunning: true, msSinceInput: 0 })).toBe(false);
  });

  it("sends whole minutes once there are enough", () => {
    expect(minutesToSend(299, 5)).toBe(0);
    expect(minutesToSend(330, 5)).toBe(5);
    expect(minutesToSend(59, 1)).toBe(0);
    expect(minutesToSend(10 * 60 * 60, 1)).toBe(480);
  });
});

describe("usePracticeTimer", () => {
  it("sends five real minutes while the VM is running", async () => {
    await mount(true);
    await advance(4 * 60_000 + 45_000);
    expect(mocks.recordPractice).not.toHaveBeenCalled();
    await advance(15_000);
    expect(mocks.recordPractice).toHaveBeenCalledWith(5, { keepalive: false });
    expect(window.localStorage.getItem(key)).toBeNull();
  });

  it("stops counting when nobody uses the page and no VM is running", async () => {
    await mount(false);
    await advance(10 * 60_000);
    expect(mocks.recordPractice).not.toHaveBeenCalled();
    expect(Number(window.localStorage.getItem(key))).toBe(285);
  });

  it("does not count a hidden tab, and sends what it has when the tab is hidden", async () => {
    await mount(true);
    await advance(2 * 60_000);
    visibility = "hidden";
    await act(async () => { document.dispatchEvent(new Event("visibilitychange")); });
    expect(mocks.recordPractice).toHaveBeenCalledWith(2, { keepalive: true });
    await advance(10 * 60_000);
    expect(mocks.recordPractice).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(key)).toBeNull();
  });

  it("keeps the minutes when the server refuses them", async () => {
    mocks.recordPractice.mockRejectedValue(new Error("offline"));
    await mount(true);
    await advance(5 * 60_000);
    expect(mocks.recordPractice).toHaveBeenCalledWith(5, { keepalive: false });
    expect(Number(window.localStorage.getItem(key))).toBe(300);
  });

  it("sends minutes left over from an earlier visit", async () => {
    window.localStorage.setItem(key, "150");
    await mount(false);
    expect(mocks.recordPractice).toHaveBeenCalledWith(2, { keepalive: false });
    expect(Number(window.localStorage.getItem(key))).toBe(30);
  });
});
