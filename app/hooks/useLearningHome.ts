"use client";

import { useEffect, useState } from "react";
import { api, type ApiCourse, type ApiEnrollment } from "../lib/api";
import { activateCourse, clearActiveCourse, readActiveCourse } from "../lib/courses";

export type PausedCourse = { course: ApiCourse; progressPercent: number };

export type LearningHome =
  | { status: "loading" }
  // A course is active (or the server could not be asked): show the course view.
  | { status: "active" }
  | { status: "none"; paused: PausedCourse[]; completed: ApiCourse[]; newCourses: ApiCourse[] };

function isCompleted(enrollment: ApiEnrollment) {
  return enrollment.status === "completed" || (enrollment.status === undefined && enrollment.progressPercent >= 100);
}

// Older servers omit status, so saved progress is the sign that a course was started.
function isPaused(enrollment: ApiEnrollment) {
  return enrollment.status === "in_progress" || (enrollment.status === undefined && enrollment.progressPercent > 0 && enrollment.progressPercent < 100);
}

/** Splits the learner's courses for My learning when nothing is active: paused, completed, and not yet tried. */
export function sortLearningHome(enrollments: ApiEnrollment[], catalog: ApiCourse[]): LearningHome {
  if (enrollments.some((enrollment) => enrollment.active)) return { status: "active" };
  const byId = new Map(catalog.map((course) => [course.id, course]));
  const courseFor = (enrollment: ApiEnrollment) => byId.get(enrollment.courseId) ?? enrollment.course;
  const paused = enrollments.filter(isPaused).map((enrollment) => ({ course: courseFor(enrollment), progressPercent: Math.round(enrollment.progressPercent) }));
  const completed = enrollments.filter(isCompleted).map(courseFor);
  const started = new Set([...paused.map((item) => item.course.id), ...completed.map((course) => course.id)]);
  return { status: "none", paused, completed, newCourses: catalog.filter((course) => course.published !== false && !started.has(course.id)) };
}

/** Whether the learner has an active course, and if not, what My learning should offer instead. */
export function useLearningHome(enabled = true): LearningHome {
  const [home, setHome] = useState<LearningHome>({ status: "loading" });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    // The browser-only Python demo has no server enrollment.
    if (readActiveCourse()?.localOnly) {
      queueMicrotask(() => { if (!cancelled) setHome({ status: "active" }); });
      return () => { cancelled = true; };
    }
    Promise.all([api.enrollments(), api.courses()]).then(([enrollments, catalog]) => {
      if (cancelled) return;
      const active = enrollments.find((enrollment) => enrollment.active);
      // Keep the browser's idea of the active course in step with the server, so the
      // course view never shows a course the learner has not started.
      if (active) activateCourse(active.courseId);
      else clearActiveCourse();
      setHome(sortLearningHome(enrollments, catalog));
    }).catch(() => {
      if (!cancelled) setHome({ status: "active" });
    });
    return () => { cancelled = true; };
  }, [enabled]);

  return home;
}
