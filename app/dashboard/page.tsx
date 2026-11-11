"use client";

import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "../components/Sidebar";
import { useCourseOutline } from "../hooks/useCourseOutline";
import { useLearningHome } from "../hooks/useLearningHome";
import { NoActiveCourse } from "./NoActiveCourse";
import { useLearnerProfile } from "../hooks/useLearnerProfile";
import { activateCourse } from "../lib/courses";
import { localize, useLearningLanguage } from "../lib/language";

const stateMark = { done: "✓", current: "▶", todo: "" } as const;

export default function DashboardPage() {
  const { profile, loading, error } = useLearnerProfile();
  const home = useLearningHome(!loading);
  const outline = useCourseOutline(profile, !loading && home.status === "active");
  const language = useLearningLanguage();
  const t = (english: string, chinese: string) => localize(language, english, chinese);
  const current = outline?.current ?? null;
  const allDone = outline ? outline.total > 0 && outline.completed === outline.total : false;
  const lessonHref = outline?.course.localOnly ? "/courses/python-basics" : "/workspace";
  const percent = outline && outline.total ? Math.round((outline.completed / outline.total) * 100) : profile.course.progress;
  const resume = () => { if (outline && !allDone) activateCourse(outline.course.id); };

  // Shared by the course view and the no-course view.
  const stats = (
    <div className="learn-b2-stats">
      <Card as="article" className="stat-card" uiRole="dashboard-stat" data-ui-tone="streak"><div><strong>{t(`${profile.stats.streakDays} Days`, `${profile.stats.streakDays} 天`)}</strong><span>{t("Current Streak", "连续学习")}</span></div></Card>
      <Card as="article" className="stat-card" uiRole="dashboard-stat" data-ui-tone="skills"><div><strong>{Math.round(profile.stats.practiceMinutes / 60)}h</strong><span>{t("Practice Time", "练习时间")}</span></div></Card>
      <Card as="article" className="stat-card" uiRole="dashboard-stat"><div><strong>{profile.stats.skillsMastered}</strong><span>{t("Skills Mastered", "已掌握技能")}</span></div></Card>
    </div>
  );
  const activity = profile.recentActivity.length > 0 ? (
    <section id="activity" className="learn-b2-section" aria-labelledby="learn-b2-activity">
      <h2 id="learn-b2-activity" className="learn-b2-section-title">{t("Activity", "动态")}</h2>
      <Card as="div" className="learn-b-activity">
        <ul>
          {profile.recentActivity.map((activity) => (
            <li key={activity.id}><strong>{activity.title}</strong><span>{activity.detail}</span><time>{activity.occurredAt}</time></li>
          ))}
        </ul>
      </Card>
    </section>
  ) : null;
  const hasHistory = profile.stats.streakDays > 0 || profile.stats.practiceMinutes > 0 || profile.stats.tasksCompleted > 0 || profile.stats.skillsMastered > 0;

  return (
    <div className="app-shell dashboard-shell">
      <Sidebar active="dashboard" />
      <main className={`dashboard learn-b2 page-content ${loading ? "data-loading" : ""}`}>
        {error && <Alert className="auth-error" variant="destructive">Backend unavailable: {error}</Alert>}
        {home.status === "none" ? <div className="learn-b2-main">
          <NoActiveCourse firstName={profile.name.split(" ")[0] || profile.name} paused={home.paused} completed={home.completed} newCourses={home.newCourses} t={t} />
          {hasHistory && <section className="learn-b2-section" aria-label={t("Your progress", "你的进度")}>{stats}</section>}
          {activity}
        </div> : home.status === "loading" ? <div className="learn-b2-main">
          <p className="learn-b2-loading" role="status">{t("Loading your learning...", "正在加载你的学习内容……")}</p>
        </div> : <div className="learn-b2-main">
          <header className="learn-b2-course-head">
            <div><span className="learn-b-eyebrow">{outline?.course.category ?? profile.course.category}</span><strong>{outline?.course.title ?? profile.course.title}</strong></div>
            <Link className="learn-b-link" href="/courses">{t("Change course", "更换课程")} →</Link>
          </header>

          <section id="overview" className="learn-b2-section" aria-labelledby="learn-b2-title">
            <Card as="div" className="course-card learn-b2-banner" uiRole="dashboard-course">
              <span className="learn-b-eyebrow">{allDone ? t("Course complete", "课程已完成") : t("Resume where you left off", "从上次停下的地方继续")}</span>
              <h1 id="learn-b2-title">{allDone ? (outline?.course.title ?? "") : current?.title ?? (profile.course.title || "…")}</h1>
              <p>{current ? `${current.moduleTitle}${current.minutes ? t(` · ${current.minutes} min`, ` · ${current.minutes} 分钟`) : ""}` : outline?.course.title}</p>
              <div className="learn-b2-banner-row">
                <div className="learn-b2-banner-progress">
                  <Progress className="progress-track" value={percent} aria-label={t(`${percent}% of the course complete`, `课程已完成 ${percent}%`)} />
                  <small>{outline ? t(`${outline.completed} of ${outline.total} lessons · ${percent}%`, `${outline.completed}/${outline.total} 节课 · ${percent}%`) : `${percent}%`}</small>
                </div>
                <Button render={<Link href={allDone ? "/courses" : lessonHref} />} className="primary-button resume-button" size="lg" onClick={resume}>
                  {allDone ? t("Explore Courses", "探索课程") : outline && outline.completed > 0 ? t("Resume", "继续") : t("Start course", "开始课程")} <span aria-hidden="true">→</span>
                </Button>
              </div>
            </Card>
            {stats}
          </section>

          <section id="modules" className="learn-b2-section" aria-labelledby="learn-b2-modules">
            <h2 id="learn-b2-modules" className="learn-b2-section-title">{t("Modules", "单元")}</h2>
            {outline ? (
              <div className="learn-b2-modules">
                {outline.modules.map((module, index) => {
                  const done = module.lessons.filter((lesson) => lesson.state === "done").length;
                  const hasCurrent = module.lessons.some((lesson) => lesson.state === "current");
                  return (
                    <details key={module.id} className="learn-b2-module" open={hasCurrent || outline.modules.length === 1}>
                      <summary>
                        <span className="learn-b2-module-name"><span className="learn-b-eyebrow">{t(`Module ${index + 1}`, `第 ${index + 1} 单元`)}</span><strong>{module.title}</strong></span>
                        <span className="learn-b2-module-meta">
                          <Progress className="progress-track" value={module.lessons.length ? (done / module.lessons.length) * 100 : 0} aria-label={t(`${done} of ${module.lessons.length} lessons complete`, `已完成 ${done}/${module.lessons.length} 节课`)} />
                          <small>{done}/{module.lessons.length}</small>
                        </span>
                      </summary>
                      <ol>
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} data-state={lesson.state}>
                            <span className="learn-b2-mark" aria-hidden="true">{stateMark[lesson.state]}</span>
                            <span className="learn-b2-lesson-title">{lesson.title}<span className="sr-only">{lesson.state === "done" ? t(" (completed)", "（已完成）") : lesson.state === "current" ? t(" (up next)", "（下一步）") : ""}</span></span>
                            {lesson.minutes && <span className="learn-b2-minutes">{t(`${lesson.minutes} min`, `${lesson.minutes} 分钟`)}</span>}
                            {lesson.state === "current" && <Link className="learn-b-link" href={lessonHref} onClick={resume}>{t("Resume", "继续")} →</Link>}
                          </li>
                        ))}
                      </ol>
                    </details>
                  );
                })}
              </div>
            ) : <p className="learn-b2-loading" role="status">{t("Loading modules…", "正在加载单元……")}</p>}
          </section>

          {activity}
        </div>}
      </main>
    </div>
  );
}
