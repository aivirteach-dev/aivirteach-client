import committedSettings from "./site-ui-customization.json";
import { getStoredUiCustomization, type UiCustomization } from "./ui-customization";
import type { InterfaceVersion } from "./interface-version";
import type { Theme } from "./theme";
import { getThemePreset, sanitizeThemePresets, type ThemePresets } from "./theme-presets";

const hasCommittedSettings = Object.keys(committedSettings).length > 0;

export function getSavedThemePresets(): ThemePresets {
  return sanitizeThemePresets(committedSettings);
}

export function getSavedUiCustomization(style: InterfaceVersion = getCommittedInterfaceVersion(), mode: Theme = getCommittedTheme()): UiCustomization | null {
  if (hasCommittedSettings) return getThemePreset(getSavedThemePresets(), style, mode);
  return getStoredUiCustomization();
}

export function getCommittedInterfaceVersion(): InterfaceVersion {
  return getSavedThemePresets().interfaceVersion;
}

export function getCommittedTheme(): Theme {
  return getSavedThemePresets().theme;
}
