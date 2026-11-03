import type { DiagnosticTool } from "./tutor-tools";

export type DiagnosisDetails = {
  tools: Array<{
    tool: DiagnosticTool;
    status: "ok" | "error" | "denied" | "cached";
    durationMs: number;
  }>;
  evidence: Array<{
    id: string;
    tool: DiagnosticTool;
    summary: string;
    capturedAt: string;
  }>;
  suggestions: Array<{ title: string; detail: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTool(value: unknown): value is DiagnosticTool {
  return value === "get_vm_status" || value === "get_guest_agent_status";
}

function boundedString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const result = value.trim().slice(0, max);
  return result || undefined;
}

function parseTools(value: unknown): DiagnosisDetails["tools"] {
  if (!Array.isArray(value)) return [];
  const tools: DiagnosisDetails["tools"] = [];
  for (const entry of value.slice(0, 6)) {
    if (!isRecord(entry) || !isTool(entry.tool)) continue;
    if (
      entry.status !== "ok" &&
      entry.status !== "error" &&
      entry.status !== "denied" &&
      entry.status !== "cached"
    ) continue;
    if (typeof entry.durationMs !== "number" || !Number.isFinite(entry.durationMs) || entry.durationMs < 0) continue;
    tools.push({ tool: entry.tool, status: entry.status, durationMs: Math.min(Math.round(entry.durationMs), 86_400_000) });
  }
  return tools;
}

export function parseDiagnosisDetails(
  value: unknown,
): DiagnosisDetails | undefined {
  if (!isRecord(value)) return undefined;
  const tools = parseTools(value.tools);
  const evidence = Array.isArray(value.evidence)
    ? value.evidence.slice(0, 6).flatMap((entry) => {
        if (
          !isRecord(entry) ||
          !isTool(entry.tool) ||
          typeof entry.id !== "string" ||
          !/^obs-[A-Za-z0-9_-]{1,76}$/.test(entry.id)
        )
          return [];
        if (
          typeof entry.summary !== "string" ||
          entry.summary.trim().length > 2_000
        )
          return [];
        const summary = boundedString(entry.summary, 2_000);
        if (
          !summary ||
          typeof entry.capturedAt !== "string" ||
          !Number.isFinite(Date.parse(entry.capturedAt))
        )
          return [];
        return [
          {
            id: entry.id,
            tool: entry.tool,
            summary,
            capturedAt: new Date(entry.capturedAt).toISOString(),
          },
        ];
      })
    : [];
  const suggestions = Array.isArray(value.suggestions)
    ? value.suggestions.slice(0, 4).flatMap((entry) => {
        if (!isRecord(entry)) return [];
        if (
          typeof entry.title !== "string" ||
          entry.title.trim().length > 200 ||
          typeof entry.detail !== "string" ||
          entry.detail.trim().length > 2_000
        )
          return [];
        const title = boundedString(entry.title, 200);
        const detail = boundedString(entry.detail, 2_000);
        return title && detail ? [{ title, detail }] : [];
      })
    : [];
  return tools.length || evidence.length || suggestions.length
    ? { tools, evidence, suggestions }
    : undefined;
}
