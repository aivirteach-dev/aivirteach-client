"use client";

import { Fragment, type ReactNode } from "react";
import { ArrowRightIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CourseWelcomeContent } from "./welcome-content";

type Translate = (english: string, chinese: string) => string;

export type WelcomeCourse = { id: string; slug?: string; title: string; level?: string; lessonCount: number; requirements: string[] };

type Props = {
  course: WelcomeCourse;
  content: CourseWelcomeContent;
  imageUrl: string | null;
  t: Translate;
  starting?: boolean;
  startError?: string;
  onClose: () => void;
  onStart: () => void;
};

type Chip = { icon: ReactNode; label: string; tone?: "success" };
type PrepItem = { icon: ReactNode; lead: string; rest?: string; tone?: "warn" };

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const CheckIcon = () => <svg {...svg} strokeWidth="2.6"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
const NoCodeIcon = () => <svg {...svg} strokeWidth="2.4"><path d="M8 9l-4 3 4 3M16 9l4 3-4 3" /><path d="M3 3l18 18" /></svg>;
const LessonsIcon = () => <svg {...svg} strokeWidth="2.4"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 9h8M8 13h8M8 17h5" /></svg>;
const LevelIcon = () => <svg {...svg} strokeWidth="2.4"><path d="M5 19V13M12 19V9M19 19V5" /></svg>;
const ChatIcon = () => <svg {...svg} strokeWidth="2.4"><path d="M4 5h16v11H9l-5 4z" /></svg>;
const LockIcon = () => <svg {...svg} strokeWidth="2.4"><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /></svg>;
const SearchIcon = () => <svg {...svg} strokeWidth="2.3"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>;
const SparkIcon = () => <svg {...svg} strokeWidth="2.2"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" /><path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg>;
const MailIcon = () => <svg {...svg} strokeWidth="2.3"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" /></svg>;
const ShieldIcon = () => <svg {...svg} strokeWidth="2.4"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /></svg>;
const GamepadIcon = () => <svg {...svg} strokeWidth="2.4"><rect x="3" y="7" width="18" height="11" rx="4" /><path d="M8 11v3M6.5 12.5h3M15.5 12h.01M17.5 13.5h.01" /></svg>;

// Shown on every course: how to get help, and keeping keys safe.
function sharedPrep(t: Translate): PrepItem[] {
  return [
    { icon: <ChatIcon />, lead: t("Stuck?", "遇到问题？"), rest: t("Send the error message to the AI tutor.", "把错误信息发给 AI 导师。") },
    { icon: <LockIcon />, lead: t("Keep your API keys private", "妥善保管你的 API 密钥"), rest: t("— never share them, even in screenshots.", "——不要分享，截图中也不要出现。"), tone: "warn" },
  ];
}

function lessonsChip(count: number, t: Translate, short = false): Chip {
  return { icon: <LessonsIcon />, label: short ? t(`${count} short lessons`, `${count} 节短课`) : t(`${count} lessons`, `${count} 节课`) };
}

// Put the first standalone "AI" in a highlighted tile, as in the course artwork.
function titleWithTile(title: string): ReactNode {
  const match = /\bAI\b/.exec(title);
  if (!match) return title;
  return <>{title.slice(0, match.index)}<span className="welcome-ai-tile">AI</span>{title.slice(match.index + 2).replace(/^\s+/, "")}</>;
}

type Showcase = { title: ReactNode; lede: string; chips: Chip[]; prep: PrepItem[]; visual: ReactNode };

// Courses with authored welcome copy and artwork. Everything else is built from course data.
function showcaseFor(course: WelcomeCourse, t: Translate): Showcase | null {
  if (course.id !== "ai-daily-briefing" && course.slug !== "ai-daily-briefing") return null;
  return {
    title: <><span className="welcome-title-line">{t("Build your own", "打造你自己的")}</span><span className="welcome-title-line"><span className="welcome-ai-tile">AI</span><span className="welcome-title-accent">{t("briefing", "简报")}</span></span></>,
    lede: t("Pick any topic. Your workflow finds the latest updates, has AI summarize what matters, and emails it to you — automatically.", "选择任意主题。你的工作流会查找最新动态，由 AI 总结重点，并自动发送到你的邮箱。"),
    chips: [
      { icon: <NoCodeIcon />, label: t("No coding needed", "无需编程") },
      { icon: <CheckIcon />, label: t("100% free", "完全免费"), tone: "success" },
      lessonsChip(course.lessonCount, t, true),
    ],
    prep: [
      { icon: <CheckIcon />, lead: t("All you need is a Google account.", "你只需要一个 Google 账号。"), rest: t("Everything else is set up for you.", "其他一切都已为你准备好。") },
      ...sharedPrep(t),
    ],
    visual: <BriefingVisual t={t} />,
  };
}

