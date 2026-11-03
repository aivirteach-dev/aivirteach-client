import { expect, it } from "vitest";
import { isThemeStyle, resolveThemeStyle } from "./theme-style";

it("accepts only the two selectable styles", () => {
  expect(isThemeStyle("v2")).toBe(true);
  expect(isThemeStyle("neubrutal")).toBe(true);
  expect(isThemeStyle("soft")).toBe(false);
});

it("maps retired saved preferences to the closest remaining style", () => {
  expect(resolveThemeStyle("v1")).toBe("v2");
  expect(resolveThemeStyle("soft")).toBe("v2");
  expect(resolveThemeStyle("soft-brutal")).toBe("neubrutal");
  expect(resolveThemeStyle("brutal")).toBe("neubrutal");
  expect(resolveThemeStyle(null, "v2")).toBe("v2");
});
