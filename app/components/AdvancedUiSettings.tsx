"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/ui/color-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  clearStoredUiCustomization,
  clearUiCustomizationDraft,
  getPreviewUiCustomization,
  previewUiCustomization,
  type CardRoleColorKey,
  type UiCustomization,
} from "../lib/ui-customization";
import { getSavedThemePresets } from "../lib/site-ui-customization";
import { clearThemePresetsPreview, defaultThemePresets, getPreviewThemePresets, getThemePreset, previewThemePresets, replaceThemePreset, updateThemePreset, type ThemePresets } from "../lib/theme-presets";
import { clearInterfaceVersionPreview, clearStoredInterfaceVersion, getServerInterfaceVersion, getStoredInterfaceVersion, previewInterfaceVersion, subscribeToInterfaceVersion, type InterfaceVersion } from "../lib/interface-version";
import { clearStoredTheme, clearThemePreview, getServerTheme, getStoredTheme, previewTheme, subscribeToTheme, type Theme } from "../lib/theme";

type Translate = (english: string, chinese: string) => string;

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="advanced-color-control">
      <span>{label}</span>
      <span><ColorPicker value={value} onChange={(event) => onChange(event.target.value)} /><code>{value.toUpperCase()}</code></span>
    </label>
  );
}

function CardRoleColorControl({ label, value, inheritedColor, inheritLabel, onChange }: { label: string; value: string; inheritedColor: string; inheritLabel: string; onChange: (value: string) => void }) {
  const inherits = value === "inherit";
  return (
    <div className="advanced-card-role-control">
      <label className="advanced-toggle-control">
        <Checkbox checked={inherits} onCheckedChange={(checked) => onChange(checked ? "inherit" : inheritedColor)} />
        <span>{label}: {inheritLabel}</span>
      </label>
      {inherits ? <span className="advanced-inherited-color"><i style={{ backgroundColor: inheritedColor }} aria-hidden="true" />{inheritedColor.toUpperCase()}</span> : <ColorControl label={label} value={value} onChange={onChange} />}
    </div>
  );
}

