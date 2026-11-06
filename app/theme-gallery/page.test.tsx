// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import ThemeGalleryPage from "./page";
import { clearThemePresetsPreview, defaultThemePresets, getPreviewThemePresets, previewThemePresets } from "../lib/theme-presets";
import { clearInterfaceVersionPreview, getStoredInterfaceVersion, previewInterfaceVersion } from "../lib/interface-version";
import { clearThemePreview, previewTheme } from "../lib/theme";
import { removeUiCustomizationPreview } from "../lib/ui-customization";

vi.mock("next/link", () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

afterEach(() => {
  clearThemePresetsPreview();
  clearInterfaceVersionPreview();
  clearThemePreview();
  removeUiCustomizationPreview();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

it("keeps the original gallery sections while switching the live site style", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  previewInterfaceVersion("neubrutal");
  previewTheme("light");
  previewThemePresets(defaultThemePresets);
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  try {
    await act(async () => { root.render(<ThemeGalleryPage />); });
    expect(container.querySelector(".gallery-toolbar")).not.toBeNull();
    expect(container.querySelectorAll(".gallery-section")).toHaveLength(9);
    expect(container.querySelector('[data-ui-role="dashboard-course"]')).not.toBeNull();
    // Cast instead of querySelector<HTMLSelectElement>: the Workers `Element` type in work/worker-types.d.ts
    // conflicts with HTMLSelectElement.remove(index), so the generic constraint fails under tsc.
    const styleSelect = container.querySelector(".gallery-toolbar select") as HTMLSelectElement | null;
    expect(styleSelect?.value).toBe("neubrutal");
    await act(() => {
      if (!styleSelect) throw new Error("Missing style selector");
      styleSelect.value = "v2";
      styleSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(getStoredInterfaceVersion()).toBe("v2");
    expect(document.documentElement.dataset.interfaceVersion).toBe("v2");
    const radius = container.querySelector<HTMLInputElement>(".gallery-editor-grid input[type=range]");
    await act(() => {
      if (!radius) throw new Error("Missing card radius control");
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(radius, "20");
      radius.dispatchEvent(new Event("input", { bubbles: true }));
      radius.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(getPreviewThemePresets()?.styles.v2.cardRadius).toBe(20);
    expect(document.documentElement.style.getPropertyValue("--ui-card-radius")).toBe("20px");
  } finally {
    await act(() => root.unmount());
    container.remove();
  }
});
