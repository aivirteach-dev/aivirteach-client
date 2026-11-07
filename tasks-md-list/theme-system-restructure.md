# Theme system restructure

Status: In progress
Working branch: `feature/theme-system-restructure`
References: [UI inventory](../docs/ui-inventory.md), [theme role map](../docs/ui-theme-role-map.md)

## Goal

Organize the audited UI so every themed element has a clear, named source for its appearance. Keep **Modern V2** and **Neobrutalism** as the two selectable styles, each with **Light** and **Dark** colors. The result is four editable theme combinations. Keep Neobrutal Light as the site default until a saved setting changes it.

Scope: routes outside Learning Lab, shared navigation, and the Advanced Settings previews. The separate `/preview/lesson` route is included because it uses the shared reading components. The Learning Lab controls need their own mapping before they are migrated.

## Starting point

- [x] Audit the non-Learning-Lab pages and shared UI: 21 Card contexts, 12 button jobs, 13 Input declarations, and the other controls in the inventory.
- [x] Create the working branch `feature/theme-system-restructure` from `docs/ui-theme-taxonomy`.
- [x] Review and preserve the existing uncommitted Learning Lab work before changing UI code.
- [x] Build a [live UI theme gallery](../app/theme-gallery/page.tsx) of the non-Learning-Lab component families. It keeps the original gallery's sticky toolbar, section navigation, and component grid, while using website Card and control components, production page classes, and shared theme values. A compact editor previews and saves supported values through the site-wide theme JSON. An app route redirects the old `/theme-gallery.html` URL; visual parity for each sample remains part of section 5.
- [ ] Record the current appearance of each audited route in Modern V2 and Neobrutal Light/Dark as a comparison baseline. Browser access is currently unavailable in this workspace, so screenshots and visual comparisons are pending.
- [ ] Complete a mapping of `route/component → current selector → semantic role → theme setting`, including custom card-like panels. The Card map is recorded; remaining custom surfaces are listed for the next wiring pass.

## 1. Define the theme hierarchy

- [x] Define a typed theme schema with two style IDs: the existing `v2` (displayed as Modern V2) and `neubrutal`.
- [ ] Define style values for border width, radius, shadow, spacing, and typography. The schema now separates 15 style values from the four color palettes, including shared button, field, and Card border widths. Page-specific shadow and typography rules still need consolidation.
- [x] Define Light and Dark palettes for each style. Four separate palettes now include page, surface, text, border, primary, and secondary colors, and the active palette feeds the shared CSS foundation tokens.
- [ ] Define component defaults and named role overrides for cards, buttons, fields, status elements, overlays, and content blocks. A role inherits its component default unless it has an explicit value. The live gallery currently edits shared values and named card colors; role-specific card radius, shadow, typography, and other CSS properties still need schema controls if they are to be edited there.
- [ ] Define hover, focus, pressed, selected, disabled, error, and loading states where relevant.
- [x] Migrate the current flat `app/lib/site-ui-customization.json` values into the new schema, preserving the present Neobrutal colors.
- [x] Map old stored style preferences (`v1`, `soft`, `soft-brutal`, `brutal`) to a valid remaining style and validate saved values on load.

## 2. Connect the audited UI to named roles

- [x] App shell: topbar surface, navigation items, search, notification and account menus. The topbar, navigation hover/selection, keyboard focus, search field, feedback, and menu overlays now use named palette sources. Dark menu hover colors were adjusted for contrast.
- [x] Cards: connect all 20 surviving Card contexts to a shared default or named role. The original 21 included the retired V1 sidebar.
- [x] Replace position-based color rules such as `:nth-child(...)` with named Dashboard and Progress card roles.
- [x] Review custom card-like panels that do not use `Card`; give each a named surface role where theme control is needed. Search, catalog media, demo-course progress/challenge/code/feedback, charts, editor panels, and separate lesson-preview blocks now inherit named palette sources.
- [x] Buttons: map all six shared variants and the 12 audited button jobs to theme values and interaction states. The role map now records every job. Range, lesson, quiz, auth demo, course workflow, settings, search, and loading states have semantic hooks and editor examples; visual comparison remains in section 5.
- [x] Form controls: map text/search/password fields, selects, checkboxes, color controls, sliders, labels, help text, and error states. Shared fields, search, checkboxes, sliders, color controls, placeholder/help text, focus, invalid, read-only, and disabled states now use palette values. Advanced Settings previews these states; visual comparison remains in section 5.
- [x] Status and data: map badges, alerts, progress bars, charts, achievements, and loading skeletons. Five editable palette colors cover statuses, tracks, and skeletons; chart grids/marks and achievement cards use the foundation and named role colors. The white Analytics V2 course progress is a documented contrast exception.
- [x] Overlays and content: map dialogs, popovers, dropdowns, lightboxes, and the separate lesson-preview blocks. Shared overlays use editable values; the media lightbox keeps a separate dark-canvas role. The separate lesson-preview blocks now inherit foundation and code values. Visual review remains in section 5.

