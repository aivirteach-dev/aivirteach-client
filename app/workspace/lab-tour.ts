"use client";

import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";

type Translate = (english: string, chinese: string) => string;

/** Creates the Learning Lab tour (driver.js), styled through the lab-tour-popover class in globals.css. */
export function createLabTour({ t, steps, onClosed }: { t: Translate; steps: DriveStep[]; onClosed: () => void }): Driver {
  const dark = document.documentElement.dataset.theme === "dark";
  return driver({
    steps,
    animate: true,
    smoothScroll: true,
    allowClose: true,
    allowKeyboardControl: true,
    // Clicking the grey layer does nothing, so a stray click doesn't end the tour.
    overlayClickBehavior: "none",
    overlayColor: dark ? "#000000" : "#0a0e16",
    overlayOpacity: dark ? 0.68 : 0.58,
    stagePadding: 6,
    stageRadius: 10,
    popoverOffset: 12,
    popoverClass: "lab-tour-popover",
    showProgress: true,
    progressText: t("{{current}} of {{total}}", "{{current}} / {{total}}"),
    nextBtnText: t("Next", "下一步"),
    prevBtnText: t("Back", "上一步"),
    doneBtnText: t("Done", "完成"),
    closeBtnLabel: t("Skip tour", "跳过导览"),
    onDestroyed: onClosed,
  });
}
