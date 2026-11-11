"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { CopyToVm } from "../components/lesson-blocks/copy-code";

const themeStyleId = "aivirteach-site-theme";

/** Reads the site's current theme colours so the embedded page can use them. */
function siteThemeCss() {
  const root = document.documentElement;
  const computed = getComputedStyle(root);
  const token = (name: string, fallback: string) => computed.getPropertyValue(name).trim() || fallback;
  const neubrutal = root.dataset.interfaceVersion === "neubrutal";
  const dark = root.dataset.theme === "dark";
  const ink = token("--ink", "#101827");
  const inkSoft = token("--ink-soft", "#4b5870");
  const surface = token("--surface", "#f7faff");
  const surfaceLowest = token("--surface-lowest", "#ffffff");
  const surfaceContainer = token("--surface-container", "#e8edf5");
  const outline = token("--outline", "#b9c6d8");
  const primary = token("--primary", "#0066cc");
  const accent = neubrutal ? token("--primary-pale", "#ffe66d") : token("--amber", "#fe932c");
  const success = token("--ui-status-success", "#22694f");
  const codeBg = token("--ui-code-bg", "#171c1d");
  const codeText = token("--ui-code-text", "#e8eef0");
  const font = getComputedStyle(document.body).fontFamily;
  const line = neubrutal ? `3px solid ${ink}` : `1px solid ${outline}`;

  return `
:root:root {
  color-scheme: ${dark ? "dark" : "light"};
  --color-bg: ${surface};
  --color-surface: ${surfaceLowest};
  --color-inset: ${surfaceContainer};
  --color-text: ${ink};
  --color-copy: ${inkSoft};
  --color-muted: ${inkSoft};
  --color-border: ${outline};
  --color-edge: ${ink};
  --color-shadow: ${outline};
  --color-primary: ${primary};
  --color-primary-hover: color-mix(in srgb, ${primary} 82%, ${ink});
  --color-primary-soft: color-mix(in srgb, ${primary} 12%, ${surfaceLowest});
  --color-primary-border: color-mix(in srgb, ${primary} 38%, ${surfaceLowest});
  --color-accent: ${accent};
  --color-accent-soft: color-mix(in srgb, ${accent} 22%, ${surfaceLowest});
  --color-accent-text: color-mix(in srgb, ${accent} 40%, ${ink});
  --color-success: color-mix(in srgb, ${success} 70%, ${ink});
  --color-success-soft: color-mix(in srgb, ${success} 14%, ${surfaceLowest});
  --color-success-mark: color-mix(in srgb, ${success} 45%, ${surfaceLowest});
  --color-code: ${codeBg};
  --color-code-header: color-mix(in srgb, ${codeBg} 88%, #000);
  --color-code-line: color-mix(in srgb, ${codeText} 22%, ${codeBg});
  --line: ${line};
  --shadow: ${neubrutal ? `4px 4px 0 ${ink}` : "none"};
  --radius: ${neubrutal ? "0px" : "12px"};
  --v3-radius: ${neubrutal ? "0px" : "12px"};
}
html body.ui-v3 { font-family: ${font}; background: ${surface}; color: ${ink}; }
`;
}

function applyTheme(frame: HTMLIFrameElement | null) {
  const doc = frame?.contentDocument;
  if (!doc?.head) return;
  let style = doc.getElementById(themeStyleId) as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement("style");
    style.id = themeStyleId;
  }
  style.textContent = siteThemeCss();
  // Last in the document so it wins over the page's own rules.
  doc.body?.appendChild(style);
}

const vmMark = " + VM";

// After the page shows its own "Copied" button label and message, note that the VM has it too.
function markVmCopy(doc: Document) {
  const toast = doc.getElementById("toast");
  if (toast?.textContent && !toast.textContent.endsWith(vmMark)) toast.textContent += vmMark;
  doc.querySelectorAll<HTMLElement>(".is-copied").forEach((button) => {
    if (!button.textContent?.endsWith(vmMark)) button.textContent += vmMark;
  });
}

type VmCopyWindow = Window & { __aivirteachVmCopy?: true };

/**
 * Every copy on the page goes through navigator.clipboard.writeText (or its own fallback
 * when that fails), so wrapping it sends the same text to the VM's clipboard first.
 */
export function connectVmCopy(win: VmCopyWindow | null, copyToVm: RefObject<CopyToVm | undefined>) {
  if (!win || win.__aivirteachVmCopy) return;
  win.__aivirteachVmCopy = true;
  const clipboard = win.navigator.clipboard as Clipboard | undefined;
  const original = clipboard?.writeText ? clipboard.writeText.bind(clipboard) : null;
  async function writeText(text: string) {
    let vmCopied = false;
    try { vmCopied = copyToVm.current?.(text) ?? false; } catch { /* the page still copies locally */ }
    try {
      if (!original) throw new Error("Clipboard unavailable");
      await original(text);
    } finally {
      // Runs after the page has updated its button and message, whether or not it fell back.
      if (vmCopied) win!.setTimeout(() => markVmCopy(win!.document), 0);
    }
  }
  if (clipboard) Object.defineProperty(clipboard, "writeText", { configurable: true, value: writeText });
  else Object.defineProperty(win.navigator, "clipboard", { configurable: true, value: { writeText } });
}

/**
 * A tutorial page shown as-is in the Learning Path, recoloured to the site theme.
 * Reports the section the learner opens (the page's own lesson ids), and also copies code to the VM.
 */
export function EmbeddedCoursePage({ src, title, copyToVm, onSectionChange }: { src: string; title: string; copyToVm?: CopyToVm; onSectionChange: (sectionId: string) => void }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const copyToVmRef = useRef(copyToVm);
  useEffect(() => { copyToVmRef.current = copyToVm; }, [copyToVm]);
  const onSectionChangeRef = useRef(onSectionChange);
  useEffect(() => { onSectionChangeRef.current = onSectionChange; }, [onSectionChange]);

  // Follow the site theme: style, colour mode, and theme-editor colours all live on <html>.
  useEffect(() => {
    const observer = new MutationObserver(() => applyTheme(frameRef.current));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-interface-version", "data-ui-customized", "style", "class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let sectionObserver: MutationObserver | null = null;
    function connect() {
      applyTheme(frame);
      connectVmCopy(frame?.contentWindow ?? null, copyToVmRef);
      sectionObserver?.disconnect();
      const content = frame?.contentDocument?.getElementById("lessonContent");
      if (!content) return;
      const report = () => { if (content.dataset.lessonId) onSectionChangeRef.current(content.dataset.lessonId); };
      sectionObserver = new MutationObserver(report);
      sectionObserver.observe(content, { attributes: true, attributeFilter: ["data-lesson-id"] });
      report();
    }
    frame.addEventListener("load", connect);
    if (frame.contentDocument?.readyState === "complete") connect();
    return () => {
      frame.removeEventListener("load", connect);
      sectionObserver?.disconnect();
    };
  }, [src]);

  return <iframe ref={frameRef} className="lab-v2-embedded-course" src={src} title={title} />;
}
