export type UiCustomization = {
  accentColor: string;
  menuItemHover: string;
  buttonBackground: string;
  buttonText: string;
  buttonFocusBackground: string;
  buttonFocusText: string;
  buttonHeight: number;
  buttonFontSize: number;
  buttonRadius: number;
  buttonBorderWidth: number;
  learningPathButtonBackground: string;
  learningPathButtonFocusBackground: string;
  learningPathButtonText: string;
  learningPathButtonBorder: string;
  learningPathButtonHeight: number;
  learningPathButtonFontSize: number;
  learningPathButtonRadius: number;
  learningPathButtonShadow: boolean;
  fieldBackground: string;
  fieldText: string;
  fieldBorder: string;
  focusBorder: string;
  fieldHeight: number;
  fieldFontSize: number;
  fieldRadius: number;
  fieldBorderWidth: number;
  cardBackground: string;
  cardBorder: string;
  overlayBackground: string;
  overlayText: string;
  overlayBorder: string;
  shellBackground: string;
  shellText: string;
  shellBorder: string;
  codeBackground: string;
  codeText: string;
  codeBorder: string;
  statusSuccess: string;
  statusWarning: string;
  statusError: string;
  progressTrack: string;
  skeletonBackground: string;
  cardRadius: number;
  cardPadding: number;
  cardBorderWidth: number;
  lightBackground: string;
  lightSurface: string;
  lightSurfaceMuted: string;
  lightText: string;
  lightTextMuted: string;
  lightBorder: string;
  lightSecondary: string;
  darkBackground: string;
  darkSurface: string;
  darkSurfaceMuted: string;
  darkText: string;
  darkTextMuted: string;
  darkBorder: string;
  darkPrimary: string;
  darkSecondary: string;
  dashboardCourseCard: string;
  dashboardStreakCard: string;
  dashboardPracticeCard: string;
  dashboardSkillsCard: string;
  progressPracticeCard: string;
  progressTasksCard: string;
  progressGoalCard: string;
  progressChartCard: string;
  progressAchievement1: string;
  progressAchievement2: string;
  progressAchievement3: string;
  progressAchievement4: string;
  darkDashboardCourseCard: string;
  darkDashboardStreakCard: string;
  darkDashboardPracticeCard: string;
  darkDashboardSkillsCard: string;
  darkProgressPracticeCard: string;
  darkProgressTasksCard: string;
  darkProgressGoalCard: string;
  darkProgressChartCard: string;
  darkProgressAchievement1: string;
  darkProgressAchievement2: string;
  darkProgressAchievement3: string;
  darkProgressAchievement4: string;
};

export const cardRoleColorKeys = [
  "dashboardCourseCard", "dashboardStreakCard", "dashboardPracticeCard", "dashboardSkillsCard",
  "progressPracticeCard", "progressTasksCard", "progressGoalCard", "progressChartCard",
  "progressAchievement1", "progressAchievement2", "progressAchievement3", "progressAchievement4",
  "darkDashboardCourseCard", "darkDashboardStreakCard", "darkDashboardPracticeCard", "darkDashboardSkillsCard",
  "darkProgressPracticeCard", "darkProgressTasksCard", "darkProgressGoalCard", "darkProgressChartCard",
  "darkProgressAchievement1", "darkProgressAchievement2", "darkProgressAchievement3", "darkProgressAchievement4",
] as const satisfies readonly (keyof UiCustomization)[];

export type CardRoleColorKey = (typeof cardRoleColorKeys)[number];
const cardRoleColorKeySet = new Set<keyof UiCustomization>(cardRoleColorKeys);

