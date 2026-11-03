"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AccountMenu } from "./AccountMenu";
import { BrandLogo } from "./BrandLogo";
import { NotificationMenu } from "./NotificationMenu";
import { TopbarSearch } from "./TopbarSearch";
import { localize, useLearningLanguage } from "../lib/language";

type SidebarProps = { active: "dashboard" | "courses" | "workspace" | "analysis" | "settings" };

const items = [
  { id: "dashboard", label: ["Dashboard", "控制台"], href: "/dashboard" },
  { id: "courses", label: ["Courses", "课程"], href: "/courses" },
  { id: "workspace", label: ["Learning Lab", "学习实验室"], href: "/workspace" },
  { id: "analysis", label: ["Progress", "学习进度"], href: "/analysis" },
  { id: "settings", label: ["Settings", "设置"], href: "/settings" },
] as const;

export function Sidebar({ active }: SidebarProps) {
  const language = useLearningLanguage();
  const t = (english: string, chinese: string) => localize(language, english, chinese);

  return (
    <Card as="header" className="topbar" uiRole="app-topbar">
      <div className="topbar-inner">
        <Link className="topbar-brand" href="/dashboard" aria-label={t("AIVirTeach dashboard", "AIVirTeach 控制台")}>
          <BrandLogo className="topbar-brand-logo" />
        </Link>

        <nav className="top-nav" aria-label={t("Primary navigation", "主导航")}>
          {items.map((item) => (
            <Button key={item.id} render={<Link href={item.href} />} variant="ghost" className={active === item.id ? "active" : ""} aria-current={active === item.id ? "page" : undefined}>
              <span className="nav-label">{t(item.label[0], item.label[1])}</span>
            </Button>
          ))}
        </nav>

        <div className="topbar-actions">
          <NotificationMenu placement="topbar" />
          <TopbarSearch />
          <section className="topbar-profile" aria-label={t("Learner profile", "学习者资料")}>
            <AccountMenu />
          </section>
        </div>
      </div>
    </Card>
  );
}