## 3. Organize the stylesheets

- [ ] Apply styles in this order: shared defaults → selected visual style → selected Light/Dark palette → component role → interaction state.
- [ ] Keep page layout rules separate from theme appearance rules.
- [ ] Remove superseded hard-coded colors and competing `!important` declarations as each component family is migrated.
- [x] Remove obsolete CSS for the four retired visual styles after Modern V2 and Neobrutalism cover the audited routes.
- [x] Check that changing a general Card value affects default cards, while named card colors override it only when configured. Matching saved role colors now use an explicit `inherit` value, and the editor can switch each role between inheritance and its own color; focused tests cover both paths.

## 4. Update Advanced Settings and persistence

- [x] Show only Modern V2 and Neobrutalism in the style selector, each with Light and Dark mode.
- [x] Make the active combination and the values being edited obvious in the editor.
- [x] Preserve unsaved drafts separately while switching among the four combinations.
- [x] Group controls by foundation, app shell, cards, buttons, fields, status/data, overlays, and content. The status/data group now edits success, warning, error, progress track, and skeleton colors in each palette.
- [x] Preview shared defaults and role-specific examples, including Dashboard and Progress cards and all button states. The editor shows six variants, pressed, selected, disabled, loading, range, lesson, quiz, settings, and provider examples, plus invalid and disabled fields. The live gallery also shows production Card classes and representative content for each audited Card role. Visual comparison remains in section 5.
- [x] Keep the live page preview in sync with the editor draft. The root theme preference subscribes to draft, style, and mode changes; a mounted-page regression check confirms a color edit updates the page, Light/Dark switching selects the right palette, and the draft survives remounting.
- [x] Save all four presets and the selected site default to the repository theme JSON. The local save route test writes all four combinations, reloads the file, and verifies their values and the selected default. Visual review after a local restart remains in section 5.

## 5. Verify and finish

- [ ] Compare every audited route against the baseline in all four combinations: login, create account, dashboard, courses, course welcome, demo course, both analytics pages, settings, profile, and lesson preview.
- [ ] Check desktop layouts and hover, keyboard focus, selected, disabled, error, and loading states. Phone and tablet layouts are out of scope for now (see the frontend README, "Screen sizes"), so only desktop widths need checking. The `/theme-gallery` layout passes an automated check (text centering, overflow, elements leaving their card, sideways scroll) in all four combinations; it was run at 375–1440px before the desktop-only decision. Gallery-only fixes: Analytics V2 colors defined on the samples, mini-chart bars given a fixed-height container, Course summary and Settings row stacked in narrow columns, the V2 achievement divider removed, and the preview banner moved to the bottom so it no longer covers the toolbar. The website routes still need the same check.
- [ ] Check text contrast and legibility on colored cards in both Light and Dark modes. Fixed: in Neobrutalism the Analytics V2 Course summary card gets the shared card surface (the `[data-slot="card"]` rule outranks its primary background) but kept its V2 light-on-blue label, description, track, and ring colors, which were nearly invisible in Neobrutal Light. Neobrutal-scoped rules in `globals.css` now use `--ink`, `--ink-soft`, `--surface-container`, and `--outline`; the card's text measures at least 9.6:1 in both Neobrutal modes, and Modern V2 is unchanged. Checked in `/theme-gallery`; `/analysis/v2` uses the same Card and classes but has not been checked while signed in.
- [x] Run the relevant frontend type, lint, build, and focused behavior checks. After restoring the gallery layout with live components, TypeScript, changed-file ESLint, 257 unit tests, production build, 11 rendered-route/gallery checks, and `git diff --check` pass. Visual review is still pending because Windows computer use is unavailable in this workspace.
- [ ] Confirm no audited element depends on an obsolete style ID, positional card color, or an unexplained theme override. Selector scan found only the two current production style IDs, and remaining positional selectors affect decorative elements rather than card colors. The override/cascade review remains.
- [ ] Record any remaining exceptions in the inventory and mark this task complete only after the four combinations persist and render correctly.

## Review checkpoints

1. **Hierarchy and schema:** four valid combinations and a migration path for existing settings.
2. **Component wiring:** audited pages use named roles and preserve their intended appearance.
3. **Editor and verification:** all four combinations can be previewed, saved, reloaded, and checked across routes.
