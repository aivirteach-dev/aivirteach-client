// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { TutorConversation } from "./tutor-conversation";

describe("TutorConversation diagnosis details", () => {
  it("keeps legacy replies plain and lets a learner expand read-only details", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const messages = [
      { id: "old", role: "tutor" as const, text: "Older reply" },
      {
        id: "saved",
        role: "tutor" as const,
        text: "Saved reply",
        diagnosisDetails: {
          tools: [
            {
              tool: "get_vm_status" as const,
              status: "ok" as const,
              durationMs: 8,
            },
          ],
          evidence: [
            {
              id: "obs-001",
              tool: "get_vm_status" as const,
              summary: "VM status and reported IPv4 addresses were collected.",
              capturedAt: "2026-11-04T00:00:00.000Z",
            },
          ],
          suggestions: [
            { title: "Check service", detail: "Review the service status." },
          ],
        },
      },
    ];
    await act(async () => {
      root.render(
        <TutorConversation
          messages={messages}
          pending={false}
          status=""
          draft=""
          tools={[]}
        />,
      );
    });
    const toggles = host.querySelectorAll(".saved-diagnosis-details > summary");
    expect(toggles).toHaveLength(1);
    const details = toggles[0].parentElement;
    if (!(details instanceof HTMLDetailsElement))
      throw new Error("Expected a details disclosure.");
    expect(details.open).toBe(false);
    expect(host.textContent).toContain("Older reply");
    expect(host.textContent).toContain("Check service");
    await act(async () => {
      toggles[0].dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });
    expect(details.open).toBe(true);
    expect(host.textContent).toContain("Check service");
    expect(host.querySelector(".saved-diagnosis-details button")).toBeNull();
    await act(async () => {
      root.unmount();
    });
    host.remove();
    vi.unstubAllGlobals();
  });
});