export const defaultUiCustomization: UiCustomization = {
  accentColor: "#2563eb",
  menuItemHover: "#d1d5db",
  buttonBackground: "#000000",
  buttonText: "#ffffff",
  buttonFocusBackground: "#ffe66d",
  buttonFocusText: "#000000",
  buttonHeight: 42,
  buttonFontSize: 14,
  buttonRadius: 0,
  buttonBorderWidth: 3,
  learningPathButtonBackground: "#ffe66d",
  learningPathButtonFocusBackground: "#facc15",
  learningPathButtonText: "#000000",
  learningPathButtonBorder: "#000000",
  learningPathButtonHeight: 42,
  learningPathButtonFontSize: 14,
  learningPathButtonRadius: 4,
  learningPathButtonShadow: true,
  fieldBackground: "#ffffff",
  fieldText: "#000000",
  fieldBorder: "#000000",
  focusBorder: "#93c5fd",
  fieldHeight: 46,
  fieldFontSize: 16,
  fieldRadius: 0,
  fieldBorderWidth: 3,
  cardBackground: "#ffffff",
  cardBorder: "#000000",
  overlayBackground: "#ffffff",
  overlayText: "#000000",
  overlayBorder: "#000000",
  shellBackground: "#ffffff",
  shellText: "#000000",
  shellBorder: "#000000",
  codeBackground: "#171b22",
  codeText: "#d9e8ff",
  codeBorder: "#101318",
  statusSuccess: "#075d3a",
  statusWarning: "#904d00",
  statusError: "#a52d27",
  progressTrack: "#ffe66d",
  skeletonBackground: "#e8e8e8",
  cardRadius: 0,
  cardPadding: 24,
  cardBorderWidth: 3,
  lightBackground: "#fff8e7",
  lightSurface: "#ffffff",
  lightSurfaceMuted: "#ffe66d",
  lightText: "#000000",
  lightTextMuted: "#222222",
  lightBorder: "#000000",
  lightSecondary: "#4ecdc4",
  darkBackground: "#141218",
  darkSurface: "#242129",
  darkSurfaceMuted: "#34303b",
  darkText: "#fff8e7",
  darkTextMuted: "#cfc7d8",
  darkBorder: "#fff8e7",
  darkPrimary: "#ff7b7b",
  darkSecondary: "#5ee1d7",
  dashboardCourseCard: "#ff6b6b",
  dashboardStreakCard: "#4ecdc4",
  dashboardPracticeCard: "#ffe66d",
  dashboardSkillsCard: "#a8e6cf",
  progressPracticeCard: "#4ecdc4",
  progressTasksCard: "#ffe66d",
  progressGoalCard: "#a8e6cf",
  progressChartCard: "inherit",
  progressAchievement1: "inherit",
  progressAchievement2: "inherit",
  progressAchievement3: "inherit",
  progressAchievement4: "inherit",
  darkDashboardCourseCard: "#ff7b7b",
  darkDashboardStreakCard: "#5ee1d7",
  darkDashboardPracticeCard: "#34303b",
  darkDashboardSkillsCard: "#355b5d",
  darkProgressPracticeCard: "#5ee1d7",
  darkProgressTasksCard: "#34303b",
  darkProgressGoalCard: "#355b5d",
  darkProgressChartCard: "inherit",
  darkProgressAchievement1: "inherit",
  darkProgressAchievement2: "inherit",
  darkProgressAchievement3: "inherit",
  darkProgressAchievement4: "inherit",
};

const storageKey = "aivirteach-ui-customization";
const previewStorageKey = "aivirteach-ui-customization-preview";
const changeEvent = "aivirteach:ui-customization-change";
const colorPattern = /^#[0-9a-f]{6}$/i;
const numberRanges: Record<keyof Pick<UiCustomization, "buttonHeight" | "buttonFontSize" | "buttonRadius" | "buttonBorderWidth" | "learningPathButtonHeight" | "learningPathButtonFontSize" | "learningPathButtonRadius" | "fieldHeight" | "fieldFontSize" | "fieldRadius" | "fieldBorderWidth" | "cardRadius" | "cardPadding" | "cardBorderWidth">, [number, number]> = {
  buttonHeight: [28, 72],
  buttonFontSize: [11, 22],
  buttonRadius: [0, 32],
  buttonBorderWidth: [0, 6],
  learningPathButtonHeight: [32, 72],
  learningPathButtonFontSize: [11, 22],
  learningPathButtonRadius: [0, 32],
  fieldHeight: [36, 76],
  fieldFontSize: [12, 22],
  fieldRadius: [0, 32],
  fieldBorderWidth: [0, 6],
  cardRadius: [0, 32],
  cardPadding: [8, 48],
  cardBorderWidth: [0, 6],
};

