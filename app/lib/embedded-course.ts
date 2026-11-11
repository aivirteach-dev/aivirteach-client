import type { ApiCourseDetail } from "./api";
import type { LearningLanguage } from "./language";

// Temporary: courses whose Learning Path is a tutorial page from public/course-designs,
// shown as-is in the Learning Lab until the server publishes the new content. The page
// keeps its own navigation and progress (in this browser).

type EmbeddedCourse = {
  pages: Record<LearningLanguage, string>;
  // Browser storage the page uses for its progress; cleared when the course restarts.
  storageKeys: string[];
  // Each page section and the server lesson (module, lesson; 1-based) it covers, so the
  // AI tutor is given a lesson the server knows.
  serverLessonFor: Record<string, [number, number]>;
};

const embeddedCourses: Record<string, EmbeddedCourse> = {
  "ai-daily-briefing": {
    pages: {
      en: "/course-designs/ai-daily-briefing-v5-soft-neubrutalism.html",
      "zh-CN": "/course-designs/ai-daily-briefing-v5-soft-neubrutalism-zh-CN.html",
    },
    storageKeys: ["ai-daily-briefing-v2-motherduck-progress-v1"],
    serverLessonFor: {
      "overview": [1, 1],
      "1-0-docker-basics": [1, 1],
      "1-1-install-docker": [1, 1],
      "1-2-install-and-start-n8n": [1, 2],
      "2-0-how-the-workflow-fits-together": [2, 1],
      "2-1-trigger": [2, 1],
      "2-2-retrieve-news-from-the-internet": [2, 2],
      "2-3-organize-the-news-data": [2, 3],
      "2-4-clean-deduplicate-sort-and-limit-candidate-articles": [2, 4],
      "2-5-use-gemini-to-generate-structured-news-summaries": [2, 5],
      "2-6-parse-gemini-output-and-generate-the-ai-daily-briefing": [2, 6],
      "2-7-send-the-email-and-enable-daily-automatic-execution": [2, 7],
      "3-0-what-you-can-customize": [2, 7],
      "3-1-customize-your-briefing": [2, 7],
      "3-2-customize-delivery-and-test": [2, 7],
    },
  },
};

export function embeddedCoursePage(courseId: string | undefined, language: LearningLanguage) {
  return courseId ? embeddedCourses[courseId]?.pages[language] ?? null : null;
}

export function embeddedCourseStorageKeys(courseId: string) {
  return embeddedCourses[courseId]?.storageKeys ?? [];
}

/** The server lesson a page section covers, or null when the section or course is unknown. */
export function serverLessonForSection(course: ApiCourseDetail, sectionId: string) {
  const position = embeddedCourses[course.id]?.serverLessonFor[sectionId];
  if (!position || !course.modules.length) return null;
  const courseModule = course.modules[Math.min(position[0], course.modules.length) - 1];
  const lessons = courseModule?.lessons ?? [];
  return lessons.length ? lessons[Math.min(position[1], lessons.length) - 1].id : null;
}
