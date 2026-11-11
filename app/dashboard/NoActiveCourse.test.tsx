// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ApiCourse } from "../lib/api";

const mocks = vi.hoisted(() => ({ enroll: vi.fn(), push: vi.fn(), activateCourse: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("../lib/api", async (original) => ({ ...await original<typeof import("../lib/api")>(), api: { enroll: mocks.enroll } }));
vi.mock("../lib/courses", () => ({ activateCourse: mocks.activateCourse }));
import { NoActiveCourse } from "./NoActiveCourse";

const course = (id: string): ApiCourse => ({ id, title: `Course ${id}`, category: "AI", description: "About it", level: "Beginner", durationMinutes: 60, lessonCount: 9, published: true });
const t = (english: string) => english;
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  mocks.enroll.mockResolvedValue({});
  host = document.createElement("div"); document.body.appendChild(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });

it("welcomes a new learner and previews courses without enrolling", async () => {
  await act(async () => root.render(<NoActiveCourse firstName="Maya" paused={[]} completed={[]} newCourses={[course("a")]} t={t} />));
  expect(host.querySelector("h1")?.textContent).toBe("Welcome, Maya");
  expect(host.textContent).toContain("Start here");
  expect(host.querySelector('a[href="/courses/welcome?course=a"]')?.textContent).toBe("Preview");
  expect(mocks.enroll).not.toHaveBeenCalled();
});

it("continues a paused course by making it active again", async () => {
  await act(async () => root.render(<NoActiveCourse firstName="Maya" paused={[{ course: course("p"), progressPercent: 18 }]} completed={[]} newCourses={[course("a")]} t={t} />));
  expect(host.querySelector("h1")?.textContent).toBe("Welcome back, Maya");
  expect(host.textContent).toContain("18% complete");
  expect(host.textContent).toContain("Or start something new");
  await act(async () => [...host.querySelectorAll("button")].find((button) => button.textContent === "Continue")!.click());
  expect(mocks.enroll).toHaveBeenCalledWith("p");
  expect(mocks.activateCourse).toHaveBeenCalledWith("p");
  expect(mocks.push).toHaveBeenCalledWith("/workspace");
});

it("celebrates when every course is finished", async () => {
  await act(async () => root.render(<NoActiveCourse firstName="Maya" paused={[]} completed={[course("a")]} newCourses={[]} t={t} />));
  expect(host.querySelector("h1")?.textContent).toContain("finished every course");
  expect(host.querySelector('a[href="/courses"]')?.textContent).toBe("Explore courses");
});
