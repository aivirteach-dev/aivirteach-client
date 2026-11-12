"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";

export type TourStep = {
  id: string;
  /** CSS selector of the element to spotlight; without one (or when it is missing) the step is centred. */
  target?: string;
  title: string;
  body: string;
  /** For steps the learner completes themselves, e.g. "Click AIVirTeach to continue." */
  action?: string;
  /** True once the learner has done the step's action; the tour then moves on. */
  done?: boolean;
  /** On "look at this" steps: an element (or frame) the learner may still scroll inside the hole. */
  scroll?: string;
};

type Labels = { step: (current: number, total: number) => string; back: string; next: string; skip: string; finish: string };
type Rect = { x: number; y: number; width: number; height: number };

const holePadding = 6;
const holeRadius = 10;
const gap = 14;
const margin = 12;

function sameRect(a: Rect | null, b: Rect | null) {
  return a === b || (!!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height);
}

function targetRect(selector: string | undefined): Rect | null {
  if (!selector) return null;
  const element = document.querySelector(selector);
  if (!element) return null;
  const box = element.getBoundingClientRect();
  if (box.width === 0 && box.height === 0) return null;
  return { x: Math.round(box.left - holePadding), y: Math.round(box.top - holePadding), width: Math.round(box.width + holePadding * 2), height: Math.round(box.height + holePadding * 2) };
}

/** Passes a wheel or trackpad scroll over the hole to the element (or framed page) underneath. */
export function scrollTarget(selector: string, deltaX: number, deltaY: number) {
  const element = document.querySelector(selector);
  if (element instanceof HTMLIFrameElement) element.contentWindow?.scrollBy({ left: deltaX, top: deltaY });
  else element?.scrollBy({ left: deltaX, top: deltaY });
}

/** The shaded area: the whole window minus a rounded hole (even-odd fill leaves the hole empty). */
function shadePath(width: number, height: number, hole: Rect | null) {
  const outer = `M0 0H${width}V${height}H0Z`;
  if (!hole) return outer;
  const r = Math.min(holeRadius, hole.width / 2, hole.height / 2);
  const { x, y, width: w, height: h } = hole;
  return `${outer} M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
}

/** Puts the popover below the hole, else above, else beside it, and keeps it on screen. */
export function popoverPosition(hole: Rect | null, size: { width: number; height: number }, viewport: { width: number; height: number }) {
  const clampX = (x: number) => Math.min(Math.max(x, margin), viewport.width - size.width - margin);
  const clampY = (y: number) => Math.min(Math.max(y, margin), viewport.height - size.height - margin);
  if (!hole) return { left: clampX((viewport.width - size.width) / 2), top: clampY((viewport.height - size.height) / 2) };
  const centredX = clampX(hole.x + hole.width / 2 - size.width / 2);
  if (hole.y + hole.height + gap + size.height <= viewport.height - margin) return { left: centredX, top: hole.y + hole.height + gap };
  if (hole.y - gap - size.height >= margin) return { left: centredX, top: hole.y - gap - size.height };
  const centredY = clampY(hole.y + hole.height / 2 - size.height / 2);
  if (hole.x + hole.width + gap + size.width <= viewport.width - margin) return { left: hole.x + hole.width + gap, top: centredY };
  if (hole.x - gap - size.width >= margin) return { left: hole.x - gap - size.width, top: centredY };
  // The target fills the window (e.g. a large panel): sit over its lower part instead.
  return { left: centredX, top: clampY(hole.y + hole.height - size.height - gap) };
}

/**
 * A guided tour: a grey layer over the page with a hole around the current target.
 * The hole lets clicks through only on steps the learner completes themselves.
 */
export function LabTour({ steps, index, onIndexChange, onClose, labels }: {
  steps: TourStep[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: (finished: boolean) => void;
  labels: Labels;
}) {
  const titleId = useId();
  const bodyId = useId();
  const popoverRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const step = steps[index];
  const last = index === steps.length - 1;
  const [hole, setHole] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [size, setSize] = useState({ width: 340, height: 180 });

  // Follow the target every frame: panels resize, scroll, and move while the tour is open.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const next = targetRect(step?.target);
      setHole((current) => (sameRect(current, next) ? current : next));
      setViewport((current) => (current.width === window.innerWidth && current.height === window.innerHeight ? current : { width: window.innerWidth, height: window.innerHeight }));
      frame = window.requestAnimationFrame(tick);
    };
    tick();
    return () => window.cancelAnimationFrame(frame);
  }, [step?.target]);

  // Measure the popover so it can be placed beside the hole without leaving the window.
  useLayoutEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;
    const measure = () => {
      const box = popover.getBoundingClientRect();
      setSize((current) => (current.width === Math.round(box.width) && current.height === Math.round(box.height) ? current : { width: Math.round(box.width), height: Math.round(box.height) }));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(popover);
    return () => observer.disconnect();
  }, []);

  // Steps the learner completes move on by themselves, but only when they do it on that
  // step: going Back to an action that is already done shows Next instead.
  const [arrival, setArrival] = useState({ index, done: !!step?.done });
  if (arrival.index !== index) setArrival({ index, done: !!step?.done });
  const arrivedDone = arrival.index === index ? arrival.done : !!step?.done;
  useEffect(() => {
    if (step?.action && step.done && !arrivedDone && !last) onIndexChange(index + 1);
  }, [step?.action, step?.done, arrivedDone, index, last, onIndexChange]);

  useEffect(() => {
    (primaryRef.current ?? popoverRef.current)?.focus();
  }, [index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!step) return null;
  const position = popoverPosition(hole, size, viewport);
  const waiting = !!step.action && !step.done;

  return <div className="lab-tour" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={bodyId}>
    <svg className="lab-tour-layer" width={viewport.width} height={viewport.height} aria-hidden="true">
      <path className="lab-tour-shade" d={shadePath(viewport.width, viewport.height, hole)} fillRule="evenodd" />
      {hole && <rect className="lab-tour-ring" x={hole.x} y={hole.y} width={hole.width} height={hole.height} rx={holeRadius} />}
      {/* On "look at this" steps the highlighted control is not clickable. */}
      {hole && !step.action && <rect className="lab-tour-block" x={hole.x} y={hole.y} width={hole.width} height={hole.height} onWheel={step.scroll ? (event) => {
        // Scrolling still works there; clicks do not.
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
        scrollTarget(step.scroll!, event.deltaX * unit, event.deltaY * unit);
      } : undefined} />}
    </svg>
    <div ref={popoverRef} className="lab-tour-popover" style={{ left: position.left, top: position.top } as CSSProperties} tabIndex={-1}>
      <p className="lab-tour-count">{labels.step(index + 1, steps.length)}</p>
      <h2 id={titleId}>{step.title}</h2>
      <p id={bodyId}>{step.body}</p>
      {waiting && <p className="lab-tour-action" role="status">{step.action}</p>}
      <div className="lab-tour-actions">
        <Button variant="ghost" size="sm" type="button" onClick={() => onClose(false)}>{labels.skip}</Button>
        <span />
        {index > 0 && <Button variant="outline" size="sm" type="button" onClick={() => onIndexChange(index - 1)}>{labels.back}</Button>}
        {!waiting && <Button ref={primaryRef} size="sm" type="button" onClick={() => (last ? onClose(true) : onIndexChange(index + 1))}>{last ? labels.finish : labels.next}</Button>}
      </div>
    </div>
  </div>;
}
