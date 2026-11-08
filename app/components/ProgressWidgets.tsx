"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { OutlineLesson } from "../hooks/useCourseOutline";
import type { DemoLearner } from "../lib/mock-profile";
import { masteryLevel, type MasteryLevel } from "../lib/mastery";

type Translate = (english: string, chinese: string) => string;

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const scale: MasteryLevel["id"][] = ["attempted", "familiar", "proficient", "mastered"];
const scaleLabels: Record<MasteryLevel["id"], [string, string]> = {
  attempted: ["Attempted", "已尝试"],
  familiar: ["Familiar", "熟悉"],
  proficient: ["Proficient", "熟练"],
  mastered: ["Mastered", "已精通"],
};

/** One square per lesson (Khan Academy unit progress), with an optional legend. */
export function LessonSquares({ lessons, t, large = false, legend = true }: { lessons: OutlineLesson[]; t: Translate; large?: boolean; legend?: boolean }) {
  return (
    <>
      <div className={`learn-b-squares ${large ? "learn-b-squares-large" : ""}`} role="list" aria-label={t("Lessons by status", "按状态显示的课时")}>
        {lessons.map((lesson, index) => (
          <span role="listitem" key={lesson.id} className="learn-b-square" data-state={lesson.state} title={`${index + 1}. ${lesson.title}`}
            aria-label={`${index + 1}. ${lesson.title}: ${lesson.state === "done" ? t("completed", "已完成") : lesson.state === "current" ? t("up next", "下一步") : t("not started", "未开始")}`} />
        ))}
      </div>
      {legend && (
        <ul className="learn-b-legend" aria-hidden="true">
          <li data-state="done">{t("Completed", "已完成")}</li>
          <li data-state="current">{t("Up next", "下一步")}</li>
          <li data-state="todo">{t("Not started", "未开始")}</li>
        </ul>
      )}
    </>
  );
}

/** Skills against the four mastery levels. */
export function SkillMasteryTable({ profile, t }: { profile: DemoLearner; t: Translate }) {
  return (
    <table className="skill-mastery-table">
      <thead><tr><th scope="col">{t("Skill", "技能")}</th>{scale.map((id) => <th scope="col" key={id} data-level={id}>{t(scaleLabels[id][0], scaleLabels[id][1])}</th>)}</tr></thead>
      <tbody>
        {profile.skills.map((skill) => {
          const level = masteryLevel(skill.value);
          const reached = scale.indexOf(level.id);
          return (
            <tr key={skill.name} data-level={level.id}>
              <th scope="row">{skill.name}<small>{skill.value}% · {t(level.label, level.zh)}</small></th>
              {scale.map((id, index) => <td key={id}><span className="learn-b-step" data-reached={index <= reached ? "true" : undefined} /></td>)}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** The existing weekly bar chart, so every layout keeps the theme's chart roles. */
export function WeeklyHoursChart({ profile, t }: { profile: DemoLearner; t: Translate }) {
  const maxWeeklyHours = Math.max(4, Math.ceil(Math.max(...profile.weeklyHours)));
  return (
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
  );
}

/** Achievement badges, unlocked first. */
export function AchievementBadges({ profile, t }: { profile: DemoLearner; t: Translate }) {
  const unlocked = profile.achievements.filter((achievement) => achievement.unlocked).length;
  return (
    <Card as="section" className="learn-b-badges" aria-labelledby="achievement-badges-title">
      <header className="learn-b-card-head"><h2 id="achievement-badges-title">{t("Achievements", "成就")}</h2><span>{unlocked}/{profile.achievements.length}</span></header>
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
  );
}

/** Practice, tasks, streak, and goal in one divided strip. */
export function KeyNumbers({ profile, range, t }: { profile: DemoLearner; range: "30" | "all"; t: Translate }) {
  const practiceMinutes = range === "all" ? profile.stats.practiceMinutes : profile.stats.last30PracticeMinutes;
  const tasksCompleted = range === "all" ? profile.stats.tasksCompleted : profile.stats.last30TasksCompleted;
  return (
    <Card as="section" className="learn-b-metrics" aria-label={t("Learning outcomes", "学习成果")}>
      <div><span>{range === "all" ? t("Total practice", "总练习时间") : t("Practice time", "练习时间")}</span><strong>{Math.round(practiceMinutes / 6) / 10}h</strong></div>
      <div><span>{t("Tasks completed", "已完成任务")}</span><strong>{tasksCompleted}</strong></div>
      <div><span>{t("Current streak", "连续学习")}</span><strong>{t(`${profile.stats.streakDays} days`, `${profile.stats.streakDays} 天`)}</strong></div>
      <div><span>{t("Weekly goal", "每周目标")}</span><strong>{profile.stats.weeklyGoalPercent}%</strong></div>
    </Card>
  );
}

/** "Last 30 days / All time" toggle with the theme's range-option role. */
export function RangeToggle({ range, onChange, t }: { range: "30" | "all"; onChange: (range: "30" | "all") => void; t: Translate }) {
  return (
    <div className="range-toggle" aria-label={t("Analytics date range", "分析时间范围")}>
      <Button variant="ghost" type="button" data-ui-role="range-option" aria-pressed={range === "30"} className={range === "30" ? "active" : ""} onClick={() => onChange("30")}>{t("Last 30 Days", "最近 30 天")}</Button>
      <Button variant="ghost" type="button" data-ui-role="range-option" aria-pressed={range === "all"} className={range === "all" ? "active" : ""} onClick={() => onChange("all")}>{t("All Time", "全部时间")}</Button>
    </div>
  );
}
