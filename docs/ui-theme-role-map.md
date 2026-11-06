# Theme role map

The [original UI inventory](ui-inventory.md) counted 21 Card contexts while V1 sidebar was still selectable. Modern V2 and Neobrutalism now use the topbar, leaving 20 production Card contexts. Every surviving `Card` declaration has a typed `uiRole`; the editor also has sample cards for the named colors.

The saved theme has `styles.v2` and `styles.neubrutal` for dimensions and shape, plus `palettes.<style>.light` and `palettes.<style>.dark` for colors. Each palette feeds shared page, surface, text, border, and accent tokens. The current flat field names inside each palette are compatibility keys while component roles are migrated. Named Card colors can be `"inherit"` to follow `cardBackground`; an explicit hex color overrides only that role. Advanced Settings exposes this choice beside each named card.

Shared style border widths are now `buttonBorderWidth`, `fieldBorderWidth`, and `cardBorderWidth`. Modern V2 defaults to 1px for each; Neobrutalism defaults to 3px buttons/fields and 4px Cards. They are shared by a style's Light and Dark palettes and preview live from Advanced Settings. The button width covers the default, outline, secondary, and destructive shared variants; icon utilities, links, Learning Path buttons, and media controls keep their own geometry. Text fields, textareas, and selects use the field width. Card primitives outside Learning Lab use the Card width, except the app topbar, which has a separate shell role. Custom panels without `Card` retain their documented border rules until their geometry is migrated.

Shadow audit for the next style pass: general cards on Dashboard, Analytics, Settings, Profile, Courses, and the demo course mostly use `var(--shadow)`, while Neobrutalism also has explicit 4px offset shadows on shared Cards and buttons. Overlay popovers, selected catalog cards, the Analytics V2 hero, editor fieldsets, and icon utilities have distinct shadow treatments tied to their roles or states. Keep those roles separate when introducing an editable shared shadow value; a blanket Card shadow override would erase active and hero treatments. Learning Lab floating controls and its reading view remain outside this migration.

Selector audit: production style selectors in `globals.css` reference only `v2` and `neubrutal`. The old names appear only in the preference migration function. The remaining `:nth-child` and `:nth-of-type` selectors size skeleton bars, progress glyph bars, typing dots, and decorative code-window indicators; none assign card colors. The remaining `!important` and page-specific overrides still need a cascade review before the stylesheet-order checklist item can be closed.

The live `/theme-gallery` route keeps the original gallery's toolbar, section navigation, and grid. Its examples render the same Card and control primitives and production role/class pairs as the audited pages. Gallery layout lives in its own stylesheet; component appearance comes from the website CSS and active theme tokens. Its compact editor uses the same draft state and save endpoint as Advanced Settings. Examples use representative content; full page composition and responsive context must still be checked on each route. The old `/theme-gallery.html` URL redirects through an app route; no standalone CSS snapshot remains.

## Cards and surfaces

