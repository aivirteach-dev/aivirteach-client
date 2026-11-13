// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import type { PopoverDOM } from "driver.js";
import { hasSeenLabTour, labTourSteps, markLabTourSeen, vmStepText, type LabTourState } from "./lab-tour-steps";

const t = (english: string) => english;

describe("Learning Lab tour steps", () => {
  beforeEach(() => window.localStorage.clear());

  it("remembers that the tour was seen", () => {
    expect(hasSeenLabTour()).toBe(false);
    markLabTourSeen();
    expect(hasSeenLabTour()).toBe(true);
  });

  it("opens with a welcome and ends with the Learning VM, then the desktop", () => {
    const steps = labTourSteps(t, () => ({ vm: "preparing" }));
    expect(steps).toHaveLength(11);
    expect(steps[0].element).toBeUndefined();
    expect(steps[1].element).toBe(".lab-v2-path");
    expect(steps.map((step) => step.popover?.title).slice(-2)).toEqual(["Your Learning VM", "Your Ubuntu desktop"]);
  });

  it("waits for the learner to click the AIVirTeach and Learning Path tabs", () => {
    const steps = labTourSteps(t, () => ({ vm: "preparing" }));
    for (const index of [2, 4]) {
      expect(steps[index]).toMatchObject({ advanceOnClick: true, disableActiveInteraction: false });
      expect(steps[index].popover?.showButtons).toEqual(["previous", "close"]);
      expect(steps[index].popover?.description).toContain("to continue.");
    }
    expect(steps[1].disableActiveInteraction).toBe(true);
    expect(steps[3].waitForElement).toBeGreaterThan(0);
  });

  it("fills in the VM step for the VM's state when the learner reaches it", () => {
    const lab: { current: LabTourState } = { current: { vm: "preparing" } };
    const vmStep = labTourSteps(t, () => lab.current)[9];
    const render = () => {
      const popover = { description: document.createElement("div"), nextButton: document.createElement("button") } as unknown as PopoverDOM;
      vmStep.popover!.onPopoverRender!(popover, {} as never);
      return popover;
    };
    let popover = render();
    expect(popover.description.textContent).toContain("still getting ready");
    expect(popover.description.style.display).toBe("block");
    expect(popover.nextButton.style.display).toBe("");
    lab.current = { vm: "start-console" };
    popover = render();
    expect(popover.description.textContent).toContain("Click Start remote desktop to continue.");
    expect(popover.nextButton.style.display).toBe("none");
  });

  it("explains each VM state", () => {
    expect(vmStepText(t, "start-console").instruction).toBe("Click Start remote desktop to continue.");
    expect(vmStepText(t, "console").description).toContain("already open");
    expect(vmStepText(t, "stopped").description).toContain("Resume learning environment");
    expect(vmStepText(t, "error").description).toContain("Retry");
    for (const state of ["console", "stopped", "error", "preparing"] as const) expect(vmStepText(t, state).instruction).toBeUndefined();
  });
});
