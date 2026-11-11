import { defaultUiCustomization, sanitizeUiCustomization, type UiCustomization } from "./ui-customization";
import { isThemeStyle, resolveThemeStyle, type ThemeStyle } from "./theme-style";
import type { Theme } from "./theme";

const styleKeys = [
  "buttonHeight", "buttonFontSize", "buttonRadius", "buttonBorderWidth",
  "fieldHeight", "fieldFontSize", "fieldRadius", "fieldBorderWidth", "cardRadius", "cardPadding", "cardBorderWidth",
] as const satisfies readonly (keyof UiCustomization)[];

type StyleKey = (typeof styleKeys)[number];
export type ThemeStyleValues = Pick<UiCustomization, StyleKey>;
export type ThemePaletteValues = Omit<UiCustomization, StyleKey>;

const styleKeySet = new Set<string>(styleKeys);

function styleValues(settings: UiCustomization): ThemeStyleValues {
  return Object.fromEntries(styleKeys.map((key) => [key, settings[key]])) as ThemeStyleValues;
}

function paletteValues(settings: UiCustomization): ThemePaletteValues {
  return Object.fromEntries(Object.entries(settings).filter(([key]) => !styleKeySet.has(key))) as ThemePaletteValues;
}

export type ThemePresets = {
  schemaVersion: 2;
  interfaceVersion: ThemeStyle;
  theme: Theme;
  styles: Record<ThemeStyle, ThemeStyleValues>;
  palettes: Record<ThemeStyle, Record<Theme, ThemePaletteValues>>;
};

const modernBase: UiCustomization = {
  ...defaultUiCustomization,
  accentColor: "#2563eb",
  buttonBackground: "#2563eb",
  buttonText: "#ffffff",
  buttonFocusBackground: "#1d4ed8",
  buttonFocusText: "#ffffff",
  buttonRadius: 8,
  buttonBorderWidth: 1,
  fieldBackground: "#ffffff",
  fieldText: "#101827",
  fieldBorder: "#b9c6d8",
  fieldRadius: 8,
  fieldBorderWidth: 1,
  cardBackground: "#ffffff",
  cardBorder: "#dce5f2",
  overlayBackground: "#ffffff",
  overlayText: "#101827",
  overlayBorder: "#dce5f2",
  shellBackground: "#ffffff",
  shellText: "#101827",
  shellBorder: "#dce5f2",
  cardRadius: 12,
  cardBorderWidth: 1,
  lightBackground: "#f7faff",
  lightSurface: "#ffffff",
  lightSurfaceMuted: "#f1f5fc",
  lightText: "#101827",
  lightTextMuted: "#4b5870",
  lightBorder: "#b9c6d8",
  lightSecondary: "#e8edf5",
  statusSuccess: "#137547",
  statusWarning: "#9a6700",
  statusError: "#b42318",
  progressTrack: "#e8edf5",
  skeletonBackground: "#e8edf5",
  darkBackground: "#24272c",
  darkSurface: "#181a1e",
  darkSurfaceMuted: "#30343a",
  darkText: "#f4f5f6",
  darkTextMuted: "#bec2c8",
  darkBorder: "#595f68",
  darkPrimary: "#60a5fa",
  darkSecondary: "#7dd3fc",
  dashboardCourseCard: "inherit",
  dashboardStreakCard: "inherit",
  dashboardPracticeCard: "inherit",
  dashboardSkillsCard: "inherit",
  progressPracticeCard: "inherit",
  progressTasksCard: "inherit",
  progressGoalCard: "inherit",
  darkDashboardCourseCard: "inherit",
  darkDashboardStreakCard: "inherit",
  darkDashboardPracticeCard: "inherit",
  darkDashboardSkillsCard: "inherit",
  darkProgressPracticeCard: "inherit",
  darkProgressTasksCard: "inherit",
  darkProgressGoalCard: "inherit",
  darkProgressChartCard: "inherit",
  darkProgressAchievement1: "inherit",
  darkProgressAchievement2: "inherit",
  darkProgressAchievement3: "inherit",
  darkProgressAchievement4: "inherit",
};

function darkPreset(base: UiCustomization): UiCustomization {
  const modern = base === modernBase;
  return {
    ...base,
    menuItemHover: base.darkSurfaceMuted,
    statusSuccess: modern ? "#76dab0" : "#75e4b5",
    statusWarning: "#ffd479",
    statusError: modern ? "#ff9a91" : "#ffaaa5",
    progressTrack: base.darkSurfaceMuted,
    skeletonBackground: base.darkSurfaceMuted,
    buttonBackground: base.darkText,
    buttonText: base.darkBackground,
    fieldBackground: base.darkSurface,
    fieldText: base.darkText,
    fieldBorder: base.darkBorder,
    cardBackground: base.darkSurface,
    cardBorder: base.darkBorder,
    overlayBackground: base.darkSurface,
    overlayText: base.darkText,
    overlayBorder: base.darkBorder,
    shellBackground: base.darkSurface,
    shellText: base.darkText,
    shellBorder: base.darkBorder,
  };
}

