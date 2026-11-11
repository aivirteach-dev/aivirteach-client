import type { ApiCourseDetail, ApiCourseWelcome } from "../../lib/api";

export type CourseWelcomeStep = { number: string; title: string; description: string };

export type CourseWelcomeContent = {
  overviewAssetId: string | null;
  overview: { heading: string; paragraphs: string[] };
  howItWorks: { heading: string; steps: CourseWelcomeStep[] };
};

// Courses ingested without a dedicated welcome.json have no CourseWelcome row, so
// GET /courses/:slug/welcome 404s. Build an equivalent welcome view from the course
// detail that's already loaded, instead of blocking the learner from reaching /workspace.
export function synthesizeWelcome(course: ApiCourseDetail): CourseWelcomeContent {
  return {
    overviewAssetId: null,
    overview: { heading: course.title, paragraphs: [course.description] },
    // Requirements are listed under "Before you start"; only authored steps describe how it works.
    howItWorks: { heading: "How it works", steps: [] },
  };
}

// Keep the wire contract separate from the display model. New admin courses have
// an empty welcome row; use their course metadata until welcome content is authored.
export function welcomeView(course: ApiCourseDetail, data: ApiCourseWelcome): CourseWelcomeContent {
  const fallback = synthesizeWelcome(course);
  const steps = data.howItWorksSteps;
  if (steps !== null && (!Array.isArray(steps) || !steps.every((step) =>
    typeof step === "object" && step !== null &&
    typeof step.number === "string" && typeof step.title === "string" &&
    typeof step.description === "string"
  ))) {
    throw new Error("Invalid course welcome steps.");
  }
  return {
    overviewAssetId: data.overviewAssetId,
    overview: {
      heading: data.overviewHeading ?? fallback.overview.heading,
      paragraphs: data.overviewParagraphs.length ? data.overviewParagraphs : fallback.overview.paragraphs,
    },
    howItWorks: { ...fallback.howItWorks, steps: (steps ?? []) as CourseWelcomeStep[] },
  };
}
