"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sidebar } from "../components/Sidebar";
import { CourseOutlineNav } from "../components/CourseOutlineNav";
import { useCourseOutline } from "../hooks/useCourseOutline";
import { useLearnerProfile } from "../hooks/useLearnerProfile";
import { localize, useLearningLanguage } from "../lib/language";
import { masteryLevel, type MasteryLevel } from "../lib/mastery";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const scale: MasteryLevel["id"][] = ["attempted", "familiar", "proficient", "mastered"];
const scaleLabels: Record<MasteryLevel["id"], [string, string]> = {
  attempted: ["Attempted", "已尝试"],
  familiar: ["Familiar", "熟悉"],
  proficient: ["Proficient", "熟练"],
  mastered: ["Mastered", "已精通"],
};

export default function AnalysisPage() {
  const [range, setRange] = useState<"30" | "all">("30");
  const { profile, loading } = useLearnerProfile();
  const outline = useCourseOutline(profile, !loading);
  const language = useLearningLanguage();
  const t = (english: string, chinese: string) => localize(language, english, chinese);
  const practiceMinutes = range === "all" ? profile.stats.practiceMinutes : profile.stats.last30PracticeMinutes;
  const practiceHours = Math.round(practiceMinutes / 6) / 10;
  const tasksCompleted = range === "all" ? profile.stats.tasksCompleted : profile.stats.last30TasksCompleted;
  const maxWeeklyHours = Math.max(4, Math.ceil(Math.max(...profile.weeklyHours)));
  const percent = outline && outline.total ? Math.round((outline.completed / outline.total) * 100) : profile.course.progress;
  const lessons = outline?.modules.flatMap((module) => module.lessons) ?? [];

  return (
    <div className="app-shell">
      <Sidebar active="analysis" />
      <main className="analysis learn-b page-content">
        <div className="learn-b-layout">
          <CourseOutlineNav outline={outline} percent={percent} />

          <div className="learn-b-main">
            <header className="learn-b-head learn-b-head-row">
              <div>
                <span className="learn-b-eyebrow">{t("Learning Analytics", "学习分析")}</span>
                <h1>{t("Mastery", "掌握情况")}</h1>
              </div>
              <div className="range-toggle" aria-label={t("Analytics date range", "分析时间范围")}>
                <Button variant="ghost" type="button" data-ui-role="range-option" aria-pressed={range === "30"} className={range === "30" ? "active" : ""} onClick={() => setRange("30")}>{t("Last 30 Days", "最近 30 天")}</Button>
                <Button variant="ghost" type="button" data-ui-role="range-option" aria-pressed={range === "all"} className={range === "all" ? "active" : ""} onClick={() => setRange("all")}>{t("All Time", "全部时间")}</Button>
              </div>
            </header>

            <p className="learn-b-insight"><strong>{t("Recommended focus:", "建议重点：")}</strong> {profile.analytics.insight}</p>

            <div className="learn-b-grid">
              <Card as="section" className="learn-b-mastery" aria-labelledby="b-course-mastery">
                <header className="learn-b-card-head"><h2 id="b-course-mastery">{t("Course mastery", "课程掌握")}</h2><span className="learn-b-big">{percent}%</span></header>
                <div className="learn-b-squares learn-b-squares-large" role="list" aria-label={t("Lessons by status", "按状态显示的课时")}>
                  {lessons.map((lesson, index) => <span role="listitem" key={lesson.id} className="learn-b-square" data-state={lesson.state} title={`${index + 1}. ${lesson.title}`} aria-label={`${index + 1}. ${lesson.title}`} />)}
                </div>
                <ul className="learn-b-legend" aria-hidden="true">
                  <li data-state="done">{t("Completed", "已完成")}</li>
                  <li data-state="current">{t("Up next", "下一步")}</li>
                  <li data-state="todo">{t("Not started", "未开始")}</li>
                </ul>
              </Card>

              <Card as="section" className="learn-b-skills" aria-labelledby="b-skills">
                <header className="learn-b-card-head"><h2 id="b-skills">{t("Skills", "技能")}</h2><span>{t(`${profile.stats.skillsMastered} mastered`, `已精通 ${profile.stats.skillsMastered} 项`)}</span></header>
                <table>
                  <thead><tr><th scope="col">{t("Skill", "技能")}</th>{scale.map((id) => <th scope="col" key={id} data-level={id}>{t(scaleLabels[id][0], scaleLabels[id][1])}</th>)}</tr></thead>
                  <tbody>
                    {profile.skills.map((skill) => {
                      const level = masteryLevel(skill.value);
                      const reached = scale.indexOf(level.id);
                      return (
                        <tr key={skill.name} data-level={level.id}>
                          <th scope="row">{skill.name}<small>{skill.value}%</small></th>
                          {scale.map((id, index) => <td key={id}><span className="learn-b-step" data-reached={index <= reached ? "true" : undefined} aria-label={index === reached ? t(scaleLabels[id][0], scaleLabels[id][1]) : undefined} /></td>)}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </div>

            <Card as="section" className="learn-b-metrics" aria-label={t("Learning outcomes", "学习成果")}>
              <div><span>{range === "all" ? t("Total practice", "总练习时间") : t("Practice time", "练习时间")}</span><strong>{practiceHours}h</strong></div>
              <div><span>{t("Tasks completed", "已完成任务")}</span><strong>{tasksCompleted}</strong></div>
              <div><span>{t("Current streak", "连续学习")}</span><strong>{t(`${profile.stats.streakDays} days`, `${profile.stats.streakDays} 天`)}</strong></div>
              <div><span>{t("Weekly goal", "每周目标")}</span><strong>{profile.stats.weeklyGoalPercent}%</strong></div>
            </Card>

            <div className="learn-b-grid">
              <Card as="article" className="chart-card" uiRole="analytics-chart">
                <h2>{t("Weekly Learning Hours", "每周学习时长")}</h2>
                <div className="weekly-chart" role="img" aria-label={`Learning hours from Monday to Sunday: ${profile.weeklyHours.join(", ")} hours`}>
                  <div className="weekly-chart-scale" aria-hidden="true"><span>{maxWeeklyHours}h</span><span>{maxWeeklyHours / 2}h</span><span>0h</span></div>
                  <div className="weekly-chart-plot" data-ui-role="analytics-plot">
                    <div className="weekly-chart-lines" aria-hidden="true"><i /><i /><i /></div>
                    {profile.weeklyHours.map((hours, index) => (
                      <div className="weekly-bar-column" key={days[index]} title={`${days[index]}: ${hours} hours`}>
                        <span className="weekly-bar-value">{hours || "–"}</span>
                        <i className="weekly-bar" style={{ height: `${Math.max(hours ? 5 : 0, hours / maxWeeklyHours * 100)}%` }} />
                        <strong>{days[index]}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card as="section" className="learn-b-badges" aria-labelledby="b-badges">
                <header className="learn-b-card-head"><h2 id="b-badges">{t("Achievements", "成就")}</h2><span>{profile.achievements.filter((a) => a.unlocked).length}/{profile.achievements.length}</span></header>
                <ul>
                  {profile.achievements.map((achievement) => (
                    <li key={achievement.title} className={achievement.unlocked ? "unlocked" : "locked"}>
                      <span aria-hidden="true">{achievement.icon}</span>
                      <strong>{achievement.title}</strong>
                      <small>{achievement.unlocked ? achievement.subtitle : t("Locked", "未解锁")}</small>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