export const defaultThemePresets: ThemePresets = {
  schemaVersion: 2,
  interfaceVersion: "neubrutal",
  theme: "light",
  styles: {
    v2: styleValues(modernBase),
    neubrutal: styleValues(defaultUiCustomization),
  },
  palettes: {
    v2: { light: paletteValues(modernBase), dark: paletteValues(darkPreset(modernBase)) },
    neubrutal: { light: paletteValues(defaultUiCustomization), dark: paletteValues(darkPreset(defaultUiCustomization)) },
  },
};

export function isThemeMode(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function sanitizeThemePresets(candidate: unknown): ThemePresets {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return defaultThemePresets;
  const source = candidate as Record<string, unknown>;
  const interfaceVersion = resolveThemeStyle(source.interfaceVersion);
  const theme = isThemeMode(source.theme) ? source.theme : "light";

  if (source.schemaVersion !== 2 || (!source.styles && !source.palettes && !source.presets)) {
    // The original JSON held both light and dark values in one flat object.
    const legacy = sanitizeUiCustomization(source as Partial<UiCustomization>, getThemePreset(defaultThemePresets, interfaceVersion, "light"));
    return {
      ...defaultThemePresets,
      interfaceVersion,
      theme,
      styles: { ...defaultThemePresets.styles, [interfaceVersion]: styleValues(legacy) },
      palettes: {
        ...defaultThemePresets.palettes,
        [interfaceVersion]: { light: paletteValues(legacy), dark: paletteValues(darkPreset(legacy)) },
      },
    };
  }

  const incomingStyles = source.styles && typeof source.styles === "object" ? source.styles as Record<string, unknown> : {};
  const incomingPalettes = source.palettes && typeof source.palettes === "object" ? source.palettes as Record<string, unknown> : {};
  // Accept the short-lived full-preset draft format used while this branch was being built.
  const fullPresets = source.presets && typeof source.presets === "object" ? source.presets as Record<string, unknown> : {};
  const styles = { ...defaultThemePresets.styles };
  const palettes = { ...defaultThemePresets.palettes };
  for (const style of ["v2", "neubrutal"] as const) {
    const oldPair = fullPresets[style] && typeof fullPresets[style] === "object" ? fullPresets[style] as Record<string, unknown> : {};
    const rawStyle = incomingStyles[style] ?? oldPair.light;
    const styleCandidate = rawStyle && typeof rawStyle === "object" ? rawStyle as Partial<UiCustomization> : {};
    styles[style] = styleValues(sanitizeUiCustomization(styleCandidate, getThemePreset(defaultThemePresets, style, "light")));
    const rawPair = incomingPalettes[style] && typeof incomingPalettes[style] === "object" ? incomingPalettes[style] as Record<string, unknown> : oldPair;
    palettes[style] = {
      light: paletteValues(sanitizeUiCustomization(rawPair.light && typeof rawPair.light === "object" ? rawPair.light as Partial<UiCustomization> : {}, getThemePreset(defaultThemePresets, style, "light"))),
      dark: paletteValues(sanitizeUiCustomization(rawPair.dark && typeof rawPair.dark === "object" ? rawPair.dark as Partial<UiCustomization> : {}, getThemePreset(defaultThemePresets, style, "dark"))),
    };
  }
  return { schemaVersion: 2, interfaceVersion, theme, styles, palettes };
}

export function getThemePreset(settings: ThemePresets, style: ThemeStyle, mode: Theme): UiCustomization {
  return { ...settings.styles[style], ...settings.palettes[style][mode] };
}

export function updateThemePreset<K extends keyof UiCustomization>(settings: ThemePresets, style: ThemeStyle, mode: Theme, key: K, value: UiCustomization[K]): ThemePresets {
  if (styleKeySet.has(key)) {
    return {
      ...settings,
      styles: { ...settings.styles, [style]: { ...settings.styles[style], [key]: value } },
    };
  }
  return {
    ...settings,
    palettes: {
      ...settings.palettes,
      [style]: {
        ...settings.palettes[style],
        [mode]: { ...settings.palettes[style][mode], [key]: value },
      },
    },
  };
}

export function replaceThemePreset(settings: ThemePresets, style: ThemeStyle, mode: Theme, values: UiCustomization): ThemePresets {
  return {
    ...settings,
    styles: { ...settings.styles, [style]: styleValues(values) },
    palettes: {
      ...settings.palettes,
      [style]: { ...settings.palettes[style], [mode]: paletteValues(values) },
    },
  };
}

export function validateThemeSelection(candidate: unknown): candidate is { interfaceVersion: ThemeStyle; theme: Theme } {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return false;
  const selected = candidate as Record<string, unknown>;
  return isThemeStyle(selected.interfaceVersion) && isThemeMode(selected.theme);
}

const previewStorageKey = "aivirteach-theme-presets-preview";
const changeEvent = "aivirteach:theme-presets-change";

export function getPreviewThemePresets(): ThemePresets | null {
  if (typeof window === "undefined") return null;
  const stored = window.sessionStorage.getItem(previewStorageKey);
  if (!stored) return null;
  try { return sanitizeThemePresets(JSON.parse(stored)); } catch { return null; }
}

export function previewThemePresets(settings: ThemePresets) {
  window.sessionStorage.setItem(previewStorageKey, JSON.stringify(settings));
  window.dispatchEvent(new Event(changeEvent));
}

export function clearThemePresetsPreview() {
  window.sessionStorage.removeItem(previewStorageKey);
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribeToThemePresets(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}
