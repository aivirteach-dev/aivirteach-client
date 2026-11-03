"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useLearnerProfile } from "../hooks/useLearnerProfile";
import { api } from "../lib/api";
import { Avatar } from "./Avatar";
import { localize, useLearningLanguage } from "../lib/language";

export function AccountMenu() {
  const router = useRouter();
  const { profile, loading } = useLearnerProfile();
  const language = useLearningLanguage();
  const t = (english: string, chinese: string) => localize(language, english, chinese);
  if (loading) {
    return (
      <div className="account-menu account-menu-topbar">
        <div className="profile-block sidebar-profile-loading" role="status" aria-label={t("Loading learner profile", "正在加载学习者资料")}>
          <Skeleton as="span" className="profile-loading-avatar" aria-hidden="true" />
          <span className="profile-summary" aria-hidden="true"><Skeleton as="i" /><Skeleton as="i" /><Skeleton as="i" /></span>
        </div>
      </div>
    );
  }

  return (
    <div className="account-menu account-menu-topbar">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button className="profile-block profile-trigger account-menu-trigger" variant="ghost" type="button" aria-label={t(`${profile.name} account menu`, `${profile.name} 的账户菜单`)} />}>
          <Avatar size="medium" name={profile.name} src={profile.avatar} />
          <span className="profile-summary">
            <strong>{profile.name}</strong>
            <span>{t(`${profile.plan} Learner`, `${profile.plan} 学习者`)}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="account-dropdown-shadcn" side="bottom" align="end" sideOffset={8}>
          <DropdownMenuItem render={<Link href="/settings/profile" />}>{t("Profile Settings", "个人资料设置")}</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => void api.logout().finally(() => router.replace("/login"))}>{t("Sign out", "退出登录")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
