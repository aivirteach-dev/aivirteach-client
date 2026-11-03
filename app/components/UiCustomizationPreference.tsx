"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { clearUiCustomizationDraft, getPreviewUiCustomization, previewUiCustomization, removeUiCustomizationPreview, subscribeToUiCustomization } from "../lib/ui-customization";
import { getSavedThemePresets } from "../lib/site-ui-customization";
import { clearThemePresetsPreview, getPreviewThemePresets, getThemePreset, subscribeToThemePresets } from "../lib/theme-presets";
import { clearInterfaceVersionPreview, getStoredInterfaceVersion, subscribeToInterfaceVersion } from "../lib/interface-version";
import { clearThemePreview, getStoredTheme, subscribeToTheme } from "../lib/theme";
import { localize, useLearningLanguage } from "../lib/language";

export function UiCustomizationPreference() {
  const [previewing, setPreviewing] = useState(false);
  const language = useLearningLanguage();
  const t = (english: string, chinese: string) => localize(language, english, chinese);

  useLayoutEffect(() => {
    const applyStored = () => {
      const presetPreview = getPreviewThemePresets();
      const legacyPreview = getPreviewUiCustomization();
      const presets = presetPreview ?? getSavedThemePresets();
      const settings = presetPreview
        ? getThemePreset(presets, getStoredInterfaceVersion(), getStoredTheme())
        : legacyPreview ?? getThemePreset(presets, getStoredInterfaceVersion(), getStoredTheme());
      setPreviewing(Boolean(presetPreview || legacyPreview));
      if (settings) previewUiCustomization(settings);
      else removeUiCustomizationPreview();
    };
    applyStored();
    const unsubscribers = [
      subscribeToUiCustomization(applyStored),
      subscribeToThemePresets(applyStored),
      subscribeToInterfaceVersion(applyStored),
      subscribeToTheme(applyStored),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  function discardPreview() {
    clearUiCustomizationDraft();
    clearThemePresetsPreview();
    clearInterfaceVersionPreview();
    clearThemePreview();
  }

  return previewing ? <aside className="theme-preview-banner" role="status"><span>{t("Theme preview", "主题预览")}</span><Link href="/settings?tab=advanced">{t("Back to editor", "返回编辑器")}</Link><button type="button" onClick={discardPreview}>{t("Discard", "放弃")}</button></aside> : null;
}
