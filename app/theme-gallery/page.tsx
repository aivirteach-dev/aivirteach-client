"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { ThemeGalleryCards } from "../components/ThemeGalleryCards";
import { clearStoredInterfaceVersion, clearInterfaceVersionPreview, getServerInterfaceVersion, getStoredInterfaceVersion, previewInterfaceVersion, subscribeToInterfaceVersion, type InterfaceVersion } from "../lib/interface-version";
import { localize, useLearningLanguage } from "../lib/language";
import { getSavedThemePresets } from "../lib/site-ui-customization";
import { clearStoredTheme, clearThemePreview, getServerTheme, getStoredTheme, previewTheme, subscribeToTheme, type Theme } from "../lib/theme";
import { clearThemePresetsPreview, defaultThemePresets, getPreviewThemePresets, getThemePreset, previewThemePresets, updateThemePreset, type ThemePresets } from "../lib/theme-presets";
import { clearStoredUiCustomization, clearUiCustomizationDraft, previewUiCustomization, type CardRoleColorKey, type UiCustomization } from "../lib/ui-customization";
import "./theme-gallery.css";

type Translate = (english: string, chinese: string) => string;

const sections = [
  ["foundation", "Foundation"], ["shell", "App shell"], ["buttons", "Buttons"],
  ["forms", "Fields"], ["cards", "Cards"], ["patterns", "Page patterns"],
  ["data", "Status & data"], ["overlays", "Overlays"], ["content", "Content blocks"],
] as const;

const roleColors: { label: string; light: CardRoleColorKey; dark: CardRoleColorKey }[] = [
  { label: "Dashboard course", light: "dashboardCourseCard", dark: "darkDashboardCourseCard" },
  { label: "Dashboard streak", light: "dashboardStreakCard", dark: "darkDashboardStreakCard" },
  { label: "Dashboard practice", light: "dashboardPracticeCard", dark: "darkDashboardPracticeCard" },
  { label: "Dashboard skills", light: "dashboardSkillsCard", dark: "darkDashboardSkillsCard" },
  { label: "Progress practice", light: "progressPracticeCard", dark: "darkProgressPracticeCard" },
  { label: "Progress tasks", light: "progressTasksCard", dark: "darkProgressTasksCard" },
  { label: "Progress goal", light: "progressGoalCard", dark: "darkProgressGoalCard" },
  { label: "Progress chart", light: "progressChartCard", dark: "darkProgressChartCard" },
  { label: "Achievement 1", light: "progressAchievement1", dark: "darkProgressAchievement1" },
  { label: "Achievement 2", light: "progressAchievement2", dark: "darkProgressAchievement2" },
  { label: "Achievement 3", light: "progressAchievement3", dark: "darkProgressAchievement3" },
  { label: "Achievement 4", light: "progressAchievement4", dark: "darkProgressAchievement4" },
];