| Role or surface | Current selector / location | Theme source |
| --- | --- | --- |
| `app-topbar` | `.topbar`, shared navigation | `shellBackground`, `shellText`, `shellBorder` in the selected palette; excluded from generic Card background |
| `app-navigation` | `.top-nav [data-slot="button"]` links and selected state | Topbar text/border, `menuItemHover` on hover, button focus colors for selected/focused state, `focusBorder` keyboard ring |
| `app-actions` | Topbar notification, search, account triggers | Topbar text, `menuItemHover` on hover/open, `focusBorder` keyboard ring |
| `auth-form` | `.login-card`, login and create account | Generic Card background/border; auth page layout |
| `dashboard-course` | `.course-card` | `dashboardCourseCard` / `darkDashboardCourseCard`; inherits generic Card in Modern V2, explicit coral in Neobrutalism |
| `dashboard-stat`, `streak` | `.stat-card[data-ui-tone="streak"]` | `dashboardStreakCard` / dark equivalent |
| `dashboard-stat`, `practice` | `.stat-card[data-ui-tone="practice"]` | `dashboardPracticeCard` / dark equivalent |
| `dashboard-stat`, `skills` | `.stat-card[data-ui-tone="skills"]` | `dashboardSkillsCard` / dark equivalent |
| `catalog-course` | `.catalog-card` | Generic Card; active state CSS |
| `course-welcome` | `.course-welcome-window` | Generic Card; welcome layout CSS |
| `course-required` | `.course-required-card` | Generic Card; fallback layout CSS |
| `demo-course-outline` | `.mock-course-outline` | Generic Card; lesson outline CSS |
| `demo-course-lesson` | `.mock-course-lesson` | Generic Card; lesson content CSS |
| `analytics-metric`, `practice/tasks/goal` | `.metric-card`, `.analysis-v2-metrics article` | `progressPracticeCard`, `progressTasksCard`, `progressGoalCard` and dark equivalents |
| `analytics-metric`, `skills` | Fourth V2 metric | Generic Card; no separate color control yet |
| `analytics-chart`, `analytics-v2-weekly` | `.chart-card`, `.analysis-v2-weekly` | `progressChartCard` / dark equivalent; inherits generic Card in all four saved combinations |
| `analytics-achievement`, `1`–`4` | `.achievement-row article`, `.analysis-v2-achievements article` | `progressAchievement1`–`4` and dark equivalents; inherit generic Card in all four saved combinations |
| `analytics-v2-course` | `.analysis-v2-course` | Course gradient / style CSS; excluded from generic Card background |
| `analytics-v2-insight` | `.analysis-v2-insight` | Insight accent / style CSS; excluded from generic Card background |
| `settings-row` | `.settings-card` | Generic Card; settings row layout CSS |
| `profile-form` | `.profile-settings-card` | Generic Card; profile layout CSS |
| `theme-preview` | `.component-preview-card` | Generic Card; editor preview layout CSS |
| `theme-editor-intro`, `theme-editor-controls` | `.advanced-settings-intro`, Advanced Settings fieldsets | Generic Card colors and shape; Modern V2 receives a soft shadow |
| `course-progress` | `.mock-course-progress` | Generic Card colors and shape |
| `course-challenge` | `.mock-course-challenge` | Muted foundation surface |
| `code-surface` | `.mock-code-example`; lesson code and annotated-code source inside `.course-preview-page` | `codeBackground`, `codeText`, `codeBorder` in the selected palette; shared Learning Lab reading view stays on its existing course palette |
| `course-feedback` | `.mock-answer-feedback` | Generic Card surface/border, with success or error accent edge |
| `search-capsule`, `search-feedback` | Dashboard search and topbar search popup | Shared field controls and focus border; feedback uses the overlay palette |
| `search-submit` | Dashboard search submit icon | Active primary base, editable button focus colors on hover/focus |
| `catalog-media`, `catalog-art` | Course image frame and generated cover art | Photo canvas remains dark; generated art derives its gradient from the selected primary and secondary colors |
| `analytics-plot` | Classic weekly chart and Analytics V2 chart | Chart grid and bars inherit foundation border, primary, and secondary colors |
| `overlay-popover`, `overlay-menu`, `overlay-dialog` | Shared Popover, DropdownMenu, and Dialog content | `overlayBackground`, `overlayText`, `overlayBorder` in the selected palette |
| `media-lightbox` | Catalog image preview dialog | Dark media canvas, intentionally independent of the overlay surface |

The separate lesson-preview route now scopes its heading, body, callout, step, table, image, resource, diagram, and code treatments to the selected foundation and code tokens. The shared Learning Lab reading view retains its existing palette. Demo-course quiz selection and completed lessons now have semantic state selectors; disabled states still need visual review.

## Button jobs

