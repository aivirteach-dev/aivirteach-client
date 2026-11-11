# UI inventory outside Learning Lab

Audit date: 2026-10-27. Scope: all `app/**/page.tsx` routes except `/workspace`, their shared components, `app/globals.css`, `app/components/course-lesson.css`, the UI primitives, and the committed theme JSON. I also inspected the running site at `localhost:3001` on Dashboard, Courses, Progress, Settings, and Advanced Settings. Counts below are the **starting audit snapshot** of JSX declaration sites, not the number of elements after lists render. The theme restructure has since changed the editor, navigation, and style choices; use the [theme role map](ui-theme-role-map.md) and [task list](../tasks-md-list/theme-system-restructure.md) for current implementation status.

## Routes and visible design areas

| Route | Main surfaces and controls |
| --- | --- |
| `/` | Redirects to `/login`; no UI. |
| `/login` | Brand, decorative glows, form card, local demo account choices, email/password fields, password reveal, remember checkbox, primary submit, disabled provider buttons, text links, theme icon, error alert. |
| `/create-account` | Same auth shell and form card, five text/password fields, terms checkbox, submit, text link, theme icon, error alert. |
| `/dashboard` | Shared navigation, greeting, current-course card, category badge, progress bar, resume CTA, three stat cards with icon tiles. The starting audit included an inline search form in `v1`; the current two-style UI uses topbar search. |
| `/courses` | Catalog header, image-led course cards, status badges, enlarge-image controls, start/continue/restart actions, enrollment and restart confirmation dialogs, image preview dialog, alerts. |
| `/courses/welcome` | One-page welcome card: title, intro, course-fact chips, "Before you start" list, close and "Start lesson 1" buttons, and an illustration panel (AI Daily Briefing has its own flow and example emails; other courses show their authored steps and welcome image). No-active-course fallback card. |
| `/courses/python-basics` | Demo course progress strip, sticky lesson outline, lesson article, code example, multiple-choice answers, correct/incorrect feedback, previous/next/check actions. |
| `/analysis` | Date-range segmented control, three metric cards, progress bar, weekly bar chart, four achievement cards. |
| `/analysis/v2` | Course summary card and progress graphic, date-range control, three metric cards, weekly activity panel/chart, insight card, four achievement cards. |
| `/settings` | Six settings rows: profile, language, theme, notifications, privacy, logout. Notifications and privacy actions are disabled placeholders. The advanced theme row is hidden for now; `/settings?tab=advanced` still opens the advanced tab, which has the scrollbar toggle, an editor and component previews. |
| `/settings/profile` | Profile summary card, name/email/role fields, save/reset/logout actions. |
| `/preview/lesson` | Internal lesson preview, populated by a parent message. Uses the same reading-surface components as Learning Lab; included here because it is a separate route. Its 13 block types are heading, paragraph, bullet list, numbered list, code, step, callout, table, image, resource link, divider, annotated code, and diagram. |

At the starting audit, the app shell had a collapsible `v1` sidebar and a topbar for the other styles. The current theme branch uses the topbar in both selectable styles. Search, notifications, and account menu live there. See [Sidebar.tsx](../app/components/Sidebar.tsx).

## Counts and types

