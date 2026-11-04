"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { api } from "../lib/api";
import { chatMessagesKey, createChatMessageController, type ChatMessage } from "./chat-message-controller";
import { parseDiagnosisDetails } from "./diagnosis-details";

function toChatMessage(item: Awaited<ReturnType<typeof api.chatMessages>>[number]): ChatMessage {
  const diagnosisDetails = parseDiagnosisDetails(item.diagnosisDetails);
  return { id: item.id, role: item.role, text: item.text, ...(diagnosisDetails ? { diagnosisDetails } : {}) };
}

export function useChatMessages(enrollmentId: string | undefined, generation: number | undefined, initialMessages: readonly ChatMessage[]) {
  const [controller] = useState(() => createChatMessageController(initialMessages));
  const localId = useRef(0);
  const key = chatMessagesKey(enrollmentId, generation);
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);

  useEffect(() => {
    controller.activate(key);
    if (!key || !enrollmentId || generation === undefined) return;
    void controller.load(key, async () => {
      const items = await api.chatMessages(enrollmentId, generation);
      return items.map(toChatMessage);
    });
  }, [controller, enrollmentId, generation, key]);

  const appendMessage = useCallback((message: ChatMessage) => controller.append(key, { ...message, id: message.id ?? `local-${key}-${localId.current++}` }), [controller, key]);
  const loadMessages = useCallback((emptyFallback?: readonly ChatMessage[]) => {
    if (!key || !enrollmentId || generation === undefined) return Promise.resolve(false);
    return controller.load(key, async () => {
      const items = await api.chatMessages(enrollmentId, generation);
      return items.map(toChatMessage);
    }, emptyFallback);
  }, [controller, enrollmentId, generation, key]);

  return {
    messages: snapshot.key === key ? snapshot.messages : initialMessages,
    appendMessage,
    loadMessages,
  };
}