| Job | Current selector / role | Theme source |
| --- | --- | --- |
| Main action | Default `Button`, `.primary-button`, login/signup/dashboard/course/settings actions | `buttonBackground`, `buttonText`, `buttonFocusBackground`, `buttonFocusText`; style dimensions and shadow |
| Secondary / outline | `Button` secondary and outline variants, including Back and Cancel | Active secondary or foundation surface and text; style border/shadow |
| Destructive | Destructive `Button`, `course-restart`, `course-restart-confirm`, sign-out | `statusError` and surface blend; hover increases the error tint |
| Navigation | `.top-nav` shared links | App shell colors; `menuItemHover`, `focusBorder`, selected button focus colors |
| Icon utility | `search-submit`, `.topbar-search`, `.notification-button`, `auth-password-toggle`, `auth-theme-toggle` | Primary or shell colors with dedicated geometry; focus ring from `focusBorder` |
| Inline link | Link `Button`, auth text links, analytics/course back links | Active primary; underline and text treatment from variant/page CSS |
| Selection | `auth-demo-option[aria-pressed]`, `range-option[aria-pressed]`, `course-lesson-option[aria-current]`, `course-quiz-option[aria-checked]` | Selected button focus colors; quiz selection uses primary; completed lesson marker uses `statusSuccess` |
| Course workflow | `course-start`, `course-continue`, `course-restart`, `course-confirm`, `course-restart-confirm` | Default, secondary, destructive variants; busy confirmation uses spinner and disabled state |
| Settings toggle | `settings-toggle` | Outline variant and shared focus/hover treatment |
| Overlay/content tool | Dialog/notification close buttons, image zoom/close, `lesson-copy` | Ghost/outline variant and overlay or content surface; role geometry remains local |
| Provider action | `auth-provider` | Disabled outline variant; provider brand mark stays local |
| Editor example | Advanced Settings shared and page-role previews | Same variant and state selectors as production buttons; pressed, selected, disabled and busy examples |

## Status and data

| Role | Current selector / location | Theme source |
| --- | --- | --- |
| Success, warning, error status | `[data-slot="badge"]` with `data-ui-tone`; destructive badge and alert; `.auth-error`; `.mock-lesson-complete`; `.mock-answer-feedback` | `statusSuccess`, `statusWarning`, `statusError` from the active palette |
| Shared progress | `[data-slot="progress-track"]` and indicator on Dashboard, Analytics, and demo course | `progressTrack` for the track; active primary for the fill |
| Analytics V2 course progress | `.analysis-v2-course-track` | White fill on the blue course hero for local contrast; explicit page exception |
| Charts | `.weekly-chart-lines`, `.chart-grid`, `.chart-plot`, `.analysis-v2-chart` | Active outline for grids, primary/secondary for marks, active surface for chart points |
| Achievement cards | `analytics-achievement` roles, 1–4 | Named Progress achievement colors in each palette; locked opacity remains a state style |
| Loading skeletons | `[data-slot="skeleton"]` | `skeletonBackground` from the active palette |

## Other component families to migrate

| Family | Current members | Current source / next role boundary |
| --- | --- | --- |
| Buttons and links | Primary, outline, ghost, destructive, secondary, link; 12 jobs in the inventory | See the button jobs table above. Page-specific geometry and icon treatments remain in layout CSS; visual comparison is pending |
| Text fields | Login/signup, search, profile, editor sample | Shared `fieldBackground`, `fieldText`, `fieldBorder`, `focusBorder`; invalid border uses `statusError`. Read-only and disabled backgrounds blend the field and muted surface; placeholders follow muted text. Search popup inherits the same field values |
| Other fields | Three selects, four checkboxes, color pickers, sliders | Selects use shared field values and a muted disabled state; checkboxes use field border/background, primary checked color, `statusError` invalid border, and focus ring; editor color controls use field border/background; slider uses active accent. Learning Lab fields remain outside this mapping |
| Status and data | Badges, alerts, progress bars, achievements, charts, skeletons | See the status and data role map above; the white Analytics V2 hero progress is a documented local contrast exception |
| Overlays | Course dialogs, search/notification popovers, account/editor dropdowns, image lightbox | Shared primitives now use a configurable overlay role; the image lightbox has a separate media role; overlay actions still need state mapping |
| Content blocks | Internal lesson preview headings, code, callout, table, image, diagram | `.course-preview-page` now applies selected foundation colors to reading blocks; code surfaces have separate palette controls; Learning Lab retains the fixed reading palette |

The next wiring pass should inspect remaining page-specific button jobs, form disabled/error states, and CSS layering. The explicit Card and custom-surface roles and four saved palettes are in place.
