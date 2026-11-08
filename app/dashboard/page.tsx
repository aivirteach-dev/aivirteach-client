"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "../components/Sidebar";
import { CourseOutlineNav, lessonStateLabel } from "../components/CourseOutlineNav";
import { useCourseOutline } from "../hooks/useCourseOutline";
import { useLearnerProfile } from "../hooks/useLearnerProfile";
import { activateCourse } from "../lib/courses";
import { localize, useLearningLanguage } from "../lib/language";

export default function DashboardPage() {
  const { profile, loading, error, recordPractice } = useLearnerProfile();
  const outline = useCourseOutline(profile, !loading);
  const language = useLearningLanguage();
  const t = (english: string, chinese: string) => localize(language, english, chinese);
  const goal = Math.min(100, Math.max(0, profile.stats.weeklyGoalPercent));
  const practiceHours = Math.round(profile.stats.practiceMinutes / 60);
  const current = outline?.current ?? null;
  const allDone = outline ? outline.total > 0 && outline.completed === outline.total : false;
  const lessonHref = outline?.course.localOnly ? "/courses/python-basics" : "/workspace";
  const percent = outline && outline.total ? Math.round((outline.completed / outline.total) * 100) : profile.course.progress;

  return (
    <div className="app-shell dashboard-shell">
      <Sidebar active="dashboard" />
      <main className={`dashboard learn-b page-content ${loading ? "data-loading" : ""}`}>
        {error && <Alert className="auth-error" variant="destructive">Backend unavailable: {error}</Alert>}
        <div className="learn-b-layout">
          <CourseOutlineNav outline={outline} percent={percent} />

          <div className="learn-b-main">
            <header className="learn-b-head">
              <span className="learn-b-eyebrow">{outline?.course.category ?? profile.course.category}</span>
              <h1>{outline?.course.title ?? profile.course.title ?? t("My learning", "我的学习")}</h1>
            </header>

            <Card as="section" className="course-card learn-b-next" uiRole="dashboard-course" aria-labelledby="learn-b-next-title">
              <span className="learn-b-eyebrow">{allDone ? t("Course complete", "课程已完成") : t("Up next", "下一步")}</span>
              <h2 id="learn-b-next-title">{allDone ? t("You finished every lesson", "你已完成所有课时") : current?.title ?? t("Loading your next lesson…", "正在加载下一课时……")}</h2>
              {current && <p>{current.moduleTitle}{current.minutes ? t(` · ${current.minutes} min`, ` · ${current.minutes} 分钟`) : ""}</p>}
              <Button render={<Link href={allDone ? "/courses" : lessonHref} />} className="primary-button resume-button" size="lg" onClick={() => { if (!allDone && outline) { activateCourse(outline.course.id); void recordPractice(15); } }}>
                {allDone ? t("Explore Courses", "探索课程") : outline && outline.completed > 0 ? t("Continue lesson", "继续课时") : t("Start lesson", "开始课时")} <span aria-hidden="true">→</span>
              </Button>
            </Card>

            <Card as="section" className="learn-b-mastery" aria-labelledby="learn-b-mastery-title">
              <header className="learn-b-card-head">
                <h2 id="learn-b-mastery-title">{t("Course progress", "课程进度")}</h2>
                <span>{outline ? t(`${outline.completed} of ${outline.total} lessons`, `${outline.completed}/${outline.total} 节课`) : "…"}</span>
              </header>
              <div className="learn-b-squares" role="list" aria-label={t("Lessons by status", "按状态显示的课时")}>
                {outline?.modules.flatMap((module) => module.lessons).map((lesson, index) => (
                  <span role="listitem" key={lesson.id} className="learn-b-square" data-state={lesson.state} title={`${index + 1}. ${lesson.title}`} aria-label={`${index + 1}. ${lesson.title}: ${lessonStateLabel(lesson.state, t)}`} />
                ))}
              </div>
              <ul className="learn-b-legend" aria-hidden="true">
                <li data-state="done">{t("Completed", "已完成")}</li>
                <li data-state="current">{t("Up next", "下一步")}</li>
                <li data-state="todo">{t("Not started", "未开始")}</li>
              </ul>
              {outline?.source === "estimate" && <p className="learn-b-note">{t("Lesson titles are not available yet; positions are estimated from your course progress.", "暂无课时标题；位置根据课程进度估算。")}</p>}
            </Card>

            <section className="learn-b-stats" aria-label={t("This week", "本周")}>
              <Card as="article" className="stat-card" uiRole="dashboard-stat" data-ui-tone="streak"><div><strong>{t(`${profile.stats.streakDays} Days`, `${profile.stats.streakDays} 天`)}</strong><span>{t("Current Streak", "连续学习")}</span></div></Card>
              <Card as="article" className="stat-card learn-b-goal" uiRole="dashboard-stat" data-ui-tone="practice">
                <div><strong>{goal}%</strong><span>{t("Weekly goal", "每周目标")}</span></div>
                <Progress className="progress-track" value={goal} aria-label={t(`Weekly goal ${goal}% complete`, `每周目标已完成 ${goal}%`)} />
              </Card>
              <Card as="article" className="stat-card" uiRole="dashboard-stat" data-ui-tone="skills"><div><strong>{practiceHours}h</strong><span>{t("Practice Time", "练习时间")}</span></div></Card>
            </section>

            {profile.recentActivity.length > 0 && (
              <Card as="section" className="learn-b-activity" aria-labelledby="learn-b-activity-title">
                <header className="learn-b-card-head"><h2 id="learn-b-activity-title">{t("Recent activity", "最近动态")}</h2><Link className="learn-b-link" href="/analysis">{t("All progress", "全部进度")} →</Link></header>
                <ul>
                  {profile.recentActivity.map((activity) => (
                    <li key={activity.id}><strong>{activity.title}</strong><span>{activity.detail}</span><time>{activity.occurredAt}</time></li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
