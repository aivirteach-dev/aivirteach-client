// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { UiCustomizationPreference } from "./UiCustomizationPreference";
import { clearThemePresetsPreview, defaultThemePresets, previewThemePresets, updateThemePreset } from "../lib/theme-presets";
import { clearInterfaceVersionPreview, previewInterfaceVersion } from "../lib/interface-version";
import { clearThemePreview, previewTheme } from "../lib/theme";
import { removeUiCustomizationPreview } from "../lib/ui-customization";

vi.mock("next/link", () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(async () => {
  if (root) await act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  clearThemePresetsPreview();
  clearInterfaceVersionPreview();
  clearThemePreview();
  removeUiCustomizationPreview();
  localStorage.clear();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

it("applies draft edits across the site, mode changes, and navigation", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  await act(() => {
    previewInterfaceVersion("v2");
    previewTheme("light");
    previewThemePresets(defaultThemePresets);
    root?.render(<UiCustomizationPreference />);
  });
  expect(document.documentElement.style.getPropertyValue("--ui-card-bg")).toBe("#ffffff");
  expect(container.textContent).toContain("Theme preview");

  const draft = updateThemePreset(defaultThemePresets, "v2", "light", "cardBackground", "#123456");
  await act(() => previewThemePresets(draft));
  expect(document.documentElement.style.getPropertyValue("--ui-card-bg")).toBe("#123456");

  await act(() => previewTheme("dark"));
  expect(document.documentElement.style.getPropertyValue("--ui-card-bg")).toBe("#181a1e");
  await act(() => previewTheme("light"));
  expect(document.documentElement.style.getPropertyValue("--ui-card-bg")).toBe("#123456");

  await act(() => root?.unmount());
  root = createRoot(container);
  await act(() => root?.render(<UiCustomizationPreference />));
  expect(document.documentElement.style.getPropertyValue("--ui-card-bg")).toBe("#123456");
});
