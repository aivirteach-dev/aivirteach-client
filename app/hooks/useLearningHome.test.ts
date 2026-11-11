import { describe, expect, it } from "vitest";
import type { ApiCourse, ApiEnrollment } from "../lib/api";
import { sortLearningHome } from "./useLearningHome";

const course = (id: string, extra: Partial<ApiCourse> = {}): ApiCourse => ({ id, title: id, category: "AI", description: "", level: "Beginner", durationMinutes: 60, lessonCount: 5, published: true, ...extra });
const enrollment = (courseId: string, extra: Partial<ApiEnrollment> = {}): ApiEnrollment => ({ id: `e-${courseId}`, userId: "u", courseId, active: false, progressPercent: 0, currentModule: "", enrolledAt: "", course: course(courseId), ...extra });
const catalog = [course("a"), course("b"), course("c"), course("hidden", { published: false })];

describe("sortLearningHome", () => {
  it("shows the course view when a course is active", () => {
    expect(sortLearningHome([enrollment("a", { active: true })], catalog)).toEqual({ status: "active" });
  });

  it("offers every published course to a brand-new learner", () => {
    expect(sortLearningHome([], catalog)).toEqual({ status: "none", paused: [], completed: [], newCourses: [catalog[0], catalog[1], catalog[2]] });
  });

  it("separates paused, completed, and untouched courses", () => {
    const home = sortLearningHome([
      enrollment("a", { status: "in_progress", progressPercent: 18.4 }),
      enrollment("b", { status: "completed", progressPercent: 100 }),
      enrollment("c", { status: "not_started" }),
    ], catalog);
    expect(home).toEqual({ status: "none", paused: [{ course: catalog[0], progressPercent: 18 }], completed: [catalog[1]], newCourses: [catalog[2]] });
  });

  it("uses saved progress when an older server sends no status", () => {
    const home = sortLearningHome([enrollment("a", { progressPercent: 40 }), enrollment("b", { progressPercent: 100 }), enrollment("c")], catalog);
    expect(home).toMatchObject({ paused: [{ course: catalog[0], progressPercent: 40 }], completed: [catalog[1]], newCourses: [catalog[2]] });
  });
});
