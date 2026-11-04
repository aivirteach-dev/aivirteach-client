import { parseDiagnosisDetails, type DiagnosisDetails } from "./diagnosis-details";

export type ChatStreamFrame =
  | { type: "progress"; event: string; data: Record<string, unknown> }
  | { type: "complete"; studentMessage: { text: string }; tutorMessage: { id?: string; text: string; diagnosisDetails?: DiagnosisDetails } };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTextMessage(value: unknown): value is Record<string, unknown> & { text: string } {
  return isRecord(value) && typeof value.text === "string";
}

export function parseChatStreamFrame(raw: string): ChatStreamFrame | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(data)) return null;
  if (data.type === "progress" && typeof data.event === "string" && isRecord(data.data)) {
    return { type: "progress", event: data.event, data: data.data };
  }
  if (data.type !== "complete" || !isTextMessage(data.studentMessage) || !isTextMessage(data.tutorMessage)) return null;
  const tutorMessage = data.tutorMessage;
  const id = typeof tutorMessage.id === "string" && tutorMessage.id.length <= 128 ? tutorMessage.id : undefined;
  const diagnosisDetails = parseDiagnosisDetails(tutorMessage.diagnosisDetails);
  return {
    type: "complete",
    studentMessage: { text: data.studentMessage.text },
    tutorMessage: { ...(id ? { id } : {}), text: tutorMessage.text, ...(diagnosisDetails ? { diagnosisDetails } : {}) },
  };
}