| Element | Count in scope | Distinct treatments |
| --- | ---: | --- |
| `Card` component | **34 declaration sites** | **21 styled contexts** listed below; list rendering creates additional instances. |
| `Button` component | **78 declaration sites** | All **6** shared variants are used: default 15, outline 27, ghost 20, destructive 7, secondary 2, link 7. |
| Button sizes | **5 used** | default 45, large 21, icon 10, small icon 1, extra small 1. The primitive defines seven sizes; `sm` and `icon-xs` are unused here. |
| `Input` component | **13 declaration sites** | 7 auth fields, 2 searches, 3 profile fields, 1 advanced-preview field. Input types include text, email, password, and implicit text. No user-facing textarea outside Learning Lab. |
| `Select` component | **3 sites** | App language, interface style, and editor preview. |
| `Checkbox` component | **4 sites** | Remember me, signup terms, Learning Path shadow setting, and editor preview. |
| Color picker | **1 reusable component** | Used by **47** editor controls: 27 visible in light mode or 35 in dark mode. |
| Range slider | **1 reusable component** | Used by **11** editor controls for sizes and spacing. |
| Progress bar | **5 sites** | Dashboard course, classic analytics goal, analytics V2 course, demo course, editor preview. There are also CSS-only progress graphics. |
| Badge | **9 sites** | Default, secondary, outline, plus custom course, completion, change, and notification treatments. |
| Alert | **7 sites** | Default preview and destructive errors; several status/feedback boxes use custom CSS instead. |
| Overlays | **4 dialogs, 2 popovers, 2 dropdowns** | Course confirmations/image preview, editor demo, search, notifications, account menu, editor demo menu. The lesson image lightbox is custom. |
| Loading skeleton | **7 sites** | Account loading and editor preview. |

These counts exclude `/workspace` and its own learning controls. The Learning Lab now uses the shared button styles too; its only custom button is the floating AI button.

### The 20 Card contexts

| Family | Contexts | Count |
| --- | --- | ---: |
| App chrome | Sidebar; topbar | 2 |
| Auth | Login/signup form card | 1 |
| Dashboard | Current-course card; statistic card | 2 |
| Courses | Catalog course card; required-course fallback; demo course outline; demo lesson article | 4 |
| Analytics | Classic metric, chart, achievement; V2 course summary, metric, weekly panel, insight, achievement | 8 |
| Settings | Settings row; profile summary/form | 2 |
| Theme editor | Component preview card | 1 |

There are additional **non-Card surfaces**: advanced editor fieldsets and intro, auth account-choice tiles, dashboard search box, course image frame, demo course progress strip/code/challenge/feedback, chart bars, popovers, dialogs, image lightbox, and lesson-preview callouts/steps/code/diagram nodes. Those do not all follow Card tokens.

Other repeated design elements are page titles with small eyebrow labels, brand and avatar imagery, icon tiles and CSS-drawn glyphs, course cover images, a walkthrough video placeholder, status badges, progress bars, charts, alerts, skeletons, and locked/completed states. Typography also varies by context: the main UI uses sans-serif, classic analytics still has Georgia rules, and code areas use monospace. The UI library contains 19 component modules; `switch`, `separator`, and `collapsible` are not used by these pages.

### Button jobs to categorize

The six primitive variants are a starting point, but page CSS gives them different visual roles. A useful semantic grouping is:

1. Main actions: sign in, create account, resume, start course, save profile, save theme.
2. Secondary and outline actions: back, cancel, reset draft, browse, previous.
3. Destructive actions: restart/reset course and logout.
4. Navigation: topbar/sidebar links, lesson outline, classic/V2 links.
5. Icon utilities: search, notification, password reveal, theme toggle, collapse, image zoom/close.
6. Inline links: auth links, analytics details, course back link, theme-preview banner.
7. Selection controls: date-range segments, demo account options, quiz answers, lesson rows.
8. Course workflow: continue/restart/start and confirmation actions.
9. Settings toggles: light/dark, and scrollbar visibility on the advanced tab.
10. Overlays and content tools: dialog close/confirm, notification close, copy code, image lightbox.
11. Provider actions: disabled Google/other provider sign-in buttons.
12. Editor-only examples: four primitive variants.

These are **12 design jobs**, not 12 extra `Button` variants. Some jobs currently share a primitive variant but have their own CSS. The fixed class names on buttons include `primary-button`, `provider-button`, `password-toggle`, `search-button`, `restart-course-button`, `continue-course-button`, `settings-action-toggle`, `lesson-copy-button`, and several close/icon classes. Selection states use `active`, `selected`, `complete`, and `aria-current`.

## Theme architecture at the starting audit

