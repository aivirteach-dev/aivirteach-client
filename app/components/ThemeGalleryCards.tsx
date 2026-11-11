import { Card, type CardUiRole } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { CSSProperties } from "react";

type Translate = (english: string, chinese: string) => string;

type CardSample = {
  role: CardUiRole;
  className: string;
  wrapper?: string;
  tone?: string;
  title: string;
  chinese: string;
  route: string;
};

const cardSamples: CardSample[] = [
  { role: "auth-form", className: "login-card", title: "Sign-in form", chinese: "登录表单", route: "/login · /create-account" },
  { role: "dashboard-course", className: "course-card", title: "Current course", chinese: "当前课程", route: "/dashboard" },
  { role: "dashboard-stat", className: "stat-card", tone: "streak", title: "Streak statistic", chinese: "连续学习统计", route: "/dashboard" },
  { role: "dashboard-stat", className: "stat-card", tone: "practice", title: "Practice statistic", chinese: "练习统计", route: "/dashboard" },
  { role: "dashboard-stat", className: "stat-card", tone: "skills", title: "Skills statistic", chinese: "技能统计", route: "/dashboard" },
  { role: "catalog-course", className: "catalog-card", title: "Catalog course", chinese: "课程目录卡片", route: "/courses" },
  { role: "course-required", className: "course-required-card", title: "Course fallback", chinese: "课程提示卡片", route: "/courses/welcome" },
  { role: "demo-course-outline", className: "mock-course-outline", title: "Lesson outline", chinese: "课程目录", route: "/courses/python-basics" },
  { role: "demo-course-lesson", className: "mock-course-lesson", title: "Lesson article", chinese: "课程内容", route: "/courses/python-basics" },
  { role: "analytics-metric", className: "metric-card", tone: "practice", title: "Practice metric", chinese: "练习指标", route: "/analysis" },
  { role: "analytics-chart", className: "chart-card", title: "Activity chart", chinese: "学习图表", route: "/analysis" },
  { role: "analytics-achievement", className: "", wrapper: "achievement-row", tone: "1", title: "Achievement", chinese: "学习成就", route: "/analysis" },
  { role: "analytics-v2-course", className: "analysis-v2-course", title: "Course summary", chinese: "课程总览", route: "/analysis/v2" },
  { role: "analytics-metric", className: "", wrapper: "analysis-v2-metrics", tone: "tasks", title: "V2 metric", chinese: "V2 指标", route: "/analysis/v2" },
  { role: "analytics-v2-weekly", className: "analysis-v2-panel analysis-v2-weekly", title: "Weekly panel", chinese: "每周面板", route: "/analysis/v2" },
  { role: "analytics-v2-insight", className: "analysis-v2-insight", title: "Learning insight", chinese: "学习洞察", route: "/analysis/v2" },
  { role: "analytics-achievement", className: "", wrapper: "analysis-v2-achievements", tone: "2", title: "V2 achievement", chinese: "V2 成就", route: "/analysis/v2" },
  { role: "settings-row", className: "settings-card", title: "Settings row", chinese: "设置项目", route: "/settings" },
  { role: "profile-form", className: "profile-settings-card", title: "Profile form", chinese: "个人资料表单", route: "/settings/profile" },
  { role: "theme-preview", className: "component-preview-card", title: "Theme preview", chinese: "主题预览", route: "/settings?tab=advanced" },
];

