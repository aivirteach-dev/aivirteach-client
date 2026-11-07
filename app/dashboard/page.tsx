"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { NotificationMenu } from "../components/NotificationMenu";
import { Sidebar } from "../components/Sidebar";
import { useLearnerProfile } from "../hooks/useLearnerProfile";
import { activateCourse, courseCatalog } from "../lib/courses";
import { localize, useLearningLanguage } from "../lib/language";

export default function DashboardPage() {
  const { profile, loading, error, recordPractice } = useLearnerProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFeedback, setSearchFeedback] = useState("");
  const language = useLearningLanguage();
  const t = (english: string, chinese: string) => localize(language, english, chinese);

  useEffect(() => {
    if (!searchFeedback) return;
    const timer = window.setTimeout(() => setSearchFeedback(""), 5000);
    return () => window.clearTimeout(timer);
  }, [searchFeedback]);

  const isAllClear = profile.accountType === "all-clear";
  const currentCatalogCourse = courseCatalog.find((course) => course.title === profile.course.title) ?? (profile.accountType === "beginner" ? courseCatalog[2] : courseCatalog[0]);
  const practiceHours = Math.round(profile.stats.practiceMinutes / 60);
  const stats = [
    { id: "streak", icon: "streak", value: t(`${profile.stats.streakDays} Days`, `${profile.stats.streakDays} 天`), label: t("Current Streak", "连续学习"), tone: "amber" },
    { id: "practice", icon: "practice", value: `${practiceHours}h`, label: t("Practice Time", "练习时间"), tone: "neutral" },
    { id: "skills", icon: "skills", value: String(profile.stats.skillsMastered), label: t("Skills Mastered", "已掌握技能"), tone: "peach" },
  ];

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchFeedback(t("Enter a course or skill to search.", "请输入要搜索的课程或技能。"));
      return;
    }

    const searchableItems = [profile.course.title, profile.course.category, profile.course.module, ...profile.skills.map((skill) => skill.name)];
    const match = searchableItems.find((item) => item.toLowerCase().includes(query.toLowerCase()));
    setSearchFeedback(match ? t(`Found: ${match}`, `找到：${match}`) : t(`No results for “${query}”.`, `未找到“${query}”的结果。`));
  }

  return (
    <div className="app-shell dashboard-shell">
      <Sidebar active="dashboard" />
      <main className={`dashboard page-content ${loading ? "data-loading" : ""}`}>
        {error && <Alert className="auth-error" variant="destructive">Backend unavailable: {error}</Alert>}
        <header className="dashboard-toolbar">
          <form className="search-box" data-ui-role="search-capsule" role="search" onSubmit={submitSearch}>
            <Input aria-label={t("Search courses and skills", "搜索课程和技能")} placeholder={t("Search...", "搜索……")} value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setSearchFeedback(""); }} />
            <Button className="search-button" data-ui-role="search-submit" variant="ghost" size="icon" type="submit" aria-label={t("Search", "搜索")}><span className="search-glyph" aria-hidden="true" /></Button>
            {searchFeedback && <output className="search-feedback" data-ui-role="search-feedback" aria-live="polite">{searchFeedback}</output>}
          </form>
          <NotificationMenu placement="dashboard" />
        </header>
        <h1 className="sr-only">{t("Dashboard", "控制台")}</h1>
        <section className="dashboard-grid" aria-label={t("Current learning overview", "当前学习概览")}>
          <Card as="article" className="course-card" uiRole="dashboard-course">
            <Badge className="course-chip" variant="secondary">◇ &nbsp; {profile.course.category}</Badge>
            <h2>{profile.course.title}</h2>
            <p>{profile.course.module}</p>
            <div className="course-progress-label"><strong>{t(`${profile.course.progress}% Completed`, `已完成 ${profile.course.progress}%`)}</strong></div>
            <Progress className="progress-track" value={profile.course.progress} aria-label={t(`${profile.course.progress}% completed`, `已完成 ${profile.course.progress}%`)} />
          <Button render={<Link href={isAllClear ? "/courses" : "/workspace"} />} className="primary-button resume-button" size="lg" onClick={() => { if (!isAllClear) { activateCourse(currentCatalogCourse.id); void recordPractice(15); } }}>{isAllClear ? t("Explore Courses", "探索课程") : t("Resume Session", "继续学习")} <span>→</span></Button>
          </Card>
          <div className="stat-stack">
            {stats.map((stat) => <Card as="article" className="stat-card" uiRole="dashboard-stat" data-ui-tone={stat.id} key={stat.id}><span className={`stat-icon ${stat.tone}`} aria-hidden="true"><i className={`stat-glyph ${stat.icon}`} /></span><div><strong>{stat.value}</strong><span>{stat.label}</span></div></Card>)}
          </div>
        </section>
      </main>
    </div>
  );
}
