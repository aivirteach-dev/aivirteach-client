import { describe, expect, it } from "vitest";
import type { ApiCourseDetail } from "./api";
import { embeddedCoursePage, embeddedCourseStorageKeys, serverLessonForSection } from "./embedded-course";

const lesson = (id: string) => ({ id, position: 1, title: id, estimatedMinutes: 5, objectives: [], activity: { type: "", prompt: "", completionType: "" } });
const course = {
  id: "ai-daily-briefing",
  modules: [
    { id: "m1", lessons: [lesson("docker"), lesson("n8n")] },
    { id: "m2", lessons: ["trigger", "tavily", "organize", "clean", "gemini", "parse", "email"].map(lesson) },
  ],
} as unknown as ApiCourseDetail;

describe("embedded course pages", () => {
  it("picks the tutorial page for the learner's language", () => {
    expect(embeddedCoursePage("ai-daily-briefing", "en")).toBe("/course-designs/ai-daily-briefing-v5-soft-neubrutalism.html");
    expect(embeddedCoursePage("ai-daily-briefing", "zh-CN")).toBe("/course-designs/ai-daily-briefing-v5-soft-neubrutalism-zh-CN.html");
    expect(embeddedCoursePage("ai-web-watcher-agent", "en")).toBeNull();
    expect(embeddedCoursePage(undefined, "en")).toBeNull();
  });

  it("gives the tutor the server lesson each section covers", () => {
    expect(serverLessonForSection(course, "overview")).toBe("docker");
    expect(serverLessonForSection(course, "1-2-install-and-start-n8n")).toBe("n8n");
    expect(serverLessonForSection(course, "2-5-use-gemini-to-generate-structured-news-summaries")).toBe("gemini");
    expect(serverLessonForSection(course, "3-2-customize-delivery-and-test")).toBe("email");
    expect(serverLessonForSection(course, "unknown-section")).toBeNull();
  });

  it("stays within a shorter server course", () => {
    const short = { ...course, modules: [course.modules[0]] } as ApiCourseDetail;
    expect(serverLessonForSection(short, "2-5-use-gemini-to-generate-structured-news-summaries")).toBe("n8n");
  });

  it("lists the page's own progress storage so a restart can clear it", () => {
    expect(embeddedCourseStorageKeys("ai-daily-briefing")).toEqual(["ai-daily-briefing-v2-motherduck-progress-v1"]);
    expect(embeddedCourseStorageKeys("other")).toEqual([]);
  });
});
