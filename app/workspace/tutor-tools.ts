export type DiagnosticTool = "get_vm_status" | "get_guest_agent_status";
export type TutorToolEvent =
  | { kind: "started"; tool: DiagnosticTool }
  | { kind: "finished"; tool: DiagnosticTool; status: "ok" | "error" | "denied" | "cached"; durationMs: number };
export type TutorTool = { id: number; tool: DiagnosticTool } & (
  | { status: "running" }
  | { status: "ok" | "error" | "denied" | "cached"; durationMs: number }
);

export function parseTutorToolEvent(event: string, data: Record<string, unknown>): TutorToolEvent | null {
  if (data.tool !== "get_vm_status" && data.tool !== "get_guest_agent_status") return null;
  if (event === "tool_started") return { kind: "started", tool: data.tool };
  if (event !== "tool_finished" || (data.status !== "ok" && data.status !== "error" && data.status !== "denied" && data.status !== "cached") || typeof data.duration_ms !== "number" || !Number.isFinite(data.duration_ms) || data.duration_ms < 0) return null;
  return { kind: "finished", tool: data.tool, status: data.status, durationMs: data.duration_ms };
}

export function reduceTutorTools(tools: readonly TutorTool[], event: TutorToolEvent): readonly TutorTool[] {
  if (event.kind === "started") return [...tools, { id: tools.length, tool: event.tool, status: "running" }];
  const pending = tools.findIndex((item) => item.tool === event.tool && item.status === "running");
  if (pending < 0) return [...tools, { id: tools.length, tool: event.tool, status: event.status, durationMs: event.durationMs }];
  return tools.map((item, index) => index === pending ? { id: item.id, tool: event.tool, status: event.status, durationMs: event.durationMs } : item);
}
