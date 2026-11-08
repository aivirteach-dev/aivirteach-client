"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Sidebar } from "../components/Sidebar";
import { AchievementBadges, KeyNumbers, LessonSquares, RangeToggle, SkillMasteryTable, WeeklyHoursChart } from "../components/ProgressWidgets";
import { useCourseOutline } from "../hooks/useCourseOutline";
import { useLearnerProfile } from "../hooks/useLearnerProfile";
import { localize, useLearningLanguage } from "../lib/language";

export default function AnalysisPage() {
  const [range, setRange] = useState<"30" | "all">("30");
  const { profile, loading } = useLearnerProfile();
  const outline = useCourseOutline(profile, !loading);
  const language = useLearningLanguage();
  const t = (english: string, chinese: string) => localize(language, english, chinese);
  const percent = outline && outline.total ? Math.round((outline.completed / outline.total) * 100) : profile.course.progress;

  return (
    <div className="app-shell">
      <Sidebar active="analysis" />
      <main className="analysis learn-b2 page-content">
        <div className="learn-b2-main">
          <header className="learn-b-head learn-b-head-row">
            <div><span className="learn-b-eyebrow">{t("Learning Analytics", "学习分析")}</span><h1>{t("Mastery", "掌握情况")}</h1></div>
            <RangeToggle range={range} onChange={setRange} t={t} />
          </header>
          <p className="learn-b-insight"><strong>{t("Recommended focus:", "建议重点：")}</strong> {profile.analytics.insight}</p>

          <section className="learn-b2-section" aria-labelledby="b2-summary">
            <h2 id="b2-summary" className="learn-b2-section-title">{t("Summary", "概要")}</h2>
            <KeyNumbers profile={profile} range={range} t={t} />
          </section>

          <section className="learn-b2-section" aria-labelledby="b2-course">
            <h2 id="b2-course" className="learn-b2-section-title">{t("Course", "课程")}</h2>
            <Card as="div" className="learn-b-mastery">
              <header className="learn-b-card-head"><strong>{outline?.course.title ?? "…"}</strong><span className="learn-b-big">{percent}%</span></header>
              <LessonSquares lessons={outline?.modules.flatMap((module) => module.lessons) ?? []} t={t} large />
            </Card>
          </section>

          <section className="learn-b2-section" aria-labelledby="b2-skills">
            <h2 id="b2-skills" className="learn-b2-section-title">{t("Skills", "技能")}</h2>
            <Card as="div" className="learn-b-skills"><SkillMasteryTable profile={profile} t={t} /></Card>
          </section>

          <section className="learn-b2-section learn-b2-pair" aria-label={t("Activity and achievements", "活动与成就")}>
            <WeeklyHoursChart profile={profile} t={t} />
            <AchievementBadges profile={profile} t={t} />
          </section>
        </div>
      </main>
    </div>
  );
}