export function sanitizeUiCustomization(candidate: Partial<UiCustomization>, defaults: UiCustomization = defaultUiCustomization): UiCustomization {
  const next = { ...defaults };
  for (const key of ["accentColor", "menuItemHover", "buttonBackground", "buttonText", "buttonFocusBackground", "buttonFocusText", "learningPathButtonBackground", "learningPathButtonFocusBackground", "learningPathButtonText", "learningPathButtonBorder", "fieldBackground", "fieldText", "fieldBorder", "focusBorder", "cardBackground", "cardBorder", "overlayBackground", "overlayText", "overlayBorder", "shellBackground", "shellText", "shellBorder", "codeBackground", "codeText", "codeBorder", "statusSuccess", "statusWarning", "statusError", "progressTrack", "skeletonBackground", "lightBackground", "lightSurface", "lightSurfaceMuted", "lightText", "lightTextMuted", "lightBorder", "lightSecondary", "darkBackground", "darkSurface", "darkSurfaceMuted", "darkText", "darkTextMuted", "darkBorder", "darkPrimary", "darkSecondary", "dashboardCourseCard", "dashboardStreakCard", "dashboardPracticeCard", "dashboardSkillsCard", "progressPracticeCard", "progressTasksCard", "progressGoalCard", "progressChartCard", "progressAchievement1", "progressAchievement2", "progressAchievement3", "progressAchievement4", "darkDashboardCourseCard", "darkDashboardStreakCard", "darkDashboardPracticeCard", "darkDashboardSkillsCard", "darkProgressPracticeCard", "darkProgressTasksCard", "darkProgressGoalCard", "darkProgressChartCard", "darkProgressAchievement1", "darkProgressAchievement2", "darkProgressAchievement3", "darkProgressAchievement4"] as const) {
    if (typeof candidate[key] === "string" && (colorPattern.test(candidate[key]) || (cardRoleColorKeySet.has(key) && candidate[key] === "inherit"))) next[key] = candidate[key];
  }
  for (const key of Object.keys(numberRanges) as (keyof typeof numberRanges)[]) {
    const value = Number(candidate[key]);
    const [minimum, maximum] = numberRanges[key];
    if (Number.isFinite(value)) next[key] = Math.min(maximum, Math.max(minimum, Math.round(value)));
  }
  if (typeof candidate.learningPathButtonShadow === "boolean") next.learningPathButtonShadow = candidate.learningPathButtonShadow;
  return next;
}

export function getStoredUiCustomization(): UiCustomization | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return null;
  try {
    return sanitizeUiCustomization(JSON.parse(stored) as Partial<UiCustomization>);
  } catch {
    return null;
  }
}

const cssVariables: Record<Exclude<keyof UiCustomization, "learningPathButtonShadow">, string> = {
  accentColor: "--ui-accent",
  menuItemHover: "--ui-menu-item-hover",
  buttonBackground: "--ui-button-bg",
  buttonText: "--ui-button-text",
  buttonFocusBackground: "--ui-button-focus-bg",
  buttonFocusText: "--ui-button-focus-text",
  buttonHeight: "--ui-button-height",
  buttonFontSize: "--ui-button-font-size",
  buttonRadius: "--ui-button-radius",
  buttonBorderWidth: "--ui-button-border-width",
  learningPathButtonBackground: "--ui-learning-path-button-bg",
  learningPathButtonFocusBackground: "--ui-learning-path-button-focus-bg",
  learningPathButtonText: "--ui-learning-path-button-text",
  learningPathButtonBorder: "--ui-learning-path-button-border",
  learningPathButtonHeight: "--ui-learning-path-button-height",
  learningPathButtonFontSize: "--ui-learning-path-button-font-size",
  learningPathButtonRadius: "--ui-learning-path-button-radius",
  fieldBackground: "--ui-field-bg",
  fieldText: "--ui-field-text",
  fieldBorder: "--ui-field-border",
  focusBorder: "--ui-focus-border",
  fieldHeight: "--ui-field-height",
  fieldFontSize: "--ui-field-font-size",
  fieldRadius: "--ui-field-radius",
  fieldBorderWidth: "--ui-field-border-width",
  cardBackground: "--ui-card-bg",
  cardBorder: "--ui-card-border",
  overlayBackground: "--ui-overlay-bg",
  overlayText: "--ui-overlay-text",
  overlayBorder: "--ui-overlay-border",
  shellBackground: "--ui-shell-bg",
  shellText: "--ui-shell-text",
  shellBorder: "--ui-shell-border",
  codeBackground: "--ui-code-bg",
  codeText: "--ui-code-text",
  codeBorder: "--ui-code-border",
  statusSuccess: "--ui-status-success",
  statusWarning: "--ui-status-warning",
  statusError: "--ui-status-error",
  progressTrack: "--ui-progress-track",
  skeletonBackground: "--ui-skeleton-bg",
  cardRadius: "--ui-card-radius",
  cardPadding: "--ui-card-padding",
  cardBorderWidth: "--ui-card-border-width",
  lightBackground: "--ui-light-background",
  lightSurface: "--ui-light-surface",
  lightSurfaceMuted: "--ui-light-surface-muted",
  lightText: "--ui-light-text",
  lightTextMuted: "--ui-light-text-muted",
  lightBorder: "--ui-light-border",
  lightSecondary: "--ui-light-secondary",
  darkBackground: "--ui-dark-background",
  darkSurface: "--ui-dark-surface",
  darkSurfaceMuted: "--ui-dark-surface-muted",
  darkText: "--ui-dark-text",
  darkTextMuted: "--ui-dark-text-muted",
  darkBorder: "--ui-dark-border",
  darkPrimary: "--ui-dark-primary",
  darkSecondary: "--ui-dark-secondary",
  dashboardCourseCard: "--ui-dashboard-course-card",
  dashboardStreakCard: "--ui-dashboard-streak-card",
  dashboardPracticeCard: "--ui-dashboard-practice-card",
  dashboardSkillsCard: "--ui-dashboard-skills-card",
  progressPracticeCard: "--ui-progress-practice-card",
  progressTasksCard: "--ui-progress-tasks-card",
  progressGoalCard: "--ui-progress-goal-card",
  progressChartCard: "--ui-progress-chart-card",
  progressAchievement1: "--ui-progress-achievement-1",
  progressAchievement2: "--ui-progress-achievement-2",
  progressAchievement3: "--ui-progress-achievement-3",
  progressAchievement4: "--ui-progress-achievement-4",
  darkDashboardCourseCard: "--ui-dark-dashboard-course-card",
  darkDashboardStreakCard: "--ui-dark-dashboard-streak-card",
  darkDashboardPracticeCard: "--ui-dark-dashboard-practice-card",
  darkDashboardSkillsCard: "--ui-dark-dashboard-skills-card",
  darkProgressPracticeCard: "--ui-dark-progress-practice-card",
  darkProgressTasksCard: "--ui-dark-progress-tasks-card",
  darkProgressGoalCard: "--ui-dark-progress-goal-card",
  darkProgressChartCard: "--ui-dark-progress-chart-card",
  darkProgressAchievement1: "--ui-dark-progress-achievement-1",
  darkProgressAchievement2: "--ui-dark-progress-achievement-2",
  darkProgressAchievement3: "--ui-dark-progress-achievement-3",
  darkProgressAchievement4: "--ui-dark-progress-achievement-4",
};