function GallerySection({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return <section className="gallery-section" id={id}>
    <div className="gallery-section-head"><h2>{title}</h2><p>{description}</p></div>
    {children}
  </section>;
}

function GalleryPanel({ title, children }: { title: string; children: ReactNode }) {
  return <Card as="article" className="gallery-panel" uiRole="theme-preview">
    <span className="gallery-role-label">{title}</span>
    {children}
  </Card>;
}

function GalleryEditor({ t, draft, mode, roleKey, roleLabel, onRoleLabel, update, onSave, saving, message }: {
  t: Translate;
  draft: UiCustomization;
  mode: Theme;
  roleKey: CardRoleColorKey;
  roleLabel: string;
  onRoleLabel: (label: string) => void;
  update: <K extends keyof UiCustomization>(key: K, value: UiCustomization[K]) => void;
  onSave: () => void;
  saving: boolean;
  message: string;
}) {
  return <GalleryPanel title={t("Live theme controls", "实时主题设置")}>
    <p>{t("Edit the website's theme values. The cards above and the site preview update together.", "修改网站主题值。上方卡片与网站预览会同步更新。")}</p>
    <div className="gallery-editor-grid">
      <label>{t("Page background", "页面背景")}<Input type="color" value={mode === "light" ? draft.lightBackground : draft.darkBackground} onChange={(event) => update(mode === "light" ? "lightBackground" : "darkBackground", event.target.value)} /></label>
      <label>{t("General card background", "通用卡片背景")}<Input type="color" value={draft.cardBackground} onChange={(event) => update("cardBackground", event.target.value)} /></label>
      <label>{t("Card border", "卡片边框")}<Input type="color" value={draft.cardBorder} onChange={(event) => update("cardBorder", event.target.value)} /></label>
      <label>{t("Card radius", "卡片圆角")}<Slider min={0} max={32} value={draft.cardRadius} onChange={(event) => update("cardRadius", Number(event.target.value))} /><span>{draft.cardRadius}px</span></label>
      <label>{t("Card border width", "卡片边框宽度")}<Slider min={0} max={6} value={draft.cardBorderWidth} onChange={(event) => update("cardBorderWidth", Number(event.target.value))} /><span>{draft.cardBorderWidth}px</span></label>
      <label>{t("Button background", "按钮背景")}<Input type="color" value={draft.buttonBackground} onChange={(event) => update("buttonBackground", event.target.value)} /></label>
      <label>{t("Button hover", "按钮悬停背景")}<Input type="color" value={draft.buttonFocusBackground} onChange={(event) => update("buttonFocusBackground", event.target.value)} /></label>
      <label>{t("Field background", "输入框背景")}<Input type="color" value={draft.fieldBackground} onChange={(event) => update("fieldBackground", event.target.value)} /></label>
      <label>{t("Card color role", "卡片颜色角色")}<Select value={roleLabel} onChange={(event) => onRoleLabel(event.target.value)}><option value="general">{t("General card", "通用卡片")}</option>{roleColors.map((role) => <option value={role.label} key={role.label}>{role.label}</option>)}</Select></label>
      {roleLabel !== "general" && <label>{t("Selected card color", "所选卡片颜色")}<Input type="color" value={draft[roleKey] === "inherit" ? draft.cardBackground : draft[roleKey]} onChange={(event) => update(roleKey, event.target.value)} /></label>}
      {roleLabel !== "general" && <label className="gallery-checkbox"><Checkbox checked={draft[roleKey] === "inherit"} onCheckedChange={(checked) => update(roleKey, checked ? "inherit" : draft.cardBackground)} />{t("Follow general card color", "跟随通用卡片颜色")}</label>}
    </div>
    <div className="gallery-editor-actions">
      <Button type="button" onClick={onSave} disabled={saving} aria-busy={saving}>{saving ? t("Saving…", "保存中……") : t("Save site-wide to repo", "保存全站设置到仓库")}</Button>
      <Button render={<Link href="/settings?tab=advanced" />} variant="outline">{t("All theme settings", "全部主题设置")}</Button>
    </div>
    {message && <p role="status">{message}</p>}
  </GalleryPanel>;
}

export default function ThemeGalleryPage() {
  const language = useLearningLanguage();
  const t: Translate = (english, chinese) => localize(language, english, chinese);
  const style = useSyncExternalStore(subscribeToInterfaceVersion, getStoredInterfaceVersion, getServerInterfaceVersion);
  const mode = useSyncExternalStore(subscribeToTheme, getStoredTheme, getServerTheme);
  const [presets, setPresets] = useState<ThemePresets>(defaultThemePresets);
  const presetsRef = useRef<ThemePresets>(defaultThemePresets);
  const [roleLabel, setRoleLabel] = useState("general");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const stored = getPreviewThemePresets() ?? getSavedThemePresets();
    presetsRef.current = stored;
    queueMicrotask(() => { if (!cancelled) setPresets(stored); });
    return () => { cancelled = true; };
  }, []);

  const draft = getThemePreset(presets, style, mode);
  const selectedRole = roleColors.find((role) => role.label === roleLabel);
  const roleKey = selectedRole?.[mode] ?? "dashboardCourseCard";

  function selectStyle(next: InterfaceVersion) {
    previewInterfaceVersion(next);
    previewThemePresets(presetsRef.current);
    previewUiCustomization(getThemePreset(presetsRef.current, next, mode));
  }

  function selectMode(next: Theme) {
    previewTheme(next);
    previewThemePresets(presetsRef.current);
    previewUiCustomization(getThemePreset(presetsRef.current, style, next));
  }

  function update<K extends keyof UiCustomization>(key: K, value: UiCustomization[K]) {
    const next = updateThemePreset(presetsRef.current, style, mode, key, value);
    presetsRef.current = next;
    setPresets(next);
    setMessage("");
    previewThemePresets(next);
    previewUiCustomization(getThemePreset(next, style, mode));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/__dev/ui-customization", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Aivirteach-Theme-Editor": "save" },
        body: JSON.stringify({ ...presetsRef.current, interfaceVersion: style, theme: mode }),
      });
      if (!response.ok) throw new Error(t("Start the local development server with npm run dev to save the theme.", "请运行 npm run dev 后再保存主题。"));
      clearStoredUiCustomization();
      clearStoredInterfaceVersion();
      clearStoredTheme();
      clearUiCustomizationDraft();
      clearThemePresetsPreview();
      clearInterfaceVersionPreview();
      clearThemePreview();
      window.location.assign("/theme-gallery?saved=1");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Theme could not be saved.", "无法保存主题。"));
      setSaving(false);
    }
  }

  return <main className="gallery-page" id="main">
    <a className="gallery-skip" href="#gallery-content">{t("Skip to gallery", "跳转到画廊")}</a>
    <header className="gallery-toolbar">
      <div className="gallery-container gallery-toolbar-inner">
        <div className="gallery-brand"><strong>AIVirTeach · UI gallery</strong><small>{t("Website components and live theme styles", "网站组件与实时主题样式")}</small></div>
        <div className="gallery-toolbar-controls">
          <label>{t("Visual style", "视觉风格")}<Select value={style} onChange={(event) => selectStyle(event.target.value as InterfaceVersion)}><option value="v2">Modern V2</option><option value="neubrutal">Neobrutalism</option></Select></label>
          <label>{t("Color mode", "配色模式")}<Select value={mode} onChange={(event) => selectMode(event.target.value as Theme)}><option value="light">Light</option><option value="dark">Dark</option></Select></label>
        </div>
      </div>
    </header>

    <div className="gallery-container" id="gallery-content">
      <div className="gallery-intro"><div><span className="eyebrow">THEME SYSTEM · COMPONENT CATALOG</span><h1>{t("One UI, four combinations.", "一套界面，四种组合。")}</h1><p>{t("Preview the actual website components in Modern V2 and Neobrutalism, each in Light and Dark. Edit shared theme values below and save them to the site.", "使用真实网站组件预览现代 V2 和新粗野主义的浅色与深色版本。下方可编辑并保存共享主题值。")}</p></div><Badge className="gallery-combination">{style === "v2" ? "Modern V2" : "Neobrutalism"} · {mode === "light" ? "Light" : "Dark"}</Badge></div>
      <nav className="gallery-section-nav" aria-label={t("Gallery sections", "画廊分区")}>{sections.map(([id, label]) => <a href={`#${id}`} key={id}>{label}</a>)}</nav>

      <GallerySection id="foundation" title={t("Foundation", "基础样式")} description={t("Page, surfaces, type, color, elevation", "页面、表面、字体、颜色与层次")}>
        <div className="gallery-grid gallery-grid-two">
          <GalleryPanel title={t("Typography", "文字样式")}><h3>{t("Build a brighter learning path.", "构建更明亮的学习路径。")}</h3><p>{t("Body text, strong emphasis, inline links, and code.", "正文、强调文字、链接与代码。")}</p><p><Link href="/dashboard">{t("Visit dashboard", "打开仪表板")}</Link> · <code>score = 10</code></p></GalleryPanel>
          <GalleryPanel title={t("Palette", "配色")}><div className="gallery-swatches">{[["Page", "--background"], ["Surface", "--card"], ["Text", "--foreground"], ["Primary", "--primary"], ["Secondary", "--secondary"], ["Border", "--border"]].map(([label, variable]) => <div className="gallery-swatch" key={label}><span style={{ background: `var(${variable})` }} /><small>{label}</small></div>)}</div></GalleryPanel>
        </div>
      </GallerySection>

      <GallerySection id="shell" title={t("App shell", "应用外壳")} description={t("Header, navigation, search, account", "页眉、导航、搜索与账户")}>
        <Card as="header" className="topbar gallery-shell-sample" uiRole="app-topbar"><div className="topbar-inner"><strong>AIVirTeach</strong><div className="gallery-row"><Button variant="ghost" aria-current="page">Dashboard</Button><Button variant="ghost">Courses</Button><Button variant="ghost">Progress</Button><Button variant="ghost">Settings</Button><Avatar><AvatarFallback>AI</AvatarFallback></Avatar></div></div></Card>
        <div className="gallery-grid gallery-grid-two gallery-space"><GalleryPanel title={t("Topbar search", "顶部搜索")}><Input type="search" aria-label="Search courses" placeholder="Search courses and skills" /></GalleryPanel><GalleryPanel title={t("Account actions", "账户操作")}><div className="gallery-row"><Button variant="outline">Profile</Button><Button variant="ghost">Notifications</Button><Button variant="destructive">Sign out</Button></div></GalleryPanel></div>
      </GallerySection>

      <GallerySection id="buttons" title={t("Buttons and actions", "按钮与操作")} description={t("Shared variants, states, page jobs", "共享样式、状态与页面用途")}>
        <div className="gallery-grid gallery-grid-two">
          <GalleryPanel title={t("Six button variants", "六种按钮样式")}><div className="gallery-row"><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button><Button variant="link">Link</Button><Button variant="destructive">Destructive</Button></div></GalleryPanel>
          <GalleryPanel title={t("Interaction states", "交互状态")}><div className="gallery-row"><Button aria-pressed="true">Pressed</Button><Button variant="outline" aria-pressed="true">Selected</Button><Button disabled>Disabled</Button><Button disabled aria-busy="true">Loading…</Button><Button variant="outline" size="icon" aria-label="Close">×</Button></div></GalleryPanel>
          <GalleryPanel title={t("Course workflow", "课程操作")}><div className="gallery-row"><Button>Resume learning</Button><Button variant="secondary">Start course</Button><Button variant="outline">Previous</Button><Button variant="outline">Next</Button><Button variant="destructive">Restart course</Button></div></GalleryPanel>
          <GalleryPanel title={t("Selection and utilities", "选择与工具")}><div className="gallery-row"><Button variant="ghost" data-ui-role="range-option" aria-pressed="true">Week</Button><Button variant="ghost" data-ui-role="range-option" aria-pressed="false">Month</Button><Button variant="outline" data-ui-role="settings-toggle">Settings</Button><Button variant="link">Forgot password?</Button></div></GalleryPanel>
        </div>
      </GallerySection>

      <GallerySection id="forms" title={t("Forms and inputs", "表单与输入")} description={t("Auth, profile, search, settings controls", "登录、资料、搜索与设置控件")}>
        <div className="gallery-grid gallery-grid-two">
          <GalleryPanel title={t("Text fields", "文本输入框")}><div className="gallery-form-stack"><label>Email<Input type="email" placeholder="learner@example.com" /></label><label>Password<Input type="password" placeholder="••••••••" /></label><label>Search<Input type="search" placeholder="Search courses" /></label></div></GalleryPanel>
          <GalleryPanel title={t("States and selection", "状态与选择")}><div className="gallery-form-stack"><label>Course<Select defaultValue="python"><option value="python">Python Foundations</option><option value="ai">AI Basics</option></Select></label><label>Invalid<Input aria-invalid="true" defaultValue="Incorrect value" /></label><label>Disabled<Input disabled defaultValue="Unavailable" /></label><label className="gallery-check"><Checkbox defaultChecked /> Remember me</label><label>Progress<Slider defaultValue={68} aria-label="Progress preview" /></label></div></GalleryPanel>
        </div>
      </GallerySection>

      <GallerySection id="cards" title={t("Cards and containers", "卡片与容器")} description={t("Every audited non-Learning-Lab Card role", "所有已审查的非学习实验室卡片角色")}><ThemeGalleryCards t={t} /></GallerySection>

      <GallerySection id="patterns" title={t("Page patterns", "页面设计元素")} description={t("Search, code, media, and the live theme editor", "搜索、代码、媒体与实时主题编辑器")}>
        <div className="gallery-grid gallery-grid-two">
          <GalleryPanel title={t("Search action", "搜索操作")}><div className="gallery-row"><Input type="search" aria-label="Gallery search" placeholder="What would you like to learn?" /><Button>Search</Button></div></GalleryPanel>
          <GalleryPanel title={t("Code surface", "代码面板")}><pre className="component-code-preview" data-ui-role="code-surface"><code>{"score = 10\nprint(score)"}</code></pre></GalleryPanel>
          <GalleryPanel title={t("Catalog media", "课程媒体")}><div className="gallery-media" data-ui-role="catalog-art">Course cover</div></GalleryPanel>
          <GalleryEditor t={t} draft={draft} mode={mode} roleKey={roleKey} roleLabel={roleLabel} onRoleLabel={setRoleLabel} update={update} onSave={() => void save()} saving={saving} message={message} />
        </div>
      </GallerySection>

      <GallerySection id="data" title={t("Status and data", "状态与数据")} description={t("Badges, alerts, charts, achievements, loading", "徽章、提醒、图表、成就与加载")}>
        <div className="gallery-grid">
          <GalleryPanel title={t("Badges and alerts", "徽章与提醒")}><div className="gallery-row"><Badge>Default</Badge><Badge variant="secondary">Secondary</Badge><Badge data-ui-tone="success">Complete</Badge><Badge data-ui-tone="warning">Review</Badge><Badge variant="destructive">Error</Badge></div><Alert><AlertTitle>Information</AlertTitle><AlertDescription>Progress saved.</AlertDescription></Alert><Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Please retry.</AlertDescription></Alert></GalleryPanel>
          <GalleryPanel title={t("Progress and chart", "进度与图表")}><p>Weekly goal · 68%</p><Progress value={68} /><div className="theme-gallery-mini-chart" aria-label="Sample activity chart"><span /><span /><span /><span /><span /></div></GalleryPanel>
          <GalleryPanel title={t("Loading and achievement", "加载与成就")}><div className="gallery-row"><Badge data-ui-tone="success">★ First lesson</Badge><Badge variant="outline">Locked</Badge></div><Skeleton /><Skeleton className="gallery-skeleton-short" /></GalleryPanel>
        </div>
      </GallerySection>

      <GallerySection id="overlays" title={t("Overlays", "浮层组件")} description={t("Popover and dialog use the website's overlay components", "弹出层与对话框使用网站组件")}>
        <div className="gallery-grid">
          <GalleryPanel title="Popover"><Popover><PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger><PopoverContent><PopoverTitle>Notifications</PopoverTitle><p>One new lesson is ready.</p><Button variant="ghost">View course</Button></PopoverContent></Popover></GalleryPanel>
          <GalleryPanel title="Account dropdown"><DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" />}>Account menu</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Profile settings</DropdownMenuItem><DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></GalleryPanel>
          <GalleryPanel title="Dialogs"><div className="gallery-row"><Button type="button" onClick={() => setDialogOpen(true)}>Open confirmation</Button><Button variant="outline" type="button" onClick={() => setMediaOpen(true)}>Open image</Button></div></GalleryPanel>
        </div>
      </GallerySection>

      <GallerySection id="content" title={t("Lesson preview content", "课程预览内容")} description={t("Reading blocks outside Learning Lab", "学习实验室以外的阅读模块")}>
        <div className="gallery-grid gallery-grid-two"><GalleryPanel title="Text blocks"><h3>Variables store values</h3><p>Choose a name and assign a value.</p><ul><li>Write code</li><li>Run code</li></ul><a href="#content">Course reference</a></GalleryPanel><GalleryPanel title="Structured blocks"><pre className="component-code-preview" data-ui-role="code-surface"><code>{"answer = 42\nprint(answer)"}</code></pre><div className="lesson-callout lesson-callout--primary"><strong>Tip</strong><p>Use clear names.</p></div></GalleryPanel></div>
      </GallerySection>

      <footer className="gallery-footer">{t("Gallery samples use the website's components and theme CSS. Save in local development, then commit the theme JSON to include your changes in a deployment.", "画廊示例使用网站组件与主题 CSS。在本地开发环境保存后，提交主题 JSON 即可让部署版本采用更改。")}</footer>
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogTitle>Restart this course?</DialogTitle><DialogDescription>Your course progress will be reset.</DialogDescription><DialogFooter><Button variant="destructive" onClick={() => setDialogOpen(false)}>Restart</Button><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={mediaOpen} onOpenChange={setMediaOpen}><DialogContent><DialogTitle>Course image preview</DialogTitle><DialogDescription>Media lightbox example</DialogDescription><div className="gallery-media" data-ui-role="catalog-art">Course cover</div></DialogContent></Dialog>
  </main>;
}
