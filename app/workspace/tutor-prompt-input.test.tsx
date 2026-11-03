// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { TutorPromptInput } from "./tutor-prompt-input";

describe("tutor multiline prompt", () => {
  it("submits Enter but preserves Shift+Enter and IME composition", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const host = document.createElement("div"); document.body.appendChild(host);
    const root = createRoot(host); const submit = vi.fn((event) => event.preventDefault());
    await act(async () => { root.render(<TutorPromptInput value="question" onChange={() => {}} onSubmit={submit} disabled={false} busy={false} />); });
    const textarea = host.querySelector("textarea")!;
    await act(async () => { textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true })); });
    await act(async () => { textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true })); });
    expect(submit).not.toHaveBeenCalled();
    await act(async () => { textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })); });
    expect(submit).toHaveBeenCalledTimes(1);
    await act(async () => { root.unmount(); }); host.remove(); vi.unstubAllGlobals();
  });
  it("disables submission for empty input and an active reply", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const host = document.createElement("div"); document.body.appendChild(host); const root = createRoot(host);
    await act(async () => { root.render(<TutorPromptInput value="  " onChange={() => {}} onSubmit={() => {}} disabled={false} busy={false} />); });
    expect(host.querySelector("button")?.disabled).toBe(true);
    await act(async () => { root.render(<TutorPromptInput value="question" onChange={() => {}} onSubmit={() => {}} disabled={false} busy={true} />); });
    expect(host.querySelector("textarea")?.disabled).toBe(true);
    expect(host.querySelector("button")?.disabled).toBe(true);
    await act(async () => { root.unmount(); }); host.remove(); vi.unstubAllGlobals();
  });
});
