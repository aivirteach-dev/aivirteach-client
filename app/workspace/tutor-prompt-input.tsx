"use client";

import { type FormEvent, type KeyboardEvent, useLayoutEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group";
import { localize, useLearningLanguage } from "../lib/language";

export function TutorPromptInput({ value, onChange, onSubmit, disabled, busy }: {
  value: string; onChange: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; disabled: boolean; busy: boolean;
}) {
  const language = useLearningLanguage();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(160, input.scrollHeight)}px`;
  }, [value]);
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (!disabled && !busy && value.trim()) event.currentTarget.form?.requestSubmit();
  }
  return <form className="tutor-prompt" onSubmit={onSubmit}>
    <InputGroup>
      <InputGroupTextarea ref={inputRef} value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown} rows={1} disabled={disabled || busy} aria-label={localize(language, "Ask AIVir Teacher", "向 AIVir Teacher 提问")} placeholder={localize(language, "Ask about this course step...", "询问此课程步骤……")} />
      <InputGroupAddon align="block-end">
        <span className="tutor-input-hint">{localize(language, "Shift + Enter for a new line", "Shift + Enter 换行")}</span>
        <InputGroupButton variant="default" size="sm" type="submit" disabled={disabled || busy || !value.trim()} aria-label={localize(language, "Send", "发送")}><ArrowUp aria-hidden="true" />{busy ? localize(language, "Sending...", "发送中……") : localize(language, "Send", "发送")}</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </form>;
}
