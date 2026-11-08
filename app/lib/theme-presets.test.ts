// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { clearThemePresetsPreview, defaultThemePresets, getPreviewThemePresets, getThemePreset, previewThemePresets, sanitizeThemePresets, updateThemePreset } from "./theme-presets";

afterEach(() => clearThemePresetsPreview());

it("migrates the flat committed theme into the selected style without changing the other style", () => {
  const settings = sanitizeThemePresets({ interfaceVersion: "neubrutal", theme: "light", dashboardCourseCard: "#123456", darkDashboardCourseCard: "#654321" });
  expect(getThemePreset(settings, "neubrutal", "light").dashboardCourseCard).toBe("#123456");
  expect(getThemePreset(settings, "neubrutal", "dark").darkDashboardCourseCard).toBe("#654321");
  expect(getThemePreset(settings, "v2", "light").dashboardCourseCard).toBe("inherit");
});

it("keeps edits independent across four combinations and restores the draft after navigation", () => {
  const settings = updateThemePreset(defaultThemePresets, "v2", "dark", "cardBackground", "#123456");
  previewThemePresets(settings);
  const restored = getPreviewThemePresets();
  expect(restored && getThemePreset(restored, "v2", "dark").cardBackground).toBe("#123456");
  expect(restored && getThemePreset(restored, "v2", "light").cardBackground).toBe("#ffffff");
  expect(restored && getThemePreset(restored, "neubrutal", "dark").cardBackground).not.toBe("#123456");
});

it("sanitizes each saved combination independently", () => {
  const settings = sanitizeThemePresets({ ...defaultThemePresets, interfaceVersion: "v2", styles: { ...defaultThemePresets.styles, v2: { buttonHeight: 200 } }, palettes: { ...defaultThemePresets.palettes, v2: { ...defaultThemePresets.palettes.v2, dark: { cardBackground: "invalid" } } } });
  expect(getThemePreset(settings, "v2", "dark").cardBackground).toBe(getThemePreset(defaultThemePresets, "v2", "dark").cardBackground);
  expect(getThemePreset(settings, "v2", "dark").buttonHeight).toBe(72);
  expect(getThemePreset(settings, "v2", "light").buttonHeight).toBe(72);
});

it("shares dimensions between a style's light and dark modes", () => {
  const settings = updateThemePreset(defaultThemePresets, "v2", "dark", "cardRadius", 22);
  expect(getThemePreset(settings, "v2", "light").cardRadius).toBe(22);
  expect(getThemePreset(settings, "v2", "dark").cardRadius).toBe(22);
  expect(getThemePreset(settings, "neubrutal", "dark").cardRadius).toBe(0);
});

it("shares border widths within a style and keeps the other style's widths", () => {
  const settings = updateThemePreset(defaultThemePresets, "v2", "dark", "cardBorderWidth", 2);
  expect(getThemePreset(settings, "v2", "light").cardBorderWidth).toBe(2);
  expect(getThemePreset(settings, "v2", "dark").cardBorderWidth).toBe(2);
  expect(getThemePreset(settings, "neubrutal", "dark").cardBorderWidth).toBe(3);
});

it("keeps foundation colors independent across styles and modes", () => {
  const settings = updateThemePreset(defaultThemePresets, "v2", "light", "lightBackground", "#abcdef");
  expect(getThemePreset(settings, "v2", "light").lightBackground).toBe("#abcdef");
  expect(getThemePreset(settings, "v2", "dark").lightBackground).not.toBe("#abcdef");
  expect(getThemePreset(settings, "neubrutal", "light").lightBackground).not.toBe("#abcdef");
});

it("keeps overlay role colors independent from the card default", () => {
  const settings = updateThemePreset(defaultThemePresets, "v2", "dark", "overlayBackground", "#123456");
  expect(getThemePreset(settings, "v2", "dark").overlayBackground).toBe("#123456");
  expect(getThemePreset(settings, "v2", "dark").cardBackground).toBe("#181a1e");
  expect(getThemePreset(settings, "v2", "light").overlayBackground).toBe("#ffffff");
});

it("inherits the general Card color only for roles without an override", () => {
  const settings = updateThemePreset(defaultThemePresets, "neubrutal", "light", "cardBackground", "#123456");
  const palette = getThemePreset(settings, "neubrutal", "light");
  expect(palette.progressChartCard).toBe("inherit");
  expect(palette.progressAchievement1).toBe("inherit");
  expect(palette.dashboardCourseCard).toBe("#ff6b6b");
  const override = updateThemePreset(settings, "neubrutal", "light", "progressChartCard", "#abcdef");
  expect(getThemePreset(override, "neubrutal", "light").progressChartCard).toBe("#abcdef");
  expect(getThemePreset(override, "neubrutal", "light").progressAchievement1).toBe("inherit");
});

it("keeps topbar colors independent from the overlay", () => {
  const settings = updateThemePreset(defaultThemePresets, "neubrutal", "dark", "shellBackground", "#123456");
  expect(getThemePreset(settings, "neubrutal", "dark").shellBackground).toBe("#123456");
  expect(getThemePreset(settings, "neubrutal", "dark").overlayBackground).toBe("#242129");
  expect(getThemePreset(settings, "neubrutal", "light").shellBackground).toBe("#ffffff");
});

it("uses a dark navigation hover surface in both dark palettes", () => {
  expect(getThemePreset(defaultThemePresets, "v2", "dark").menuItemHover).toBe("#30343a");
  expect(getThemePreset(defaultThemePresets, "neubrutal", "dark").menuItemHover).toBe("#34303b");
});

it("keeps code surface colors independent across the four palettes", () => {
  const settings = updateThemePreset(defaultThemePresets, "v2", "dark", "codeBackground", "#123456");
  expect(getThemePreset(settings, "v2", "dark").codeBackground).toBe("#123456");
  expect(getThemePreset(settings, "v2", "light").codeBackground).toBe("#171b22");
  expect(getThemePreset(settings, "neubrutal", "dark").codeBackground).toBe("#171b22");
});

it("keeps status and data colors independent across the four palettes", () => {
  const settings = updateThemePreset(defaultThemePresets, "v2", "dark", "statusError", "#123456");
  expect(getThemePreset(settings, "v2", "dark").statusError).toBe("#123456");
  expect(getThemePreset(settings, "v2", "light").statusError).toBe("#b42318");
  expect(getThemePreset(settings, "neubrutal", "dark").statusError).toBe("#ffaaa5");
});

it("gives each style a readable focused button text default", () => {
  expect(getThemePreset(defaultThemePresets, "v2", "light").buttonFocusText).toBe("#ffffff");
  expect(getThemePreset(defaultThemePresets, "v2", "dark").buttonFocusText).toBe("#ffffff");
  expect(getThemePreset(defaultThemePresets, "neubrutal", "light").buttonFocusText).toBe("#000000");
  expect(getThemePreset(defaultThemePresets, "neubrutal", "dark").buttonFocusText).toBe("#000000");
});
