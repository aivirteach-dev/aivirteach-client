// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";

vi.mock("./site-ui-customization.json", () => ({ default: { interfaceVersion: "soft", theme: "dark", buttonFocusBackground: "#345678" } }));

import { getCommittedInterfaceVersion, getCommittedTheme, getSavedUiCustomization } from "./site-ui-customization";

afterEach(() => localStorage.clear());

it("loads the committed theme ahead of older browser-only settings", () => {
  localStorage.setItem("aivirteach-ui-customization", JSON.stringify({ buttonFocusBackground: "#abcdef" }));
  expect(getSavedUiCustomization()?.buttonFocusBackground).toBe("#345678");
  expect(getCommittedInterfaceVersion()).toBe("v2");
  expect(getCommittedTheme()).toBe("dark");
});
