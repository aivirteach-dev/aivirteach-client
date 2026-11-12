// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LabTour, popoverPosition, scrollTarget, type TourStep } from "./LabTour";
import { hasSeenLabTour, labTourSteps, markLabTourSeen } from "./lab-tour-steps";

const labels = { step: (current: number, total: number) => `Step ${current} of ${total}`, back: "Back", next: "Next", skip: "Skip tour", finish: "Done" };
const viewport = { width: 1000, height: 800 };
const size = { width: 300, height: 150 };

describe("popoverPosition", () => {
  it("centres the popover when there is no target", () => {
    expect(popoverPosition(null, size, viewport)).toEqual({ left: 350, top: 325 });
  });
  it("prefers below the hole, then above, then beside it", () => {
    expect(popoverPosition({ x: 100, y: 100, width: 200, height: 40 }, size, viewport)).toEqual({ left: 50, top: 154 });
    expect(popoverPosition({ x: 100, y: 600, width: 200, height: 100 }, size, viewport)).toEqual({ left: 50, top: 436 });
    expect(popoverPosition({ x: 20, y: 20, width: 400, height: 760 }, size, viewport)).toEqual({ left: 434, top: 325 });
  });
  it("stays inside the window", () => {
    const position = popoverPosition({ x: 940, y: 10, width: 50, height: 30 }, size, viewport);
    expect(position.left).toBe(viewport.width - size.width - 12);
  });
});

describe("LabTour", () => {
  let host: HTMLDivElement;
  let root: Root;
  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("requestAnimationFrame", () => 0);
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    host = document.createElement("div"); document.body.appendChild(host); root = createRoot(host);
  });
  afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });

  function Harness({ done, onClose }: { done: boolean; onClose: (finished: boolean) => void }) {
    const [index, setIndex] = useState(0);
    const steps: TourStep[] = [
      { id: "welcome", title: "Welcome", body: "Intro" },
      { id: "tab", target: "#tab", title: "Tutor", body: "Click it", action: "Click AIVirTeach to continue.", done },
      { id: "end", target: "#tab", title: "End", body: "Bye" },
    ];
    return <><button id="tab">AIVirTeach</button><LabTour steps={steps} index={index} onIndexChange={setIndex} onClose={onClose} labels={labels} /></>;
  }
  const button = (name: string) => [...host.querySelectorAll("button")].find((item) => item.textContent === name);

  it("walks through the steps, waiting for the learner on action steps", async () => {
    const onClose = vi.fn();
    await act(async () => root.render(<Harness done={false} onClose={onClose} />));
    expect(host.textContent).toContain("Step 1 of 3");
    await act(async () => button("Next")!.click());
    expect(host.textContent).toContain("Click AIVirTeach to continue.");
    expect(button("Next")).toBeUndefined();
    await act(async () => root.render(<Harness done onClose={onClose} />));
    expect(host.textContent).toContain("Step 3 of 3");
    await act(async () => button("Back")!.click());
    // Back on an action that is already done: offer Next instead of jumping ahead.
    expect(host.textContent).toContain("Step 2 of 3");
    expect(button("Next")).toBeDefined();
    await act(async () => button("Next")!.click());
    await act(async () => button("Done")!.click());
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it("closes without finishing on Skip or Escape", async () => {
    const onClose = vi.fn();
    await act(async () => root.render(<Harness done={false} onClose={onClose} />));
    await act(async () => button("Skip tour")!.click());
    await act(async () => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); });
    expect(onClose).toHaveBeenNthCalledWith(1, false);
    expect(onClose).toHaveBeenNthCalledWith(2, false);
  });
});

describe("Learning Lab tour steps", () => {
  beforeEach(() => window.localStorage.clear());

  it("remembers that the tour was seen", () => {
    expect(hasSeenLabTour()).toBe(false);
    markLabTourSeen();
    expect(hasSeenLabTour()).toBe(true);
  });

  it("moves past the tab steps once the learner switches tabs", () => {
    const t = (english: string) => english;
    const onPath = labTourSteps(t, { activeTab: "path", vm: "start-console", desktopStarted: false });
    const onTutor = labTourSteps(t, { activeTab: "teacher", vm: "start-console", desktopStarted: false });
    expect(onPath.find((step) => step.id === "tutor-tab")?.done).toBe(false);
    expect(onTutor.find((step) => step.id === "tutor-tab")?.done).toBe(true);
    expect(onTutor.find((step) => step.id === "path-tab")?.done).toBe(false);
    expect(onPath.every((step) => step.title && step.body)).toBe(true);
  });
});

describe("Learning Lab tour: lesson and VM steps", () => {
  const t = (english: string) => english;

  it("ends with the Learning VM, then the desktop", () => {
    const ids = labTourSteps(t, { activeTab: "path", vm: "start-console", desktopStarted: false }).map((step) => step.id);
    expect(ids.slice(-3)).toEqual(["replay", "vm", "desktop"]);
    expect(ids[1]).toBe("lesson");
  });

  it("asks the learner to start the remote desktop when it is ready", () => {
    const vm = (state: Parameters<typeof labTourSteps>[1]) => labTourSteps(t, state).find((step) => step.id === "vm")!;
    const ready = vm({ activeTab: "path", vm: "start-console", desktopStarted: false });
    expect(ready).toMatchObject({ target: ".vm-start-desktop", action: "Click Start remote desktop to continue.", done: false });
    expect(vm({ activeTab: "path", vm: "start-console", desktopStarted: true }).done).toBe(true);
    expect(vm({ activeTab: "path", vm: "console", desktopStarted: true })).toMatchObject({ target: ".lab-v2-vm", done: true });
  });

  it("explains the VM without an action while it is not ready", () => {
    for (const state of ["preparing", "stopped", "error"] as const) {
      const step = labTourSteps(t, { activeTab: "path", vm: state, desktopStarted: false }).find((item) => item.id === "vm")!;
      expect(step.action).toBeUndefined();
      expect(step.target).toBe(".lab-v2-vm");
    }
  });

  it("lets the lesson scroll during the lesson step", () => {
    const lesson = labTourSteps(t, { activeTab: "path", vm: "preparing", desktopStarted: false }).find((step) => step.id === "lesson")!;
    expect(lesson.action).toBeUndefined();
    expect(lesson.scroll).toContain(".lab-v2-embedded-course");
  });

  it("passes scrolling to the lesson panel or the framed tutorial", () => {
    document.body.innerHTML = '<div id="panel"></div><iframe id="frame"></iframe>';
    const panel = document.getElementById("panel")!;
    panel.scrollBy = vi.fn();
    scrollTarget("#panel", 0, 120);
    expect(panel.scrollBy).toHaveBeenCalledWith({ left: 0, top: 120 });
    const frameWindow = (document.getElementById("frame") as HTMLIFrameElement).contentWindow!;
    frameWindow.scrollBy = vi.fn();
    scrollTarget("#frame", 0, -80);
    expect(frameWindow.scrollBy).toHaveBeenCalledWith({ left: 0, top: -80 });
  });
});