- The [theme JSON](../app/lib/site-ui-customization.json) then had **61 settings**: 2 modes, 47 colors, 11 numbers, and 1 boolean. The current file uses a versioned schema with two styles and four palettes; Neobrutal Light remains the selected default.
- Interface choices then were `v1`, `v2`, `soft`, `soft-brutal`, `brutal`, and `neubrutal`, each paired with light/dark. The current selector offers only `v2` and `neubrutal`; saved legacy IDs map to one of those styles. See [layout.tsx](../app/layout.tsx), [interface-version.ts](../app/lib/interface-version.ts), and [ui-customization.ts](../app/lib/ui-customization.ts).
- Advanced Settings already exposes brand/focus, generic buttons, Learning Path buttons, generic fields, generic cards, light/dark dashboard cards, light/dark analytics cards, and dark base colors. See [AdvancedUiSettings.tsx](../app/components/AdvancedUiSettings.tsx).
- Shared CSS variables reach generic `data-slot="button"`, `data-slot="card"`, fields/selects, and menu items in [globals.css](../app/globals.css). Page and interface-version rules then layer on top. The separate lesson-preview route now inherits the selected site palette through [course-lesson.css](../app/components/course-lesson.css); Learning Lab retains its reading palette.

## Theme gaps recorded at the starting audit

1. **Generic button controls only set the default variant's base colors and size.** Outline, ghost, secondary, destructive, and link buttons still get most of their look from their primitive and page/interface CSS. The configured focused background affects keyboard focus and selected top-navigation items; it is not a general hover color for all button variants.
2. **Generic Card settings also reach chrome.** The sidebar and topbar are built with `Card`, so broad card rules can affect navigation surfaces. Named dashboard and analytics cards have later background overrides, so their individual colors take precedence over the generic card background.
3. **Per-card colors use position selectors.** Dashboard stat cards and analytics metric/achievement colors are assigned with `:nth-child(...)`, tying the theme to render order rather than semantic roles.
4. **Many surfaces bypass shared tokens.** Auth glows and account choices; catalog media; welcome content; demo course code/quiz; charts; popovers; dialogs; and lesson-preview blocks use page CSS or literal colors. The two search fields also have different containers and focus treatments.
5. **State styling is fragmented.** Hover, focus, active, selected, disabled, error, completed, locked, and loading styles are spread across primitives, page classes, and six interface modes. The editor's generic button preview shows four variants; ghost and link are missing, and the preview does not represent every page.
6. **The stylesheet is large and layered.** `globals.css` is about 3,160 lines, with base page styles, dark rules, six interface styles, advanced-token overrides, and component exceptions. The current neubrutal mode adds strong borders and offset shadows to many unrelated elements.

## Suggested theme categories

| Category | Shared tokens to define | Specialized variants to retain |
| --- | --- | --- |
| Page foundation | Background, surface levels, text, border, accent, typography, spacing | Auth backdrop; lesson reading surface |
| App chrome | Header/sidebar surface, nav item states, profile/menu surface | `v1` sidebar versus topbar |
| Cards and panels | Surface, border, radius, padding, elevation | Course hero, stat, catalog, metric, chart, achievement, settings row, code panel |
| Buttons and links | Variant colors, border, radius, shadow, size; hover/focus/pressed/disabled | Icon, segmented, choice, destructive, text link |
| Form controls | Input/select/checkbox/range/color states; label/help/error | Search capsule, auth fields, editor controls |
| Status and data | Badge, alert, progress, skeleton, metric/chart colors | Complete/locked/error/unread states |
| Overlays | Dialog, popover, dropdown, lightbox surface and close/action controls | Course confirmations and media preview |
| Content blocks | Heading/body/link, code, callout, step, table, image, diagram | Internal lesson-preview palette |

The first implementation step should be **semantic tokens for button variants and card roles**, then wire the existing page classes to those tokens. Next, add state tokens and previews for search, settings, catalog, analytics, and auth. This would let Advanced Settings change a category without relying on every page's selector order.
