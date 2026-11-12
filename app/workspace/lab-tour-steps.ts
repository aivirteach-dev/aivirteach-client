import type { TourStep } from "./LabTour";
import type { VmPanelState } from "./vm-panel-state";

type Translate = (english: string, chinese: string) => string;

// v1: bump when the steps change enough that returning learners should see them again.
export const labTourSeenKey = "aivirteach.labTour.v1.seen";

export function hasSeenLabTour() {
  try { return window.localStorage.getItem(labTourSeenKey) === "true"; } catch { return true; }
}

export function markLabTourSeen() {
  try { window.localStorage.setItem(labTourSeenKey, "true"); } catch { /* storage unavailable */ }
}

type LabState = {
  activeTab: "teacher" | "path";
  /** What the VM panel is showing. */
  vm: VmPanelState;
  /** True once "Start remote desktop" has been clicked (it is starting or open). */
  desktopStarted: boolean;
};

/** What the VM step says and asks for, depending on the VM's state. */
function vmStep(t: Translate, lab: LabState): TourStep {
  const base = { id: "vm", title: t("Your Learning VM", "你的学习虚拟机") };
  if (lab.vm === "start-console" || (lab.vm === "console" && lab.desktopStarted)) {
    return {
      ...base,
      target: lab.vm === "start-console" ? ".vm-start-desktop" : ".lab-v2-vm",
      body: t("This is your own Ubuntu machine for the course, where you run the lesson's commands. Open its desktop to start.", "这是你在本课程专用的 Ubuntu 虚拟机，课程中的命令都在这里运行。打开它的桌面即可开始。"),
      action: t("Click Start remote desktop to continue.", "点击“Start remote desktop”继续。"),
      done: lab.desktopStarted,
    };
  }
  const body = lab.vm === "console"
    ? t("This is your own Ubuntu machine for the course, where you run the lesson's commands. Its desktop is already open.", "这是你在本课程专用的 Ubuntu 虚拟机，课程中的命令都在这里运行。它的桌面已经打开。")
    : lab.vm === "stopped"
      ? t("This is your own Ubuntu machine for the course. It stopped while you were away; click Resume learning environment to start it again.", "这是你在本课程专用的 Ubuntu 虚拟机。你离开时它已停止，点击“Resume learning environment”即可重新启动。")
      : lab.vm === "error"
        ? t("This is your own Ubuntu machine for the course. It could not start; click Retry, or ask AIVirTeach for help.", "这是你在本课程专用的 Ubuntu 虚拟机。它未能启动，请点击“Retry”，或向 AIVirTeach 求助。")
        : t("This is your own Ubuntu machine for the course. It's still getting ready; when it is, click Start remote desktop here.", "这是你在本课程专用的 Ubuntu 虚拟机，它还在准备中。准备好后，在这里点击“Start remote desktop”。");
  return { ...base, target: ".lab-v2-vm", body };
}

/** The Learning Lab tour. Steps with an action move on when the learner does it; the VM comes last. */
export function labTourSteps(t: Translate, lab: LabState): TourStep[] {
  return [
    {
      id: "welcome",
      title: t("Welcome to the Learning Lab", "欢迎来到学习实验室"),
      body: t("This one-minute tour shows where your lessons, your AI tutor, and your practice machine are.", "这个一分钟的导览会带你认识课程、AI 导师和练习用的虚拟机在哪里。"),
    },
    {
      id: "lesson",
      target: ".lab-v2-path",
      // The lesson can be scrolled during this step, but not clicked.
      scroll: ".lab-v2-path .lab-v2-embedded-course, .lab-v2-path .course-learning-path",
      title: t("Your lessons", "你的课程"),
      body: t("Read each lesson here and follow its steps. Scroll to look around. Copy buttons put the code on your clipboard and in your Learning VM.", "在这里阅读每节课并按步骤操作，可以滚动浏览。复制按钮会把代码复制到剪贴板，同时发送到你的学习虚拟机。"),
    },
    {
      id: "tutor-tab",
      target: ".lab-v2-tabs [role=\"tab\"]:nth-child(1)",
      title: t("Meet your AI tutor", "认识你的 AI 导师"),
      body: t("AIVirTeach knows your lesson and can check your Learning VM when something goes wrong.", "AIVirTeach 了解你正在学的课程，出现问题时还能检查你的学习虚拟机。"),
      action: t("Click AIVirTeach to continue.", "点击 AIVirTeach 继续。"),
      done: lab.activeTab === "teacher",
    },
    {
      id: "tutor-input",
      target: ".lab-v2-teacher .tutor-prompt",
      title: t("Ask anything", "随时提问"),
      body: t("Describe what you're trying to do, or paste an error message. Press Enter to send.", "描述你想做的事，或粘贴错误信息，按 Enter 发送。"),
    },
    {
      id: "path-tab",
      target: ".lab-v2-tabs [role=\"tab\"]:nth-child(2)",
      title: t("Back to your lesson", "回到课程"),
      body: t("Switch between your tutor and your lesson at any time.", "你可以随时在导师和课程之间切换。"),
      action: t("Click Learning Path to continue.", "点击“学习路径”继续。"),
      done: lab.activeTab === "path",
    },
    {
      id: "floating-ai",
      target: ".floating-ai-button",
      title: t("Ask from anywhere", "随处提问"),
      body: t("Use this button to ask AIVirTeach without leaving your lesson. You can drag it out of the way.", "点这个按钮就能在不离开课程的情况下向 AIVirTeach 提问。你也可以把它拖到别处。"),
    },
    {
      id: "layout",
      target: ".lab-v2-window-actions",
      title: t("Make room", "调整空间"),
      body: t("Minimise or expand the lesson panel, or drag the divider between the panels.", "可以收起或展开课程面板，也可以拖动两个面板之间的分隔条。"),
    },
    {
      id: "leave",
      target: ".lab-v2-logo-trigger",
      title: t("Leaving the Lab", "离开实验室"),
      body: t("Click the logo to go back to your dashboard. Your progress is saved.", "点击标志即可返回仪表板，你的进度会被保存。"),
    },
    {
      id: "replay",
      target: ".lab-v2-tour-button",
      title: t("Replay any time", "随时重看"),
      body: t("Click ? to see this tour again. Last stop: your Learning VM.", "点击“?”即可再次查看本导览。最后一站：你的学习虚拟机。"),
    },
    vmStep(t, lab),
    {
      id: "desktop",
      target: ".lab-v2-vm",
      title: t("Your Ubuntu desktop", "你的 Ubuntu 桌面"),
      body: t("It can take a moment to appear. Use it like any computer: the lesson tells you what to open and what to type.", "桌面可能需要一点时间才会出现。像使用普通电脑一样使用它，课程会告诉你打开什么、输入什么。"),
    },
  ];
}
