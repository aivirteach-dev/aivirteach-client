import type { DriveStep, PopoverDOM } from "driver.js";
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

export type LabTourState = { vm: VmPanelState };

/** A step that only explains something: the highlighted control can't be clicked. */
function look(element: string, title: string, description: string, extra: Partial<DriveStep> = {}): DriveStep {
  return { element, disableActiveInteraction: true, popover: { title, description }, ...extra };
}

const actionHtml = (instruction: string) => `<span class="lab-tour-action">${instruction}</span>`;

/** A step the learner completes by clicking the highlighted control. */
function act(element: string, title: string, description: string, instruction: string): DriveStep {
  return {
    element,
    advanceOnClick: true,
    disableActiveInteraction: false,
    popover: { title, description: `${description}${actionHtml(instruction)}`, showButtons: ["previous", "close"] },
  };
}

/** What the VM step says, for the VM's state when the learner reaches it. */
export function vmStepText(t: Translate, vm: VmPanelState) {
  const intro = t("This is your own Ubuntu machine for the course, where you run the lesson's commands.", "这是你在本课程专用的 Ubuntu 虚拟机，课程中的命令都在这里运行。");
  switch (vm) {
    case "start-console": return { description: `${intro} ${t("Open its desktop to start.", "打开它的桌面即可开始。")}`, instruction: t("Click Start remote desktop to continue.", "点击“Start remote desktop”继续。") };
    case "console": return { description: `${intro} ${t("Its desktop is already open.", "它的桌面已经打开。")}` };
    case "stopped": return { description: `${intro} ${t("It stopped while you were away; click Resume learning environment to start it again.", "你离开时它已停止，点击“Resume learning environment”即可重新启动。")}` };
    case "error": return { description: `${intro} ${t("It could not start; click Retry, or ask AIVirTeach for help.", "它未能启动，请点击“Retry”，或向 AIVirTeach 求助。")}` };
    default: return { description: `${intro} ${t("It's still getting ready; when it is, click Start remote desktop here.", "它还在准备中。准备好后，在这里点击“Start remote desktop”。")}` };
  }
}

/** The Learning Lab tour, in driver.js steps. The VM comes last, ahead of the Ubuntu desktop. */
export function labTourSteps(t: Translate, getLab: () => LabTourState): DriveStep[] {
  return [
    {
      popover: {
        title: t("Welcome to the Learning Lab", "欢迎来到学习实验室"),
        description: t("This one-minute tour shows where your lessons, your AI tutor, and your practice machine are.", "这个一分钟的导览会带你认识课程、AI 导师和练习用的虚拟机在哪里。"),
      },
    },
    look(".lab-v2-path", t("Your lessons", "你的课程"), t("Read each lesson here and follow its steps. Copy buttons put the code on your clipboard and in your Learning VM.", "在这里阅读每节课并按步骤操作。复制按钮会把代码复制到剪贴板，同时发送到你的学习虚拟机。")),
    act(".lab-v2-tabs [role=\"tab\"]:nth-child(1)", t("Meet your AI tutor", "认识你的 AI 导师"), t("AIVirTeach knows your lesson and can check your Learning VM when something goes wrong.", "AIVirTeach 了解你正在学的课程，出现问题时还能检查你的学习虚拟机。"), t("Click AIVirTeach to continue.", "点击 AIVirTeach 继续。")),
    look(".lab-v2-teacher .tutor-prompt", t("Ask anything", "随时提问"), t("Describe what you're trying to do, or paste an error message. Press Enter to send.", "描述你想做的事，或粘贴错误信息，按 Enter 发送。"), { waitForElement: 2000 }),
    act(".lab-v2-tabs [role=\"tab\"]:nth-child(2)", t("Back to your lesson", "回到课程"), t("Switch between your tutor and your lesson at any time.", "你可以随时在导师和课程之间切换。"), t("Click Learning Path to continue.", "点击“学习路径”继续。")),
    look(".floating-ai-button", t("Ask from anywhere", "随处提问"), t("Use this button to ask AIVirTeach without leaving your lesson. You can drag it out of the way.", "点这个按钮就能在不离开课程的情况下向 AIVirTeach 提问。你也可以把它拖到别处。"), { waitForElement: 2000 }),
    look(".lab-v2-window-actions", t("Make room", "调整空间"), t("Minimise or expand the lesson panel, or drag the divider between the panels.", "可以收起或展开课程面板，也可以拖动两个面板之间的分隔条。")),
    look(".lab-v2-logo-trigger", t("Leaving the Lab", "离开实验室"), t("Click the logo to go back to your dashboard. Your progress is saved.", "点击标志即可返回仪表板，你的进度会被保存。")),
    look(".lab-v2-tour-button", t("Replay any time", "随时重看"), t("Click ? to see this tour again. Last stop: your Learning VM.", "点击“?”即可再次查看本导览。最后一站：你的学习虚拟机。")),
    {
      // The Start remote desktop button when the VM is ready; otherwise the whole VM panel.
      element: () => (document.querySelector(".vm-start-desktop") ?? document.querySelector(".lab-v2-vm")) as Element,
      advanceOnClick: true,
      disableActiveInteraction: false,
      popover: {
        title: t("Your Learning VM", "你的学习虚拟机"),
        description: "",
        // The VM panel is large: keep the popover beside it, over the lesson side.
        side: "left",
        align: "center",
        onPopoverRender: (popover: PopoverDOM) => {
          const text = vmStepText(t, getLab().vm);
          popover.description.innerHTML = text.instruction ? `${text.description}${actionHtml(text.instruction)}` : text.description;
          // driver.js hides a description that started empty.
          popover.description.style.display = "block";
          // While the learner needs to click Start remote desktop, that click is the way on.
          popover.nextButton.style.display = text.instruction ? "none" : "";
        },
      },
    },
    {
      element: ".lab-v2-vm",
      disableActiveInteraction: true,
      popover: {
        title: t("Your Ubuntu desktop", "你的 Ubuntu 桌面"),
        description: t("It can take a moment to appear. Use it like any computer: the lesson tells you what to open and what to type.", "桌面可能需要一点时间才会出现。像使用普通电脑一样使用它，课程会告诉你打开什么、输入什么。"),
        side: "left",
        align: "center",
      },
    },
  ];
}
