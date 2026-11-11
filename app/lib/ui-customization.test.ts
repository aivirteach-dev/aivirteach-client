// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import {
  clearUiCustomization,
  clearUiCustomizationDraft,
  defaultUiCustomization,
  getPreviewUiCustomization,
  getStoredUiCustomization,
  previewDraftUiCustomization,
  previewUiCustomization,
  removeUiCustomizationPreview,
  saveUiCustomization,
} from "./ui-customization";

afterEach(() => clearUiCustomization());

it("adds defaults to older saved settings and drops removed ones", () => {
  localStorage.setItem("aivirteach-ui-customization", JSON.stringify({ buttonBackground: "#123456", learningPathButtonBackground: "#abcdef" }));
  const settings = getStoredUiCustomization();
  expect(settings?.buttonBackground).toBe("#123456");
  expect(settings?.buttonFocusBackground).toBe(defaultUiCustomization.buttonFocusBackground);
  expect(settings).not.toHaveProperty("learningPathButtonBackground");
});

it("persists the button style and clears it when the preview is removed", () => {
  const settings = { ...defaultUiCustomization, buttonFocusBackground: "#fedcba", buttonHeight: 58 };
  saveUiCustomization(settings);
  expect(getStoredUiCustomization()).toMatchObject({ buttonFocusBackground: "#fedcba", buttonHeight: 58 });
  expect(document.documentElement.style.getPropertyValue("--ui-button-focus-bg")).toBe("#fedcba");
  expect(document.documentElement.style.getPropertyValue("--ui-button-height")).toBe("58px");

  removeUiCustomizationPreview();
  expect(document.documentElement.style.getPropertyValue("--ui-button-height")).toBe("");
});

it("keeps an unsaved preview across navigation in the same tab", () => {
  previewDraftUiCustomization({ ...defaultUiCustomization, buttonFocusBackground: "#654321" });
  expect(getPreviewUiCustomization()?.buttonFocusBackground).toBe("#654321");
  expect(getStoredUiCustomization()).toBeNull();
  clearUiCustomizationDraft();
  expect(getPreviewUiCustomization()).toBeNull();
});

it("applies overlay role colors to the live preview", () => {
  previewUiCustomization({ ...defaultUiCustomization, overlayBackground: "#123456", overlayText: "#abcdef", overlayBorder: "#654321" });
  expect(document.documentElement.style.getPropertyValue("--ui-overlay-bg")).toBe("#123456");
  expect(document.documentElement.style.getPropertyValue("--ui-overlay-text")).toBe("#abcdef");
  expect(document.documentElement.style.getPropertyValue("--ui-overlay-border")).toBe("#654321");
});

it("applies code surface colors to the live preview", () => {
  previewUiCustomization({ ...defaultUiCustomization, codeBackground: "#123456", codeText: "#abcdef", codeBorder: "#654321" });
  expect(document.documentElement.style.getPropertyValue("--ui-code-bg")).toBe("#123456");
  expect(document.documentElement.style.getPropertyValue("--ui-code-text")).toBe("#abcdef");
  expect(document.documentElement.style.getPropertyValue("--ui-code-border")).toBe("#654321");
});

it("applies status and data colors to the live preview", () => {
  previewUiCustomization({ ...defaultUiCustomization, statusSuccess: "#123456", statusError: "#abcdef", progressTrack: "#654321", skeletonBackground: "#fedcba" });
  expect(document.documentElement.style.getPropertyValue("--ui-status-success")).toBe("#123456");
  expect(document.documentElement.style.getPropertyValue("--ui-status-error")).toBe("#abcdef");
  expect(document.documentElement.style.getPropertyValue("--ui-progress-track")).toBe("#654321");
  expect(document.documentElement.style.getPropertyValue("--ui-skeleton-bg")).toBe("#fedcba");
});

it("uses the Card default for inherited role colors and retains explicit overrides", () => {
  previewUiCustomization({ ...defaultUiCustomization, cardBackground: "#123456", progressChartCard: "inherit", dashboardCourseCard: "#abcdef" });
  expect(document.documentElement.style.getPropertyValue("--ui-card-bg")).toBe("#123456");
  expect(document.documentElement.style.getPropertyValue("--ui-progress-chart-card")).toBe("var(--ui-card-bg)");
  expect(document.documentElement.style.getPropertyValue("--ui-dashboard-course-card")).toBe("#abcdef");
});

it("previews the shared border widths in pixels", () => {
  previewUiCustomization({ ...defaultUiCustomization, buttonBorderWidth: 2, fieldBorderWidth: 1, cardBorderWidth: 5 });
  expect(document.documentElement.style.getPropertyValue("--ui-button-border-width")).toBe("2px");
  expect(document.documentElement.style.getPropertyValue("--ui-field-border-width")).toBe("1px");
  expect(document.documentElement.style.getPropertyValue("--ui-card-border-width")).toBe("5px");
});