const pixelValues = new Set<keyof UiCustomization>(["buttonHeight", "buttonFontSize", "buttonRadius", "buttonBorderWidth", "learningPathButtonHeight", "learningPathButtonFontSize", "learningPathButtonRadius", "fieldHeight", "fieldFontSize", "fieldRadius", "fieldBorderWidth", "cardRadius", "cardPadding", "cardBorderWidth"]);

export function previewUiCustomization(settings: UiCustomization) {
  const root = document.documentElement;
  root.dataset.uiCustomized = "true";
  const safe = sanitizeUiCustomization(settings);
  for (const key of Object.keys(cssVariables) as (keyof typeof cssVariables)[]) {
    root.style.setProperty(cssVariables[key], cardRoleColorKeySet.has(key) && safe[key] === "inherit" ? "var(--ui-card-bg)" : `${safe[key]}${pixelValues.has(key) ? "px" : ""}`);
  }
  root.style.setProperty("--ui-learning-path-button-shadow", safe.learningPathButtonShadow ? "3px 3px 0 var(--ui-learning-path-button-border)" : "none");
  root.style.removeProperty("--primary");
  root.style.setProperty("--ring", safe.focusBorder);
}

export function saveUiCustomization(settings: UiCustomization) {
  const safe = sanitizeUiCustomization(settings);
  previewUiCustomization(safe);
  window.localStorage.setItem(storageKey, JSON.stringify(safe));
  window.dispatchEvent(new Event(changeEvent));
}

export function clearStoredUiCustomization() {
  window.localStorage.removeItem(storageKey);
}

export function getPreviewUiCustomization(): UiCustomization | null {
  if (typeof window === "undefined") return null;
  const stored = window.sessionStorage.getItem(previewStorageKey);
  if (!stored) return null;
  try {
    return sanitizeUiCustomization(JSON.parse(stored) as Partial<UiCustomization>);
  } catch {
    return null;
  }
}

export function previewDraftUiCustomization(settings: UiCustomization) {
  const safe = sanitizeUiCustomization(settings);
  window.sessionStorage.setItem(previewStorageKey, JSON.stringify(safe));
  previewUiCustomization(safe);
  window.dispatchEvent(new Event(changeEvent));
}

export function clearUiCustomizationDraft() {
  window.sessionStorage.removeItem(previewStorageKey);
  window.dispatchEvent(new Event(changeEvent));
}

export function removeUiCustomizationPreview() {
  const root = document.documentElement;
  delete root.dataset.uiCustomized;
  for (const variable of Object.values(cssVariables)) root.style.removeProperty(variable);
  root.style.removeProperty("--ui-learning-path-button-shadow");
  root.style.removeProperty("--primary");
  root.style.removeProperty("--ring");
}

export function clearUiCustomization() {
  removeUiCustomizationPreview();
  window.localStorage.removeItem(storageKey);
  window.sessionStorage.removeItem(previewStorageKey);
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribeToUiCustomization(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(changeEvent, callback);
  };
}