function SampleContent({ sample, t }: { sample: CardSample; t: Translate }) {
  switch (sample.role) {
    case "auth-form":
      return <><h4>{t("Welcome back", "欢迎回来")}</h4><label>{t("Email", "电子邮箱")}<Input type="email" placeholder="learner@example.com" /></label><Button type="button">{t("Sign in", "登录")}</Button></>;
    case "dashboard-course":
      return <><Badge className="course-chip" variant="secondary">{t("IN PROGRESS", "学习中")}</Badge><h2>Python Foundations</h2><p>{t("Continue your learning path.", "继续你的学习路径。")}</p><Progress value={68} /><Button type="button">{t("Resume learning", "继续学习")}</Button></>;
    case "dashboard-stat":
      return <><span className="stat-icon" aria-hidden="true">★</span><div><strong>{sample.tone === "streak" ? "12" : sample.tone === "practice" ? "8.5 h" : "7"}</strong><span>{t(sample.title, sample.chinese)}</span></div></>;
    case "catalog-course":
      return <><div className="catalog-image-wrap" data-ui-role="catalog-media"><div className="catalog-art" data-ui-role="catalog-art" /></div><div className="catalog-copy"><div><Badge variant="secondary">{t("Available", "可学习")}</Badge><h2>Python Foundations</h2><p>{t("Learn practical programming skills.", "学习实用编程技能。")}</p></div><Button type="button">{t("Start course", "开始课程")}</Button></div></>;
    case "course-required":
      return <><h2>{t("Choose a course", "选择课程")}</h2><p>{t("Select a course to continue.", "选择课程后继续。")}</p><Button type="button">{t("Browse courses", "浏览课程")}</Button></>;
    case "demo-course-outline":
      return <><header><span>{t("COURSE OUTLINE", "课程目录")}</span><strong>Python Foundations</strong></header><ol><li><button type="button" className="active"><span>1</span><div><small>{t("LESSON 1", "第 1 课")}</small><strong>{t("Variables", "变量")}</strong></div></button></li><li><button type="button"><span>2</span><div><small>{t("LESSON 2", "第 2 课")}</small><strong>{t("Functions", "函数")}</strong></div></button></li></ol></>;
    case "demo-course-lesson":
      return <><header><div><span>{t("LESSON 1", "第 1 课")}</span><h2>{t("Variables and values", "变量和值")}</h2><p>{t("Store information for later use.", "存储信息供以后使用。")}</p></div></header><div className="mock-course-concept"><p><code>score = 10</code></p></div></>;
    case "analytics-metric":
      return sample.wrapper === "analysis-v2-metrics" ? <><span className="analysis-v2-metric-mark" aria-hidden="true" /><div><span>{t("Lessons completed", "已完成课程")}</span><strong>18</strong><small>{t("This month", "本月")}</small></div></> : <><div className="metric-top"><span className="metric-icon" aria-hidden="true">↗</span><Badge variant="outline">+12%</Badge></div><span className="metric-label">{t("Practice time", "练习时间")}</span><strong>8.5 h</strong></>;
    case "analytics-chart":
      return <><h2>{t("Weekly learning hours", "每周学习时长")}</h2><div className="theme-gallery-mini-chart" aria-hidden="true"><span /><span /><span /><span /><span /></div></>;
    case "analytics-v2-course":
      return <><div className="analysis-v2-course-copy"><span>{t("CURRENT COURSE", "当前课程")}</span><h2>Python Foundations</h2><p>{t("Keep building your skills.", "继续提升你的技能。")}</p><div className="analysis-v2-course-track"><span style={{ width: "68%" }} /></div></div><div className="analysis-v2-course-progress" style={{ "--course-progress": "68%" } as CSSProperties}><div><strong>68%</strong><span>{t("COMPLETE", "完成")}</span></div></div></>;
    case "analytics-v2-weekly":
      return <><header><div><span className="analysis-v2-label">{t("THIS WEEK", "本周")}</span><h2>{t("Learning activity", "学习活动")}</h2></div></header><div className="theme-gallery-mini-chart" aria-hidden="true"><span /><span /><span /><span /><span /></div></>;
    case "analytics-v2-insight":
      return <><header><span aria-hidden="true">AI</span><div><small>{t("PERSONAL INSIGHT", "个人洞察")}</small><strong>{t("Recommended focus", "推荐重点")}</strong></div></header><p>{t("Your practice is improving steadily.", "你的练习正在稳步进步。")}</p></>;
    case "analytics-achievement":
      return <><span aria-hidden="true">★</span><div><strong>{t("First lesson", "第一课")}</strong><small>{t("Achievement unlocked", "已解锁成就")}</small></div></>;
    case "settings-row":
      return <><div><span className="settings-card-icon" aria-hidden="true">⚙</span><div><h2>{t("Appearance", "外观")}</h2><p>{t("Choose a theme for the site.", "选择网站主题。")}</p></div></div><Button variant="outline" type="button">{t("Open", "打开")}</Button></>;
    case "profile-form":
      return <><div className="profile-settings-summary"><span className="avatar">AI</span><div><h2>{t("Learner profile", "学习者资料")}</h2><p>{t("Update your details", "更新个人资料")}</p></div></div><label>{t("Name", "姓名")}<Input defaultValue="Learner" /></label><Button type="button">{t("Save profile", "保存资料")}</Button></>;
    default:
      return <><h4>{t(sample.title, sample.chinese)}</h4><p>{t("Shared theme preview", "共享主题预览")}</p></>;
  }
}

export function ThemeGalleryCards({ t }: { t: Translate }) {
  return <section className="theme-gallery-card-catalog" aria-label={t("Website card styles", "网站卡片样式")}>
    <h3>{t("Website cards", "网站卡片")}</h3>
    <p className="advanced-control-description">{t("These samples use the same Card component, role, and page class as the website. Change a value on the left to preview it here.", "这些示例使用与网站相同的卡片组件、角色和页面样式。修改左侧数值即可在此预览。")}</p>
    <div className="theme-gallery-card-grid">
      {cardSamples.map((sample, index) => <div className="theme-gallery-card-sample" key={`${sample.role}-${index}`}>
        <div className="theme-gallery-card-caption"><strong>{t(sample.title, sample.chinese)}</strong><small>{sample.route}</small></div>
        <div className={sample.wrapper}>
          <Card as="article" className={sample.className} uiRole={sample.role} data-ui-tone={sample.tone}>
            <SampleContent sample={sample} t={t} />
          </Card>
        </div>
      </div>)}
    </div>
  </section>;
}