export function CourseWelcomeWindow({ course, content, imageUrl, t, starting = false, startError, onClose, onStart }: Props) {
  const showcase = showcaseFor(course, t);
  const title = showcase?.title ?? titleWithTile(content.overview.heading);
  const lede = showcase?.lede ?? content.overview.paragraphs[0] ?? "";
  const chips: Chip[] = showcase?.chips ?? [
    lessonsChip(course.lessonCount, t),
    ...(course.level ? [{ icon: <LevelIcon />, label: course.level }] : []),
  ];
  const prep: PrepItem[] = showcase?.prep ?? [
    ...course.requirements.map((requirement) => ({ icon: <CheckIcon />, lead: requirement })),
    ...sharedPrep(t),
  ];
  const visual = showcase?.visual ?? <CourseVisual steps={content.howItWorks.steps} imageUrl={imageUrl} />;
  const hasVisual = Boolean(showcase) || content.howItWorks.steps.length > 0 || Boolean(imageUrl);

  return (
    <section className={`welcome-card${hasVisual ? "" : " welcome-card-single"}`} aria-labelledby="welcome-title">
      <Button className="welcome-close" variant="outline" size="icon" type="button" onClick={onClose} aria-label={t("Leave course welcome", "退出课程欢迎页")} title={t("Leave course welcome", "退出课程欢迎页")}>
        <XIcon aria-hidden="true" />
      </Button>

      <div className="welcome-copy">
        <h1 id="welcome-title" className={showcase ? undefined : "is-generic"}>{title}</h1>
        {lede && <p className="welcome-lede">{lede}</p>}
        {chips.length > 0 && <ul className="welcome-chips" aria-label={t("Course facts", "课程概况")}>
          {chips.map((chip) => <li key={chip.label} className={chip.tone === "success" ? "is-success" : undefined}>{chip.icon}{chip.label}</li>)}
        </ul>}
        {prep.length > 0 && <section className="welcome-prep" aria-labelledby="welcome-prep-title">
          <h2 id="welcome-prep-title">{t("Before you start", "开始之前")}</h2>
          <ul>{prep.map((item) => <li key={item.lead} className={item.tone === "warn" ? "is-warn" : undefined}><span className="welcome-prep-icon">{item.icon}</span><span><b>{item.lead}</b>{item.rest && <> {item.rest}</>}</span></li>)}</ul>
        </section>}
        <Button className="welcome-start" size="lg" type="button" onClick={onStart} disabled={starting}>
          {starting ? t("Starting...", "正在开始……") : t("Start lesson 1", "开始第 1 课")}<ArrowRightIcon aria-hidden="true" />
        </Button>
        {startError && <p className="welcome-start-error" role="alert">{startError}</p>}
      </div>

      {hasVisual && <div className="welcome-visual">{visual}</div>}
    </section>
  );
}

function BriefingVisual({ t }: { t: Translate }) {
  return <>
    <span className="sr-only">{t("How your briefing works: find, summarize, deliver. Three example briefings.", "简报的工作方式：查找、总结、发送。附三个示例简报。")}</span>
    <div className="welcome-flow" aria-hidden="true">
      <div className="welcome-node is-find"><div><SearchIcon /></div><span>{t("Find", "查找")}</span></div>
      <i className="welcome-wire" />
      <div className="welcome-node is-ai"><div><SparkIcon /></div><span>{t("Summarize", "总结")}</span></div>
      <i className="welcome-wire" />
      <div className="welcome-node is-send"><div><MailIcon /></div><span>{t("Deliver", "发送")}</span></div>
    </div>
    <div className="welcome-mails" aria-hidden="true">
      <article className="welcome-mail is-left">
        <header><span><ShieldIcon /></span><b>Security Watch</b><small>Mondays</small></header>
        <div><div className="welcome-story"><p><em className="is-primary">Security</em></p><h3>Patch now: home router flaw</h3><i className="w9" /><i className="w6" /></div></div>
      </article>
      <article className="welcome-mail is-right">
        <header><span><GamepadIcon /></span><b>Indie Games Digest</b><small>Fridays</small></header>
        <div><div className="welcome-story"><p><em className="is-accent">Releases</em></p><h3>Small studios shine at autumn show</h3><i className="w8" /><i className="w6" /></div></div>
      </article>
      <article className="welcome-mail is-front">
        <header><span><SparkIcon /></span><b>AI Daily Briefing</b><small>Every morning</small></header>
        <div>
          <div className="welcome-story">
            <p><em className="is-primary">AI</em><em>Importance 9/10</em></p>
            <h3>Open-source model tops a major coding benchmark</h3>
            <i className="w9" /><i className="w8" />
            <blockquote><b>Why it matters:</b> free tools are catching up with paid ones.</blockquote>
          </div>
          <div className="welcome-story"><p><em className="is-accent">Chips</em><em>Importance 7/10</em></p><h3>New laptop chip promises all-day battery</h3><i className="w8" /><i className="w6" /></div>
        </div>
      </article>
    </div>
  </>;
}

function CourseVisual({ steps, imageUrl }: { steps: CourseWelcomeContent["howItWorks"]["steps"]; imageUrl: string | null }) {
  const shown = steps.slice(0, 4);
  return <>
    {shown.length > 0 && <div className="welcome-flow" role="list">
      {shown.map((step, index) => <Fragment key={step.number}>
        {index > 0 && <i className="welcome-wire" aria-hidden="true" />}
        <div className={`welcome-node${index === 1 ? " is-ai" : ""}`} role="listitem"><div aria-hidden="true">{step.number}</div><span>{step.title}</span></div>
      </Fragment>)}
    </div>}
    {imageUrl && <figure className="welcome-image"><img src={imageUrl} alt="" /></figure>}
  </>;
}
