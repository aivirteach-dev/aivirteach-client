"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api, courseAssetUrl, type ApiCourse } from "../lib/api";
import { courseWelcomePath } from "../lib/course-card-state";
import { activateCourse } from "../lib/courses";
import type { PausedCourse } from "../hooks/useLearningHome";

type Translate = (english: string, chinese: string) => string;

type Props = {
  firstName: string;
  paused: PausedCourse[];
  completed: ApiCourse[];
  newCourses: ApiCourse[];
  t: Translate;
};

/** My learning when no course is active: resume a paused course, see finished ones, or preview a new one. */
export function NoActiveCourse({ firstName, paused, completed, newCourses, t }: Props) {
  const router = useRouter();
  const [resuming, setResuming] = useState<string | null>(null);
  const [error, setError] = useState("");
  const allDone = paused.length === 0 && completed.length > 0 && newCourses.length === 0;
  const returning = paused.length > 0 || completed.length > 0;

  async function resume(courseId: string) {
    setResuming(courseId);
    setError("");
    try {
      await api.enroll(courseId);
      activateCourse(courseId);
      router.push("/workspace");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("Could not continue this course.", "无法继续本课程。"));
      setResuming(null);
    }
  }

  const heading = allDone
    ? t("You've finished every course 🎉", "你已完成所有课程 🎉")
    : paused.length > 0
      ? t(`Welcome back, ${firstName}`, `欢迎回来，${firstName}`)
      : returning
        ? t(`Ready for your next course, ${firstName}?`, `${firstName}，准备好开始下一门课程了吗？`)
        : t(`Welcome, ${firstName}`, `欢迎，${firstName}`);
  return (
    <div className="learn-home">
      <header className="learn-home-head">
        <h1 id="learn-home-title">{heading}</h1>
      </header>

      {error && <Alert className="auth-error" variant="destructive">{error}</Alert>}

      {paused.length > 0 && (
        <section className="learn-b2-section" aria-labelledby="learn-home-paused">
          <h2 id="learn-home-paused" className="learn-b2-section-title">{t("Pick up where you left off", "从上次停下的地方继续")}</h2>
          <div className="learn-home-paused">
            {paused.map(({ course, progressPercent }) => (
              <Card as="article" key={course.id} className="course-card learn-home-paused-card" uiRole="dashboard-course">
                <div>
                  <span className="learn-b-eyebrow">{course.category}</span>
                  <strong>{course.title}</strong>
                </div>
                <div className="learn-home-paused-progress">
                  <Progress className="progress-track" value={progressPercent} aria-label={t(`${progressPercent}% of ${course.title} complete`, `${course.title} 已完成 ${progressPercent}%`)} />
                  <small>{t(`${progressPercent}% complete`, `已完成 ${progressPercent}%`)}</small>
                </div>
                <Button className="primary-button" type="button" disabled={resuming !== null} onClick={() => void resume(course.id)}>
                  {resuming === course.id ? t("Opening...", "正在打开……") : t("Continue", "继续")}<ArrowRightIcon aria-hidden="true" />
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {newCourses.length > 0 && (
        <section className="learn-b2-section" aria-labelledby="learn-home-new">
          <div className="learn-home-section-head">
            <h2 id="learn-home-new" className="learn-b2-section-title">{returning ? t("Or start something new", "或者开始新的课程") : t("Start here", "从这里开始")}</h2>
            <Link className="learn-b-link" href="/courses">{t("Browse all courses", "浏览全部课程")} →</Link>
          </div>
          <div className="learn-home-courses">
            {newCourses.slice(0, 3).map((course) => (
              <Card as="article" key={course.id} className="catalog-card learn-home-course" uiRole="catalog-course">
                <div className="learn-home-cover">
                  {course.coverAssetId ? <img src={courseAssetUrl(course.id, course.coverAssetId)} alt="" /> : <span aria-hidden="true" />}
                </div>
                <div className="learn-home-course-copy">
                  <span className="learn-b-eyebrow">{course.category}</span>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="learn-home-course-foot">
                    <small>{course.level}{course.lessonCount ? t(` · ${course.lessonCount} lessons`, ` · ${course.lessonCount} 节课`) : ""}</small>
                    <Button render={<Link href={courseWelcomePath(course.id)} />} nativeButton={false} variant="outline" size="sm">
                      {t("Preview", "预览")}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="learn-b2-section" aria-labelledby="learn-home-done">
          <h2 id="learn-home-done" className="learn-b2-section-title">{t("Completed", "已完成")}</h2>
          <ul className="learn-home-done">
            {completed.map((course) => (
              <li key={course.id}><CheckIcon aria-hidden="true" /><span>{course.title}</span></li>
            ))}
          </ul>
          {allDone && <Button render={<Link href="/courses" />} nativeButton={false} variant="outline">{t("Explore courses", "探索课程")}</Button>}
        </section>
      )}
    </div>
  );
}
