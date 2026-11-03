import { describe, expect, it } from "vitest";
import { parseDiagnosisDetails } from "./diagnosis-details";

describe("parseDiagnosisDetails", () => {
  it("keeps only bounded public fields and approved tool/status values", () => {
    expect(
      parseDiagnosisDetails({
        tools: [
          {
            tool: "get_vm_status",
            status: "ok",
            durationMs: 4,
            args: "private",
          },
          { tool: "run_shell", status: "ok", durationMs: 1 },
        ],
        evidence: [
          {
            id: "obs-001",
            tool: "get_vm_status",
            summary: "safe",
            capturedAt: "2026-11-04T00:00:00Z",
            raw: "private",
          },
        ],
        suggestions: [
          { title: "Check", detail: "Review status", execute: true },
        ],
        limitations: ["INTERNAL_CODE"],
      }),
    ).toEqual({
      tools: [{ tool: "get_vm_status", status: "ok", durationMs: 4 }],
      evidence: [
        {
          id: "obs-001",
          tool: "get_vm_status",
          summary: "safe",
          capturedAt: "2026-11-04T00:00:00.000Z",
        },
      ],
      suggestions: [{ title: "Check", detail: "Review status" }],
    });
  });

  it("drops malformed details and overlong suggestions instead of showing partial instructions", () => {
    expect(parseDiagnosisDetails(null)).toBeUndefined();
    expect(
      parseDiagnosisDetails({
        suggestions: [{ title: "Check", detail: "x".repeat(2_001) }],
      }),
    ).toBeUndefined();
  });
});
