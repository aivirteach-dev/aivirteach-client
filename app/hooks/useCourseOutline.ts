"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { courseCatalog, readActiveCourse, type DemoCourse } from "../lib/courses";
import { mockCourseLessons, readMockCourseProgress } from "../lib/mock-course";
import type { DemoLearner } from "../lib/mock-profile";

export type OutlineLessonState = "done" | "current" | "todo";
export type OutlineLesson = { id: string; title: string; minutes: number | null; state: OutlineLessonState };
export type OutlineModule = { id: string; title: string; lessons: OutlineLesson[] };
export type CourseOutline = {
  course: DemoCourse;
  modules: OutlineModule[];
  completed: number;
  total: number;
  current: (OutlineLesson & { moduleTitle: string }) | null;
  /** "server" when lessons and progress came from the API, "browser" for the local Python demo, "estimate" when only the catalog lesson count was available. */
  source: "server" | "browser" | "estimate";
};

function pickCourse(profile: DemoLearner) {
  return readActiveCourse()
    ?? courseCatalog.find((course) => course.title === profile.course.title)
    ?? (profile.accountType === "beginner" ? courseCatalog[2] : courseCatalog[0]);
}

function finish(course: DemoCourse, modules: OutlineModule[], source: CourseOutline["source"]): CourseOutline {
  const lessons = modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title })));
  return {
    course,
    modules,
    completed: lessons.filter((lesson) => lesson.state === "done").length,
    total: lessons.length,
    current: lessons.find((lesson) => lesson.state === "current") ?? null,
    source,
  };
}

function markCurrent(modules: OutlineModule[], currentId: string | null) {
  const firstOpen = currentId ?? modules.flatMap((module) => module.lessons).find((lesson) => lesson.state !== "done")?.id ?? null;
  return modules.map((module) => ({ ...module, lessons: module.lessons.map((lesson) => (lesson.id === firstOpen && lesson.state !== "done" ? { ...lesson, state: "current" as const } : lesson)) }));
}

/** Lessons of the learner's active course with completion state, for outline and path views. */
export function useCourseOutline(profile: DemoLearner, enabled = true) {
  const [outline, setOutline] = useState<CourseOutline | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const course = pickCourse(profile);

    async function load() {
      if (course.localOnly) {
        const done = new Set(readMockCourseProgress().completedLessonIds);
        const lessons = mockCourseLessons.map((lesson) => ({ id: lesson.id, title: lesson.title, minutes: 5, state: (done.has(lesson.id) ? "done" : "todo") as OutlineLessonState }));
        return finish(course, markCurrent([{ id: "python-basics", title: course.title, lessons }], null), "browser");
      }
      try {
        const [detail, progress] = await Promise.all([api.course(course.id), api.learningProgress(course.id).catch(() => null)]);
        const done = new Set(progress?.completedLessonIds ?? []);
        const modules = detail.modules.map((module) => ({
          id: module.id,
          title: module.title,
          lessons: module.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, minutes: lesson.estimatedMinutes || null, state: (done.has(lesson.id) ? "done" : "todo") as OutlineLessonState })),
        }));
        return finish(course, markCurrent(modules, progress?.currentLessonId ?? progress?.nextLessonId ?? null), "server");
      } catch {
        const doneCount = Math.round((profile.course.progress / 100) * course.lessons);
        const lessons = Array.from({ length: course.lessons }, (_, index) => ({ id: `${course.id}-${index + 1}`, title: `Lesson ${index + 1}`, minutes: null, state: (index < doneCount ? "done" : "todo") as OutlineLessonState }));
        return finish(course, markCurrent([{ id: course.id, title: profile.course.module || course.title, lessons }], null), "estimate");
      }
    }

    void load().then((result) => { if (!cancelled) setOutline(result); });
    return () => { cancelled = true; };
  }, [profile, enabled]);

  return outline;
}