function RangeControl({ label, value, minimum, maximum, onChange }: { label: string; value: number; minimum: number; maximum: number; onChange: (value: number) => void }) {
  return (
    <label className="advanced-range-control">
      <span>{label}<output>{value}px</output></span>
      <Slider min={minimum} max={maximum} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export function AdvancedUiSettings({ t }: { t: Translate }) {
  const router = useRouter();
  const [draft, setDraft] = useState(getThemePreset(defaultThemePresets, "neubrutal", "light"));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const presetsRef = useRef<ThemePresets>(defaultThemePresets);
  const interfaceVersion = useSyncExternalStore(subscribeToInterfaceVersion, getStoredInterfaceVersion, getServerInterfaceVersion);
  const theme = useSyncExternalStore(subscribeToTheme, getStoredTheme, getServerTheme);

  useEffect(() => {
    let cancelled = false;
    if (new URLSearchParams(window.location.search).get("saved") === "1") {
      queueMicrotask(() => { if (!cancelled) setSaved(true); });
    }
    let stored = getPreviewThemePresets() ?? getSavedThemePresets();
    const legacyDraft = getPreviewUiCustomization();
    if (legacyDraft && !getPreviewThemePresets()) {
      const style = getStoredInterfaceVersion();
      const mode = getStoredTheme();
      stored = replaceThemePreset(stored, style, mode, legacyDraft);
      clearUiCustomizationDraft();
      previewThemePresets(stored);
    }
    const selected = getThemePreset(stored, getStoredInterfaceVersion(), getStoredTheme());
    previewUiCustomization(selected);
    queueMicrotask(() => {
      if (!cancelled) {
        presetsRef.current = stored;
        setDraft(selected);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof UiCustomization>(key: K, value: UiCustomization[K]) {
    setSaved(false);
    setSaveError("");
    const next = updateThemePreset(presetsRef.current, interfaceVersion, theme, key, value);
    presetsRef.current = next;
    const selected = getThemePreset(next, interfaceVersion, theme);
    setDraft(selected);
    previewThemePresets(next);
    previewUiCustomization(selected);
  }

  function cardRoleControl(key: CardRoleColorKey, label: string) {
    return <CardRoleColorControl label={label} value={draft[key]} inheritedColor={draft.cardBackground} inheritLabel={t("Use general Card color", "使用通用卡片颜色")} onChange={(value) => update(key, value)} />;
  }

  function updateInterfaceVersion(version: InterfaceVersion) {
    setSaved(false);
    previewInterfaceVersion(version);
    const selected = getThemePreset(presetsRef.current, version, theme);
    setDraft(selected);
    previewThemePresets(presetsRef.current);
    previewUiCustomization(selected);
  }

  function updateThemeMode(nextTheme: Theme) {
    setSaved(false);
    previewTheme(nextTheme);
    const selected = getThemePreset(presetsRef.current, interfaceVersion, nextTheme);
    setDraft(selected);
    previewThemePresets(presetsRef.current);
    previewUiCustomization(selected);
  }

  async function save() {
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch("/__dev/ui-customization", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Aivirteach-Theme-Editor": "save" },
        body: JSON.stringify({ ...presetsRef.current, interfaceVersion, theme }),
      });
      if (!response.ok) throw new Error("Theme file could not be saved. Start the local development server with npm run dev.");
      const next = await response.json() as ThemePresets;
      clearStoredUiCustomization();
      clearStoredInterfaceVersion();
      clearStoredTheme();
      clearUiCustomizationDraft();
      clearThemePresetsPreview();
      clearInterfaceVersionPreview();
      clearThemePreview();
      presetsRef.current = next;
      const selected = getThemePreset(next, interfaceVersion, theme);
      previewUiCustomization(selected);
      setDraft(selected);
      setSaved(true);
      window.location.assign("/settings?tab=advanced&saved=1");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Theme file could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    presetsRef.current = defaultThemePresets;
    setDraft(getThemePreset(defaultThemePresets, "neubrutal", "light"));
    previewInterfaceVersion("neubrutal");
    previewTheme("light");
    previewThemePresets(defaultThemePresets);
    previewUiCustomization(getThemePreset(defaultThemePresets, "neubrutal", "light"));
    setSaved(false);
  }

  function discard() {
    clearUiCustomizationDraft();
    clearThemePresetsPreview();
    clearInterfaceVersionPreview();
    clearThemePreview();
    const savedSettings = getSavedThemePresets();
    presetsRef.current = savedSettings;
    const selected = getThemePreset(savedSettings, savedSettings.interfaceVersion, savedSettings.theme);
    previewUiCustomization(selected);
    setDraft(selected);
    setSaved(false);
    setSaveError("");
  }

  return (
    <section className="advanced-settings" aria-label={t("Advanced theme settings", "高级主题设置")}>
      <div className="advanced-settings-intro" data-ui-role="theme-editor-intro">
        <div><p className="eyebrow">{t("DESIGN SYSTEM", "设计系统")}</p><h2>{t("Site-wide theme editor", "全站主题编辑器")}</h2></div>
        <p>{t("Edit each of the four style and color combinations. Preview the site, then save all four presets to the frontend repo. Commit the JSON file to carry them into your next build.", "分别编辑四种风格与配色组合。预览网站后，将四套预设保存到前端仓库。提交 JSON 文件后，下次构建会沿用这些设置。")}</p>
      </div>

      <div className="advanced-settings-layout">
        <aside className="advanced-controls" data-ui-role="theme-editor-controls">
          <fieldset><legend>{t("Interface style", "界面风格")}</legend>
            <label className="advanced-select-control">
              <span>{t("Visual style", "视觉风格")}</span>
              <Select value={interfaceVersion} onChange={(event) => updateInterfaceVersion(event.target.value as InterfaceVersion)}>
                <option value="v2">{t("Modern V2", "现代 V2")}</option>
                <option value="neubrutal">{t("Neubrutalism", "新粗野主义")}</option>
              </Select>
            </label>
          </fieldset>
          <fieldset><legend>{t("Theme mode", "主题模式")}</legend>
            <p className="advanced-control-description" aria-live="polite">{t("Editing", "正在编辑")}: {interfaceVersion === "v2" ? t("Modern V2", "现代 V2") : t("Neobrutalism", "新粗野主义")} · {theme === "light" ? t("Light", "浅色") : t("Dark", "深色")}</p>
            <Button type="button" variant="outline" onClick={() => updateThemeMode(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? t("Light", "浅色") : t("Dark", "深色")}
            </Button>
          </fieldset>
          <fieldset><legend>{t("App shell", "应用外壳")}</legend>
            <p className="advanced-control-description">{t("Shared topbar across the dashboard, courses, progress, and settings.", "仪表板、课程、进度与设置共用的顶部导航栏。")}</p>
            <ColorControl label={t("Topbar background", "顶部导航背景")} value={draft.shellBackground} onChange={(value) => update("shellBackground", value)} />
            <ColorControl label={t("Topbar text", "顶部导航文字")} value={draft.shellText} onChange={(value) => update("shellText", value)} />
            <ColorControl label={t("Topbar border", "顶部导航边框")} value={draft.shellBorder} onChange={(value) => update("shellBorder", value)} />
            <ColorControl label={t("Navigation and menu hover", "导航与菜单悬停色")} value={draft.menuItemHover} onChange={(value) => update("menuItemHover", value)} />
          </fieldset>
          <fieldset><legend>{t("Brand and feedback", "品牌与反馈")}</legend>
            <ColorControl label={t("Focus ring and field border", "聚焦外框与字段边框")} value={draft.focusBorder} onChange={(value) => update("focusBorder", value)} />
          </fieldset>
          <fieldset><legend>{t("Status and data", "状态与数据")}</legend>
            <ColorControl label={t("Success", "成功状态")} value={draft.statusSuccess} onChange={(value) => update("statusSuccess", value)} />
            <ColorControl label={t("Warning", "警告状态")} value={draft.statusWarning} onChange={(value) => update("statusWarning", value)} />
            <ColorControl label={t("Error", "错误状态")} value={draft.statusError} onChange={(value) => update("statusError", value)} />
            <ColorControl label={t("Progress track", "进度条轨道")} value={draft.progressTrack} onChange={(value) => update("progressTrack", value)} />
            <ColorControl label={t("Loading skeleton", "加载占位背景")} value={draft.skeletonBackground} onChange={(value) => update("skeletonBackground", value)} />
          </fieldset>
          <fieldset><legend>{t("Buttons", "按钮")}</legend>
            <ColorControl label={t("Background", "背景色")} value={draft.buttonBackground} onChange={(value) => update("buttonBackground", value)} />
            <ColorControl label={t("Text", "文字颜色")} value={draft.buttonText} onChange={(value) => update("buttonText", value)} />
            <ColorControl label={t("Focused/selected background", "聚焦/选中背景色")} value={draft.buttonFocusBackground} onChange={(value) => update("buttonFocusBackground", value)} />
            <ColorControl label={t("Focused/selected text", "聚焦/选中文字")} value={draft.buttonFocusText} onChange={(value) => update("buttonFocusText", value)} />
            <RangeControl label={t("Height", "高度")} value={draft.buttonHeight} minimum={28} maximum={72} onChange={(value) => update("buttonHeight", value)} />
            <RangeControl label={t("Font size", "字号")} value={draft.buttonFontSize} minimum={11} maximum={22} onChange={(value) => update("buttonFontSize", value)} />
            <RangeControl label={t("Corner radius", "圆角")} value={draft.buttonRadius} minimum={0} maximum={32} onChange={(value) => update("buttonRadius", value)} />
            <RangeControl label={t("Border width", "边框宽度")} value={draft.buttonBorderWidth} minimum={0} maximum={6} onChange={(value) => update("buttonBorderWidth", value)} />
          </fieldset>
          <fieldset><legend>{t("Learning Path buttons", "学习路径按钮")}</legend>
            <p className="advanced-control-description">{t("Styles Previous, Next, and Mark lesson complete in the Learning Lab.", "设置学习实验室中上一节、下一节和标记本节已学完按钮的样式。")}</p>
            <ColorControl label={t("Unfocused background", "未聚焦背景色")} value={draft.learningPathButtonBackground} onChange={(value) => update("learningPathButtonBackground", value)} />
            <ColorControl label={t("Focused / hovered background", "聚焦／悬停背景色")} value={draft.learningPathButtonFocusBackground} onChange={(value) => update("learningPathButtonFocusBackground", value)} />
            <ColorControl label={t("Text", "文字颜色")} value={draft.learningPathButtonText} onChange={(value) => update("learningPathButtonText", value)} />
            <ColorControl label={t("Border", "边框颜色")} value={draft.learningPathButtonBorder} onChange={(value) => update("learningPathButtonBorder", value)} />
            <RangeControl label={t("Height", "高度")} value={draft.learningPathButtonHeight} minimum={32} maximum={72} onChange={(value) => update("learningPathButtonHeight", value)} />
            <RangeControl label={t("Font size", "字号")} value={draft.learningPathButtonFontSize} minimum={11} maximum={22} onChange={(value) => update("learningPathButtonFontSize", value)} />
            <RangeControl label={t("Corner radius", "圆角")} value={draft.learningPathButtonRadius} minimum={0} maximum={32} onChange={(value) => update("learningPathButtonRadius", value)} />
            <label className="advanced-toggle-control"><Checkbox checked={draft.learningPathButtonShadow} onCheckedChange={(checked) => update("learningPathButtonShadow", checked)} /><span>{t("Button shadow/backdrop", "按钮阴影／背景层")}</span></label>
          </fieldset>
          <fieldset><legend>{t("Text fields and selects", "文本框与下拉框")}</legend>
            <ColorControl label={t("Background", "背景色")} value={draft.fieldBackground} onChange={(value) => update("fieldBackground", value)} />
            <ColorControl label={t("Text", "文字颜色")} value={draft.fieldText} onChange={(value) => update("fieldText", value)} />
            <ColorControl label={t("Border", "边框颜色")} value={draft.fieldBorder} onChange={(value) => update("fieldBorder", value)} />
            <RangeControl label={t("Height", "高度")} value={draft.fieldHeight} minimum={36} maximum={76} onChange={(value) => update("fieldHeight", value)} />
            <RangeControl label={t("Font size", "字号")} value={draft.fieldFontSize} minimum={12} maximum={22} onChange={(value) => update("fieldFontSize", value)} />
            <RangeControl label={t("Corner radius", "圆角")} value={draft.fieldRadius} minimum={0} maximum={32} onChange={(value) => update("fieldRadius", value)} />
            <RangeControl label={t("Border width", "边框宽度")} value={draft.fieldBorderWidth} minimum={0} maximum={6} onChange={(value) => update("fieldBorderWidth", value)} />
          </fieldset>
          <fieldset><legend>{t("Cards", "卡片")}</legend>
            <ColorControl label={t("Background", "背景色")} value={draft.cardBackground} onChange={(value) => update("cardBackground", value)} />
            <ColorControl label={t("Border", "边框颜色")} value={draft.cardBorder} onChange={(value) => update("cardBorder", value)} />
            <RangeControl label={t("Corner radius", "圆角")} value={draft.cardRadius} minimum={0} maximum={32} onChange={(value) => update("cardRadius", value)} />
            <RangeControl label={t("Inner spacing", "内边距")} value={draft.cardPadding} minimum={8} maximum={48} onChange={(value) => update("cardPadding", value)} />
            <RangeControl label={t("Border width", "边框宽度")} value={draft.cardBorderWidth} minimum={0} maximum={6} onChange={(value) => update("cardBorderWidth", value)} />
          </fieldset>
          <fieldset><legend>{t("Overlays", "浮层")}</legend>
            <p className="advanced-control-description">{t("Popovers, dropdown menus, and dialogs share these colors.", "弹出层、下拉菜单和对话框共用这些颜色。")}</p>
            <ColorControl label={t("Background", "背景色")} value={draft.overlayBackground} onChange={(value) => update("overlayBackground", value)} />
            <ColorControl label={t("Text", "文字颜色")} value={draft.overlayText} onChange={(value) => update("overlayText", value)} />
            <ColorControl label={t("Border", "边框颜色")} value={draft.overlayBorder} onChange={(value) => update("overlayBorder", value)} />
          </fieldset>
          <fieldset><legend>{t("Content and code", "内容与代码")}</legend>
            <p className="advanced-control-description">{t("Code examples in the demo course and the separate lesson preview.", "示例课程和独立课程预览中的代码示例。")}</p>
            <ColorControl label={t("Code background", "代码背景")} value={draft.codeBackground} onChange={(value) => update("codeBackground", value)} />
            <ColorControl label={t("Code text", "代码文字")} value={draft.codeText} onChange={(value) => update("codeText", value)} />
            <ColorControl label={t("Code border", "代码边框")} value={draft.codeBorder} onChange={(value) => update("codeBorder", value)} />
          </fieldset>
          {theme === "light" ? (
            <>
              <fieldset><legend>{t("Light theme main/base colors", "浅色主题主色与基础色")}</legend>
                <ColorControl label={t("Page background", "页面背景")} value={draft.lightBackground} onChange={(value) => update("lightBackground", value)} />
                <ColorControl label={t("Main surface", "主要表面")} value={draft.lightSurface} onChange={(value) => update("lightSurface", value)} />
                <ColorControl label={t("Muted surface", "次要表面")} value={draft.lightSurfaceMuted} onChange={(value) => update("lightSurfaceMuted", value)} />
                <ColorControl label={t("Main text", "主要文字")} value={draft.lightText} onChange={(value) => update("lightText", value)} />
                <ColorControl label={t("Muted text", "次要文字")} value={draft.lightTextMuted} onChange={(value) => update("lightTextMuted", value)} />
                <ColorControl label={t("Borders and shadows", "边框与阴影")} value={draft.lightBorder} onChange={(value) => update("lightBorder", value)} />
                <ColorControl label={t("Primary accent", "主要强调色")} value={draft.accentColor} onChange={(value) => update("accentColor", value)} />
                <ColorControl label={t("Secondary accent", "次要强调色")} value={draft.lightSecondary} onChange={(value) => update("lightSecondary", value)} />
              </fieldset>
              <fieldset><legend>{t("Dashboard cards — light", "仪表板卡片 — 浅色")}</legend>
                {cardRoleControl("dashboardCourseCard", t("Current course", "当前课程"))}
                {cardRoleControl("dashboardStreakCard", t("Current streak", "连续学习"))}
                {cardRoleControl("dashboardPracticeCard", t("Practice time", "练习时间"))}
                {cardRoleControl("dashboardSkillsCard", t("Skills mastered", "已掌握技能"))}
              </fieldset>
              <fieldset><legend>{t("Progress cards — light", "学习进度卡片 — 浅色")}</legend>
                {cardRoleControl("progressPracticeCard", t("Practice metric", "练习指标"))}
                {cardRoleControl("progressTasksCard", t("Tasks metric", "任务指标"))}
                {cardRoleControl("progressGoalCard", t("Weekly goal", "每周目标"))}
                {cardRoleControl("progressChartCard", t("Learning chart", "学习图表"))}
                {cardRoleControl("progressAchievement1", t("Achievement 1", "成就 1"))}
                {cardRoleControl("progressAchievement2", t("Achievement 2", "成就 2"))}
                {cardRoleControl("progressAchievement3", t("Achievement 3", "成就 3"))}
                {cardRoleControl("progressAchievement4", t("Achievement 4", "成就 4"))}
              </fieldset>
            </>
          ) : (
            <>
              <fieldset><legend>{t("Dark theme main/base colors", "深色主题主色与基础色")}</legend>
                <ColorControl label={t("Page background", "页面背景")} value={draft.darkBackground} onChange={(value) => update("darkBackground", value)} />
                <ColorControl label={t("Main surface", "主要表面")} value={draft.darkSurface} onChange={(value) => update("darkSurface", value)} />
                <ColorControl label={t("Muted surface", "次要表面")} value={draft.darkSurfaceMuted} onChange={(value) => update("darkSurfaceMuted", value)} />
                <ColorControl label={t("Main text", "主要文字")} value={draft.darkText} onChange={(value) => update("darkText", value)} />
                <ColorControl label={t("Muted text", "次要文字")} value={draft.darkTextMuted} onChange={(value) => update("darkTextMuted", value)} />
                <ColorControl label={t("Borders and shadows", "边框与阴影")} value={draft.darkBorder} onChange={(value) => update("darkBorder", value)} />
                <ColorControl label={t("Primary accent", "主要强调色")} value={draft.darkPrimary} onChange={(value) => update("darkPrimary", value)} />
                <ColorControl label={t("Secondary accent", "次要强调色")} value={draft.darkSecondary} onChange={(value) => update("darkSecondary", value)} />
              </fieldset>
              <fieldset><legend>{t("Dashboard cards — dark", "仪表板卡片 — 深色")}</legend>
                {cardRoleControl("darkDashboardCourseCard", t("Current course", "当前课程"))}
                {cardRoleControl("darkDashboardStreakCard", t("Current streak", "连续学习"))}
                {cardRoleControl("darkDashboardPracticeCard", t("Practice time", "练习时间"))}
                {cardRoleControl("darkDashboardSkillsCard", t("Skills mastered", "已掌握技能"))}
              </fieldset>
              <fieldset><legend>{t("Progress cards — dark", "学习进度卡片 — 深色")}</legend>
                {cardRoleControl("darkProgressPracticeCard", t("Practice metric", "练习指标"))}
                {cardRoleControl("darkProgressTasksCard", t("Tasks metric", "任务指标"))}
                {cardRoleControl("darkProgressGoalCard", t("Weekly goal", "每周目标"))}
                {cardRoleControl("darkProgressChartCard", t("Learning chart", "学习图表"))}
                {cardRoleControl("darkProgressAchievement1", t("Achievement 1", "成就 1"))}
                {cardRoleControl("darkProgressAchievement2", t("Achievement 2", "成就 2"))}
                {cardRoleControl("darkProgressAchievement3", t("Achievement 3", "成就 3"))}
                {cardRoleControl("darkProgressAchievement4", t("Achievement 4", "成就 4"))}
              </fieldset>
            </>
          )}
          <div className="advanced-save-actions">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>{t("Preview site", "预览网站")}</Button>
            <Button render={<a href="/theme-gallery" />} variant="outline">{t("Open UI gallery", "打开界面组件画廊")}</Button>
            <Button type="button" onClick={() => void save()} disabled={saving} aria-busy={saving}>{saving ? t("Saving…", "保存中…") : t("Save site-wide to repo", "保存全站设置到仓库")}</Button>
            <Button type="button" variant="outline" onClick={reset}>{t("Reset all four drafts", "重置全部四套草稿")}</Button>
            <Button type="button" variant="ghost" onClick={discard}>{t("Discard preview", "放弃预览")}</Button>
            {saved && <span role="status">{t("Saved to app/lib/site-ui-customization.json. Commit and push this file to share the theme.", "已保存到 app/lib/site-ui-customization.json。提交并推送此文件即可共享主题。")}</span>}
            {saveError && <span className="advanced-save-error" role="alert">{t(saveError, "无法保存主题文件。请在本地运行 npm run dev 后重试。")}</span>}
          </div>
        </aside>

        <div className="component-catalog">
          <Card as="section" className="component-preview-card" uiRole="theme-preview">
            <h3>{t("Dashboard card colors", "仪表板卡片颜色")}</h3>
            <div className="theme-role-grid">
              <Card as="article" className="theme-role-card" uiRole="dashboard-course">{t("Current course", "当前课程")}</Card>
              <Card as="article" className="theme-role-card" uiRole="dashboard-stat" data-ui-tone="streak">{t("Current streak", "连续学习")}</Card>
              <Card as="article" className="theme-role-card" uiRole="dashboard-stat" data-ui-tone="practice">{t("Practice time", "练习时间")}</Card>
              <Card as="article" className="theme-role-card" uiRole="dashboard-stat" data-ui-tone="skills">{t("Skills mastered", "已掌握技能")}</Card>
            </div>
          </Card>
          <Card as="section" className="component-preview-card" uiRole="theme-preview">
            <h3>{t("Progress card colors", "学习进度卡片颜色")}</h3>
            <div className="theme-role-grid">
              <Card as="article" className="theme-role-card" uiRole="analytics-metric" data-ui-tone="practice">{t("Practice metric", "练习指标")}</Card>
              <Card as="article" className="theme-role-card" uiRole="analytics-metric" data-ui-tone="tasks">{t("Tasks metric", "任务指标")}</Card>
              <Card as="article" className="theme-role-card" uiRole="analytics-metric" data-ui-tone="goal">{t("Weekly goal", "每周目标")}</Card>
              <Card as="article" className="theme-role-card" uiRole="analytics-chart">{t("Learning chart", "学习图表")}</Card>
              {[1, 2, 3, 4].map((index) => <Card as="article" className="theme-role-card" uiRole="analytics-achievement" data-ui-tone={index} key={index}>{t(`Achievement ${index}`, `成就 ${index}`)}</Card>)}
            </div>
          </Card>
          <Card as="section" className="component-preview-card" uiRole="theme-preview">
            <h3>{t("Buttons", "按钮")}</h3>
            <p className="advanced-control-description">{t("Hover or tab through the buttons to inspect their interaction states.", "将鼠标悬停或按 Tab 键，查看按钮的交互状态。")}</p>
            <div className="component-preview-row">
              <Button>{t("Primary", "主要")}</Button>
              <Button variant="secondary">{t("Secondary", "次要")}</Button>
              <Button variant="outline">{t("Outline", "轮廓")}</Button>
              <Button variant="ghost">{t("Ghost", "透明")}</Button>
              <Button variant="link">{t("Link", "链接")}</Button>
              <Button variant="destructive">{t("Delete", "删除")}</Button>
              <Button disabled>{t("Disabled", "禁用")}</Button>
              <Button variant="outline" data-ui-role="theme-state-sample" data-ui-state="pressed">{t("Pressed", "按下")}</Button>
              <Button variant="outline" data-ui-role="theme-state-sample" aria-pressed="true">{t("Selected", "已选中")}</Button>
              <Button disabled aria-busy="true">{t("Saving…", "保存中……")}</Button>
            </div>
          </Card>
          <Card as="section" className="component-preview-card" uiRole="theme-preview">
            <h3>{t("Page button roles", "页面按钮角色")}</h3>
            <div className="component-preview-row">
              <Button variant="ghost" data-ui-role="range-option" aria-pressed="true">{t("30 days", "30 天")}</Button>
              <Button variant="ghost" data-ui-role="range-option" aria-pressed="false">{t("All time", "全部时间")}</Button>
              <Button variant="ghost" data-ui-role="course-lesson-option" aria-current="step">{t("Current lesson", "当前课程")}</Button>
              <div role="radiogroup" aria-label={t("Quiz answer preview", "测验答案预览")}><Button variant="outline" data-ui-role="course-quiz-option" role="radio" aria-checked="true"><span>A</span>{t("Selected answer", "已选答案")}</Button></div>
              <Button variant="outline" data-ui-role="settings-toggle">{t("Settings toggle", "设置切换")}</Button>
              <Button variant="outline" data-ui-role="auth-provider" disabled>{t("Provider disabled", "服务商不可用")}</Button>
            </div>
          </Card>
          <Card as="section" className="component-preview-card" uiRole="theme-preview"><h3>{t("Learning Path buttons", "学习路径按钮")}</h3><p className="advanced-control-description">{t("Hover over or tab to a button to preview its focused color.", "将鼠标悬停在按钮上，或按 Tab 键聚焦按钮，以预览聚焦颜色。")}</p><div className="component-preview-row"><Button className="learning-path-button" variant="outline" type="button">{t("Previous", "上一节")}</Button><Button className="learning-path-button" variant="outline" type="button">{t("Next", "下一节")}</Button><Button className="learning-path-button" variant="outline" type="button">{t("Mark lesson complete", "标记本节已学完")}</Button></div></Card>
          <Card as="section" className="component-preview-card" uiRole="theme-preview">
            <h3>{t("Form controls", "表单控件")}</h3>
            <div className="component-preview-form">
              <Input aria-label={t("Text field preview", "文本框预览")} placeholder={t("Click to test the focus border", "点击测试聚焦边框")} />
              <Select aria-label={t("Select preview", "下拉框预览")} defaultValue="one"><option value="one">{t("Select option", "选择选项")}</option><option value="two">{t("Another option", "另一个选项")}</option></Select>
              <label><Checkbox defaultChecked /> {t("Checkbox", "复选框")}</label>
              <label><Checkbox aria-invalid="true" /> {t("Invalid checkbox", "无效复选框")}</label>
              <Slider aria-label={t("Slider preview", "滑块预览")} defaultValue={40} />
              <Input aria-label={t("Invalid field preview", "无效字段预览")} aria-invalid="true" defaultValue={t("Invalid value", "无效值")} />
              <Input aria-label={t("Read-only field preview", "只读字段预览")} defaultValue={t("Read-only value", "只读内容")} readOnly />
              <Input aria-label={t("Disabled field preview", "禁用字段预览")} disabled value={t("Disabled field", "禁用字段")} readOnly />
              <Select aria-label={t("Disabled select preview", "禁用下拉框预览")} disabled defaultValue="one"><option value="one">{t("Disabled select", "禁用下拉框")}</option></Select>
            </div>
          </Card>
          <Card as="section" className="component-preview-card" uiRole="theme-preview"><h3>{t("Status and feedback", "状态与反馈")}</h3><div className="component-preview-row"><Badge>{t("Badge", "徽章")}</Badge><Badge variant="secondary">{t("Secondary", "次要")}</Badge><Badge data-ui-tone="success">{t("Complete", "已完成")}</Badge><Badge data-ui-tone="warning">{t("Needs review", "需要复习")}</Badge><Badge variant="destructive">{t("Error", "错误")}</Badge><Avatar><AvatarFallback>AI</AvatarFallback></Avatar></div><Progress value={64} /><Alert><AlertTitle>{t("Alert title", "提醒标题")}</AlertTitle><AlertDescription>{t("Reusable feedback message preview.", "可复用反馈消息预览。")}</AlertDescription></Alert><Alert variant="destructive"><AlertTitle>{t("Error alert", "错误提醒")}</AlertTitle><AlertDescription>{t("Try again after checking the details.", "检查详情后重试。")}</AlertDescription></Alert></Card>
          <Card as="section" className="component-preview-card" uiRole="theme-preview"><h3>{t("Loading states", "加载状态")}</h3><div className="component-skeleton-preview"><Skeleton /><Skeleton /><Skeleton /></div></Card>
          <Card as="section" className="component-preview-card" uiRole="theme-preview"><h3>{t("Code surface", "代码面板")}</h3><pre className="component-code-preview" data-ui-role="code-surface"><code>{"score = 10\nprint(score)"}</code></pre></Card>
          <Card as="section" className="component-preview-card" uiRole="theme-preview"><h3>{t("Overlays", "浮层组件")}</h3><div className="component-preview-row"><Button variant="outline" type="button" onClick={() => setDialogOpen(true)}>{t("Open dialog", "打开对话框")}</Button><DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" />}>{t("Open menu", "打开菜单")}</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>{t("Menu item", "菜单项")}</DropdownMenuItem><DropdownMenuItem variant="destructive">{t("Destructive item", "危险操作")}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></Card>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogTitle>{t("Dialog preview", "对话框预览")}</DialogTitle><DialogDescription>{t("Dialogs inherit the saved global component tokens.", "对话框会继承已保存的全局组件变量。")}</DialogDescription><DialogFooter><Button type="button" onClick={() => setDialogOpen(false)}>{t("Done", "完成")}</Button></DialogFooter></DialogContent></Dialog>
    </section>
  );
}
