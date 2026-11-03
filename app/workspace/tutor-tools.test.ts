import { describe, expect, it } from "vitest";
import { parseTutorToolEvent, reduceTutorTools } from "./tutor-tools";

describe("public diagnostic tool activity", () => {
  it("discards tools outside the current scope and private payloads", () => {
    expect(parseTutorToolEvent("tool_started", { tool: "run_command", command: "secret" })).toBeNull();
    expect(parseTutorToolEvent("tool_started", { tool: "get_vm_status", parameters: { token: "private" } })).toEqual({ kind: "started", tool: "get_vm_status" });
    expect(parseTutorToolEvent("tool_finished", { tool: "get_vm_status", status: "ok", duration_ms: -1 })).toBeNull();
    expect(parseTutorToolEvent("tool_finished", { tool: "get_vm_status", status: "ok", duration_ms: 25, raw_output: "private" })).toEqual({ kind: "finished", tool: "get_vm_status", status: "ok", durationMs: 25 });
  });
  it("keeps repeated calls separate and pairs completion with the earliest running call", () => {
    const started = reduceTutorTools([], { kind: "started", tool: "get_vm_status" });
    const twice = reduceTutorTools(started, { kind: "started", tool: "get_vm_status" });
    const finished = reduceTutorTools(twice, { kind: "finished", tool: "get_vm_status", status: "ok", durationMs: 25 });
    expect(finished).toEqual([{ id: 0, tool: "get_vm_status", status: "ok", durationMs: 25 }, { id: 1, tool: "get_vm_status", status: "running" }]);
    expect(reduceTutorTools([], { kind: "finished", tool: "get_guest_agent_status", status: "denied", durationMs: 1 })).toEqual([{ id: 0, tool: "get_guest_agent_status", status: "denied", durationMs: 1 }]);
  });
});
