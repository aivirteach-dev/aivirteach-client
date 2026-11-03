"use client";

import { type ReactNode } from "react";
import { Check, LoaderCircle, Server, ShieldAlert } from "lucide-react";
import { Message, MessageContent } from "@/components/ui/message";
import { MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport } from "@/components/ui/message-scroller";
import { Trace, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";
import { localize, useLearningLanguage } from "../lib/language";
import type { ChatMessage } from "./chat-message-controller";
import { TutorMessage } from "./tutor-message";
import type { TutorTool } from "./tutor-tools";

export function TutorConversation({ messages, pending, status, draft, tools, children }: {
  messages: readonly ChatMessage[]; pending: boolean; status: string; draft: string; tools: readonly TutorTool[]; children?: ReactNode;
}) {
  const language = useLearningLanguage();
  return <MessageScrollerProvider defaultScrollPosition="end" autoScroll>
    <MessageScroller className="tutor-conversation">
      <MessageScrollerViewport aria-label={localize(language, "Tutor conversation", "教师对话")}>
        <MessageScrollerContent className="tutor-conversation-content">
          {messages.map((item, index) => <MessageScrollerItem key={item.id ?? `initial-${index}`} messageId={item.id ?? `initial-${index}`}>
            <Message className={`message ${item.role}`} align={item.role === "student" ? "end" : "start"}>
              <MessageContent>{item.role === "tutor" ? <TutorMessage text={item.text} /> : <p>{item.text}</p>}</MessageContent>
            </Message>
          </MessageScrollerItem>)}
          {pending && <MessageScrollerItem messageId="pending-reply">
            <Message className="message tutor pending"><MessageContent>
              <p className="tutor-reply-status" role="status">{status}</p>
              {tools.length > 0 && <Trace aria-label={localize(language, "Diagnostic tools for this reply", "本次回复的诊断工具")} className="tutor-tool-trace">
                {tools.map((tool) => <TraceLine key={tool.id} status={tool.status === "running" ? "running" : tool.status === "error" || tool.status === "denied" ? "error" : undefined}>
                  <TraceIcon>{tool.status === "running" ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : tool.status === "ok" || tool.status === "cached" ? <Check /> : <ShieldAlert />}</TraceIcon>
                  <TraceTitle><Server className="tutor-tool-icon" />{tool.tool === "get_vm_status" ? localize(language, "VM status", "虚拟机状态") : localize(language, "Guest agent status", "客户机代理状态")}</TraceTitle>
                  <TraceDescription>{tool.status === "running" ? localize(language, "Running", "执行中") : tool.status === "ok" ? localize(language, "Completed", "已完成") : tool.status === "cached" ? localize(language, "Cached", "已使用缓存") : tool.status === "denied" ? localize(language, "Denied", "未获授权") : localize(language, "Failed", "执行失败")}{"durationMs" in tool ? ` · ${Math.round(tool.durationMs)} ms` : ""}</TraceDescription>
                </TraceLine>)}
              </Trace>}
              {draft && <TutorMessage text={draft} />}
            </MessageContent></Message>
          </MessageScrollerItem>}
          {children}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton aria-label={localize(language, "Scroll to latest reply", "查看最新回复")} />
    </MessageScroller>
  </MessageScrollerProvider>;
}
