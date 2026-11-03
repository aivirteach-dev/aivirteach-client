export const themeStyles = ["v2", "neubrutal"] as const;

export type ThemeStyle = (typeof themeStyles)[number];

export function isThemeStyle(value: unknown): value is ThemeStyle {
  return value === "v2" || value === "neubrutal";
}

/** Resolve preferences saved before the theme editor was limited to two styles. */
export function resolveThemeStyle(value: unknown, fallback: ThemeStyle = "neubrutal"): ThemeStyle {
  if (isThemeStyle(value)) return value;
  if (value === "v1" || value === "soft") return "v2";
  if (value === "soft-brutal" || value === "brutal") return "neubrutal";
  return fallback;
}
