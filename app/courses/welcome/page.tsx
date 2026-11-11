"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, ApiError, courseAssetUrl, type ApiCourseDetail } from "../../lib/api";
import { activateCourse } from "../../lib/courses";
import { localize, useLearningLanguage } from "../../lib/language";
import { CourseWelcomeWindow } from "./CourseWelcomeWindow";
import { synthesizeWelcome, welcomeView, type CourseWelcomeContent } from "./welcome-content";

export default function CourseWelcomePage() {
  const router = useRouter();
  const [course, setCourse] = useState<ApiCourseDetail | null>(null);
  const [welcome, setWelcome] = useState<CourseWelcomeContent | null>(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const language = useLearningLanguage();
  const t = (english: string, chinese: string) => localize(language, english, chinese);
  useEffect(() => {
    let active = true;
    // ?course= previews a course that has not started; without it, show the active course.
    const requestedCourseId = new URLSearchParams(window.location.search).get("course");
    const courseIdToShow = requestedCourseId
      ? Promise.resolve(requestedCourseId)
      : api.enrollments().then((enrollments) => enrollments.find((enrollment) => enrollment.active)?.courseId ?? null);
    courseIdToShow.then(async (courseId) => {
      if (!courseId) return;
      const courseData = await api.course(courseId);
      if (!active) return;
      if (!requestedCourseId) activateCourse(courseId);
      setCourse(courseData);
      try {
        const data = await api.courseWelcome(courseId);
        if (active) setWelcome(welcomeView(courseData, data));
      } catch (caught) {
        if (!(caught instanceof ApiError) || caught.status !== 404) throw caught;
        if (active) setWelcome(synthesizeWelcome(courseData));
      }
    }).catch((caught) => {
      if (active) setError(caught instanceof Error ? caught.message : "Could not prepare this course.");
    }).finally(() => { if (active) setChecked(true); });
    return () => { active = false; };
  }, []);

  // Enrolling is what starts the course, so it waits until the learner chooses to begin.
  async function startCourse(courseId: string) {
    setStarting(true);
    setStartError("");
    try {
      await api.enroll(courseId);
      activateCourse(courseId);
      router.push("/workspace");
    } catch (caught) {
      setStartError(caught instanceof Error ? caught.message : t("Could not start this course.", "无法开始本课程。"));
      setStarting(false);
    }
  }

  return (
    <main className="course-welcome-page">
      {!checked ? (
        <p className="course-welcome-loading" role="status">{t("Preparing your course...", "正在准备课程……")}</p>
      ) : course && welcome ? (
        <CourseWelcomeWindow
          course={{
            id: course.id,
            slug: course.slug,
            title: course.title,
            level: course.level,
            lessonCount: course.modules.reduce((count, courseModule) => count + courseModule.lessons.length, 0) || course.lessonCount,
            requirements: course.requirements,
          }}
          content={welcome}
          imageUrl={welcome.overviewAssetId ? courseAssetUrl(course.id, welcome.overviewAssetId) : null}
          t={t}
          onClose={() => router.replace("/courses")}
          starting={starting}
          startError={startError}
          onStart={() => void startCourse(course.id)}
        />
      ) : (
        <Card as="section" className="course-required-card" uiRole="course-required">
          <h1>{t("No active course", "没有进行中的课程")}</h1>
          <p>{error || t("Choose a course before entering the Learning Lab.", "进入学习实验室前，请先选择课程。")}</p>
          <Button className="primary-button" size="lg" type="button" onClick={() => router.replace("/courses")}>{t("Browse courses", "浏览课程")}</Button>
        </Card>
      )}
    </main>
  );
}
