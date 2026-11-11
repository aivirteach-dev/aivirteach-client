"use client";

import { useEffect, useRef } from "react";
import { api } from "../lib/api";

// Practice Time counts real minutes in the Learning Lab and sends them to the
// server's practice-session endpoint. Seconds not yet sent wait in the browser
// (the key is cleared with the course's other progress on restart).
export const practiceTickMs = 15_000;
export const practiceIdleMs = 5 * 60_000;
export const practiceSendEveryMinutes = 5;
const maxMinutesPerSession = 480;

export function practiceStorageKey(courseId: string) {
  return `aivirteach.lab.activeSeconds.${courseId}`;
}

type PracticeState = { visible: boolean; focused: boolean; vmRunning: boolean; msSinceInput: number };

/**
 * The learner is practising while the Lab is the visible, focused tab and either
 * the VM is running (typing inside the remote desktop never reaches this page)
 * or they used the page in the last few minutes.
 */
export function isPracticing({ visible, focused, vmRunning, msSinceInput }: PracticeState) {
  return visible && focused && (vmRunning || msSinceInput < practiceIdleMs);
}

/** Whole minutes ready to send from the stored seconds, or 0 if not enough yet. */
export function minutesToSend(storedSeconds: number, atLeastMinutes: number) {
  const minutes = Math.floor(storedSeconds / 60);
  return minutes >= atLeastMinutes ? Math.min(minutes, maxMinutesPerSession) : 0;
}

function readSeconds(key: string) {
  try {
    const value = Number(window.localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function writeSeconds(key: string, seconds: number) {
  try {
    if (seconds > 0) window.localStorage.setItem(key, String(Math.round(seconds)));
    else window.localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable (private windows); the minutes are then kept for this visit only.
  }
}

/** Records real Learning Lab time for the active course. */
export function usePracticeTimer(courseId: string | undefined, vmRunning: boolean) {
  const vmRunningRef = useRef(vmRunning);
  useEffect(() => { vmRunningRef.current = vmRunning; }, [vmRunning]);

  useEffect(() => {
    if (!courseId) return;
    const key = practiceStorageKey(courseId);
    let lastInput = Date.now();
    let sending = false;

    // Take the minutes out of storage before sending, so a request that finishes after the
    // tab closes is never counted twice; put them back if the server refuses them.
    async function send(atLeastMinutes: number, leaving = false) {
      if (sending) return;
      const minutes = minutesToSend(readSeconds(key), atLeastMinutes);
      if (!minutes) return;
      sending = true;
      writeSeconds(key, readSeconds(key) - minutes * 60);
      try {
        await api.recordPractice(minutes, { keepalive: leaving });
      } catch {
        writeSeconds(key, readSeconds(key) + minutes * 60);
      } finally {
        sending = false;
      }
    }

    function noteInput() { lastInput = Date.now(); }
    function onVisibilityChange() {
      // Hidden also covers reloading, closing, and leaving the page.
      if (document.visibilityState === "hidden") void send(1, true);
    }

    const interval = window.setInterval(() => {
      const practising = isPracticing({
        visible: document.visibilityState === "visible",
        focused: document.hasFocus(),
        vmRunning: vmRunningRef.current,
        msSinceInput: Date.now() - lastInput,
      });
      if (!practising) return;
      writeSeconds(key, readSeconds(key) + practiceTickMs / 1000);
      void send(practiceSendEveryMinutes);
    }, practiceTickMs);

    // Minutes left over from an earlier visit go first.
    void send(1);
    const inputEvents = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"] as const;
    for (const name of inputEvents) window.addEventListener(name, noteInput, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      for (const name of inputEvents) window.removeEventListener(name, noteInput);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void send(1, true);
    };
  }, [courseId]);
}
