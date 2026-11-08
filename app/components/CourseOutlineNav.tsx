"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import type { CourseOutline, OutlineLessonState } from "../hooks/useCourseOutline";
import { localize, useLearningLanguage } from "../lib/language";

type Translate = (english: string, chinese: string) => string;

export function lessonStateLabel(state: OutlineLessonState, t: Translate) {
  return state === "done" ? t("completed", "已完成") : state === "current" ? t("up next", "下一步") : t("not started", "未开始");
}

/** Khan Academy-style course outline: modules with each lesson's status, beside the page content. */
export function CourseOutlineNav({ outline, percent }: { outline: CourseOutline | null; percent: number }) {
  const language = useLearningLanguage();
  const t: Translate = (english, chinese) => localize(language, english, chinese);

  return (
    <aside className="course-outline" aria-label={t("Course outline", "课程大纲")}>
      <div className="course-outline-head">
        <span>{t("Current course", "当前课程")}</span>
        <strong>{outline?.course.title ?? "…"}</strong>
        <div className="course-outline-progress">
          <Progress className="progress-track" value={percent} aria-label={t(`${percent}% complete`, `已完成 ${percent}%`)} />
          <small>{percent}%</small>
        </div>
      </div>
      {outline ? (
        <ol className="course-outline-modules">
          {outline.modules.map((module, moduleIndex) => (
            <li key={module.id}>
              <span className="course-outline-module">{t(`Module ${moduleIndex + 1}`, `第 ${moduleIndex + 1} 单元`)} · {module.title}</span>
              <ol>
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} data-state={lesson.state} aria-current={lesson.state === "current" ? "step" : undefined}>
                    <span className="course-outline-mark" aria-hidden="true" />
                    <span className="course-outline-title">{lesson.title}</span>
                    <span className="sr-only">({lessonStateLabel(lesson.state, t)})</span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      ) : <p className="course-outline-loading" role="status">{t("Loading course outline…", "正在加载课程大纲……")}</p>}
      <Link className="course-outline-all" href="/courses">{t("Change course", "更换课程")} →</Link>
    </aside>
  );
}
