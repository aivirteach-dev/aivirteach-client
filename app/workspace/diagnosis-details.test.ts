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

  it("accepts complete server-redacted suggestions within the public wire budgets", () => {
    const rawTitle = `Check ::1 ${"x".repeat(189)}`;
    const rawDetail = `Review ::1 ${"y".repeat(1_988)}`;
    const serverWireFixture = {
      suggestions: [
        {
          title: `Check [address] ${"x".repeat(189)}`,
          detail: `Review [address] ${"y".repeat(1_988)}`,
        },
      ],
    };

    expect(rawTitle).toHaveLength(199);
    expect(rawDetail).toHaveLength(1_999);
    expect(serverWireFixture.suggestions[0].title).toHaveLength(205);
    expect(serverWireFixture.suggestions[0].detail).toHaveLength(2_005);
    expect(parseDiagnosisDetails(serverWireFixture)?.suggestions).toEqual(
      serverWireFixture.suggestions,
    );
    expect(
      parseDiagnosisDetails({
        suggestions: [{ title: "x".repeat(1_001), detail: "Review" }],
      }),
    ).toBeUndefined();
    expect(
      parseDiagnosisDetails({
        suggestions: [{ title: "Check", detail: "x".repeat(10_001) }],
      }),
    ).toBeUndefined();
  });

  it("drops malformed details and suggestions over the public wire budget", () => {
    expect(parseDiagnosisDetails(null)).toBeUndefined();
    expect(
      parseDiagnosisDetails({
        suggestions: [{ title: "Check", detail: "x".repeat(10_001) }],
      }),
    ).toBeUndefined();
  });
});
