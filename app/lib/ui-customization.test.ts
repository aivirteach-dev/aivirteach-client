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

it("adds Learning Path defaults to older saved settings", () => {
  localStorage.setItem("aivirteach-ui-customization", JSON.stringify({ buttonBackground: "#123456" }));
  const settings = getStoredUiCustomization();
  expect(settings?.buttonBackground).toBe("#123456");
  expect(settings?.learningPathButtonBackground).toBe(defaultUiCustomization.learningPathButtonBackground);
  expect(settings?.learningPathButtonFocusBackground).toBe(defaultUiCustomization.learningPathButtonFocusBackground);
  expect(settings?.learningPathButtonShadow).toBe(true);
});

it("persists the Learning Path style and previews the shadow toggle", () => {
  const settings = { ...defaultUiCustomization, learningPathButtonBackground: "#abcdef", learningPathButtonFocusBackground: "#fedcba", learningPathButtonHeight: 58, learningPathButtonShadow: false };
  saveUiCustomization(settings);
  expect(getStoredUiCustomization()).toMatchObject({ learningPathButtonBackground: "#abcdef", learningPathButtonFocusBackground: "#fedcba", learningPathButtonHeight: 58, learningPathButtonShadow: false });
  expect(document.documentElement.style.getPropertyValue("--ui-learning-path-button-focus-bg")).toBe("#fedcba");
  expect(document.documentElement.style.getPropertyValue("--ui-learning-path-button-height")).toBe("58px");
  expect(document.documentElement.style.getPropertyValue("--ui-learning-path-button-shadow")).toBe("none");

  previewUiCustomization({ ...settings, learningPathButtonShadow: true });
  expect(document.documentElement.style.getPropertyValue("--ui-learning-path-button-shadow")).toContain("3px 3px 0");
  removeUiCustomizationPreview();
  expect(document.documentElement.style.getPropertyValue("--ui-learning-path-button-shadow")).toBe("");
});

it("keeps an unsaved preview across navigation in the same tab", () => {
  previewDraftUiCustomization({ ...defaultUiCustomization, learningPathButtonBackground: "#654321" });
  expect(getPreviewUiCustomization()?.learningPathButtonBackground).toBe("#654321");
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
