# How education websites are styled, themed, and laid out

Survey date: 8 November 2026. Purpose: compare AIVirTeach's two styles (Modern V2, Neobrutalism) and its Learning Lab layout with established learning platforms, and pick out patterns worth adopting.

## Method and limits

- **Measured live** in a desktop browser at 1440×900, signed out: Khan Academy (home, course page, practice exercise), Duolingo (home), Coursera (home), Brilliant (home), edX (home), freeCodeCamp (curriculum and a coding step), Boot.dev (home and a coding lesson), The Odin Project (lesson). A script read computed fonts, colors, radii, shadows, borders, content widths, and pane positions.
- **Read from source:** Codecademy's Gamut design system (token files on GitHub), Khan Academy's 2026 post on rebuilding its color system, and Duolingo's 2026 post on refreshing its app tabs.
- **Blocked by bot checks**, so not measured: Codecademy, DataCamp, Quizlet, and Udemy's site. Scrimba's home page did not render.
- **Signed-in screens** such as dashboards, the Duolingo learning path, and Brilliant lessons were not visible. Descriptions of them below are marked as general knowledge, not measurements.
- Border widths are rounded to whole CSS pixels. The browser ran at 125% display scaling, so it reported 1px as 0.8px.

## At a glance

| Site | Fonts | Main action color | Text color | Page | Corners | Buttons | Depth |
|---|---|---|---|---|---|---|---|
| Khan Academy | Lato (UI), Source Serif Pro (hero heading) | #1865F2 blue | #21242C | white | 4px buttons, 8px cards | 40px tall, 4px corners, flat | Almost none; 1px #DBDCDD card borders |
| Coursera | Source Sans Pro only | #0056D2 blue | #0D0F12, #48546E secondary | white, #F0F6FF tints | 8px; pills (100px) for filter chips | 36px, 8px corners | None; 1px #C1CBDB borders |
| edX | Inter only | #D64000 orange; #00262B dark teal | #333, #00262B | white, warm beige #E7E3DA | 12px cards, 4px; pill buttons (94px) | 40–51px pills, 2px border | Soft (0 1px 3px, 10% black) |
| Duolingo | duolingo-sans, feather (display) | #58CC02 green; #1CB0F6 blue for secondary | #4B4B4B headings, #777 body | white | 12px | 50px, uppercase 15px bold, letter-spaced | Hard bottom "lip": `0 4px 0 #58A700` |
| Brilliant | CoFo Brilliant (UI), CoFo Robert (display) | #29CC57 green | black; 40–60% black secondary | white to warm #F5F3F1 gradient | Pills (9999px), 20px+ | 44px pill, 2px border | Hard bottom lip: `0 4px 0` darker shade |
| Codecademy (Gamut source) | Apercu (base), Suisse (accent), Monaco (code) | Hyper #3A10E5; yellow #FFD300 in dark mode | Navy #10162F | white; beige #FFF0E5 | Scale 0 / 2 / 4 / 8 / 16 / 999px | — | Hard offset shadow: `8px 8px 0` navy, card lifts 4px on hover |
| freeCodeCamp | Lato | #FEAC32 amber | #F5F6F7 on dark | **dark** #1B1B32 | 0 (square) | 53px, square, 3px border | None |
| Boot.dev | DM Sans (UI), Arcuata (display) | Amber/gold #C18500 border on brown | #E8ECF1 on dark | **dark** #252936, textured | 2px; pills | 51px, uppercase, glow shadow | Colored glow (`0 15px 40px -8px`) |
| The Odin Project | Inter | — | Gray scale (Tailwind) | white | Tailwind defaults | — | None; 1px gray borders |

## Patterns

### 1. Typography

- **One UI family, plus at most one display face.** Coursera, edX, and Odin use a single family. Khan, Duolingo, Brilliant, and Boot.dev add one display face, used only for hero or section headings: Source Serif, Feather, CoFo Robert, and Arcuata.
- **Humanist or geometric sans for UI:** Lato (Khan, freeCodeCamp), Source Sans (Coursera), Inter (edX, Odin), and DM Sans (Boot.dev). Nobody uses a serif for UI text or numbers.
- **Body size 14–18px.** Khan's UI runs at 14/19.6px with 16px question text. Odin's lesson prose is 16/24–28px, and Brilliant's lead text is 18/27px.
- **Prose column 460–700px.** Khan measured ~460px for practice questions and ~590px for exercises. Odin's lesson prose is 656px, inside a 697px main column.
- **Negative letter-spacing on large headings:** Coursera at -0.01em, Brilliant at about -1px for 54px text.

### 2. Color

- **One saturated action color on white or near-white.** Everything else is neutral, and secondary actions are outlines or tints of the same hue (Coursera's #F0F6FF chips, Khan's #EBF1FD).
- **Text is never pure black** on the light sites. It is a very dark blue-gray: Khan #21242C, Coursera #0D0F12, Codecademy navy #10162F, Duolingo #4B4B4B. Secondary text is a mid blue-gray (#48546E, #5F6167) or black at reduced opacity (Brilliant 40–60%).
- **Learning-progress colors are separate from brand and status colors.** Khan shows four mastery levels as squares: Attempted (#C66024 outline), Familiar (#D77D0F orange), Proficient (#948EBE light purple), and Mastered (#594094 dark purple). None of these is the blue action color or a green/red status color.
- **Coding-focused sites are dark-first** (freeCodeCamp, Boot.dev). General learning sites are light-first, with dark mode as an option.

### 3. Shape and depth: three families

| Family | Who | Recipe | Our match |
|---|---|---|---|
| **Flat / institutional** | Coursera, Khan, edX, Odin | 4–8px corners (edX up to 12px), 1px light borders, almost no shadow; color tints separate areas | **Modern V2.** Its 16px card corners and 10px buttons are rounder than this group. |
| **Playful / tactile** | Duolingo, Brilliant | 12px corners or pills, thick borders, a hard **bottom lip** (`0 4px 0` in a darker shade of the fill) so buttons look pressable; uppercase bold labels | Not offered |
| **Hard-edged / neobrutal** | Codecademy, freeCodeCamp (square variant) | Solid dark 1–2px borders; **hard offset shadow with no blur** (Codecademy uses 8px, in navy on light and white on dark); interactive cards move up 4px on hover | **Neobrutalism.** Ours uses heavier borders (3–4px) and square corners. |

Takeaway: the pressable "lip" (Duolingo, Brilliant) and the hover lift (Codecademy) are how these sites make controls feel tactile. Both are pure CSS: a box-shadow plus a transform.

### 4. Theming architecture

**Khan Academy (Wonder Blocks, rebuilt 2025–26).** Semantic tokens are named in four parts:

- **Domain:** Core, Learning, or Component.
- **Layer:** background, border, foreground, or shadow.
- **Context:** base, *instructive*, neutral, disabled, success, warning, critical, *knockout*, or overlay.
- **Intensity:** subtle, default, or strong.

Points worth copying:

- "Instructive" replaces "primary". The name says what the color is for: the action that moves the learner forward.
- "Knockout" replaces "inverse": text that must stand out on a strong background, whether light or dark. They dropped "inverse" because it meant different things in different places.
- Contrast rules are written per layer and intensity. For example, strong foreground tokens pass 4.5:1 on all subtle and base backgrounds, and strong borders pass 3:1.
- Two themes share the same components by mapping each theme's colors to the same semantic names. Dark mode took days, because only primitives and a few surface choices changed.

**Codecademy (Gamut).**

- **Small semantic set per color mode:** `text` (default, accent, secondary, disabled), `background` (default, primary, selected, hover, disabled, success, warning, error), `primary`, `secondary`, `danger`, `interface`, `border` (primary, secondary, tertiary, disabled), `shadow`, and `feedback`.
- **Dark mode changes meaning as well as lightness.** The primary color changes hue (purple to yellow), and shadows and borders flip from navy to white.
- **Small fixed scales:**
  - Corners: 0, 2, 4, 8, 16, 999px.
  - Spacing: 4, 8, 12, 16, 24, 32, 40, 48, 64, 96px.
  - Font sizes: 14, 16, 18, 20, 22, 26, 34, 44, 64px.
  - Line height: 1.5 body, 1.2 titles.

**Duolingo (2026 tab refresh).** Lessons from that redesign:

- Use a minimal number of type styles.
- Header sizes are tiered by purpose, and titles always sit in the same position.
- Space content with whitespace rather than wrapping everything in containers.
- Balance consistency against purpose: decoration that tells the learner nothing gets cut.

### 5. Layout

**Top bar height:** 38–65px everywhere measured: freeCodeCamp 38, Boot.dev 51, Brilliant 55, Khan 60, Odin 65. Ours is **76px**, the tallest of the group.

**Content width:** catalog and marketing pages cap at 1110–1280px (Khan 1200, Boot.dev 1280, edX 1280, Brilliant 1110–1240). Coursera and edX allow 1440–1536px for wide catalog grids.

**Course overview (Khan, Odin).** A fixed **left unit/lesson list of 320–416px** next to the main column.

- Khan: a 405px list, then a 1020px main area on a faint tint holding unit cards (8px corners, 1px #DBDCDD border, 16–24px padding).
- Odin: a 320px list, a ~700px article, and a **288px "on this page" outline** on the right.

**Practice / exercise (Khan).**

- The left lesson list stays visible.
- The question sits in a centered ~590px column.
- A **bottom action bar** holds a ghost *Skip* and a primary *Check*, right-aligned (130×40px), with *Report a problem* nearby.
- Progress text such as "Do 4 problems" sits in the same bar.

**Coding workspace.** Measured on freeCodeCamp and Boot.dev:

- **Resizable side-by-side panes.** freeCodeCamp shows instructions 530px, editor 530px, and live preview 371px, with drag handles. Boot.dev splits 50/50 between instructions and editor.
- Each pane has its own small tab strip, for example *Instructions*, *index.html*, *Console*, *Preview*.
- The main actions sit **on the working pane**, not in the page header: *Check your code* (freeCodeCamp), and *Submit*, *Run*, *Solution* (Boot.dev).
- **Lesson progress lives in the top bar:** Boot.dev shows a strip of step dots plus chapter and lesson dropdowns.

**Signed-in home (general knowledge, not measured).**

- Duolingo: a left navigation column, the learning path in the center, and a right column with streak, gems, league, and daily-quest cards.
- Khan and Coursera: a "continue learning" item with a progress bar first, then the course list.
- Motivation details sit beside the main learning area, not on top of it: streak, XP, goals.

## What this means for AIVirTeach

These sites are only measured at desktop widths; our phone and tablet layouts stay out of scope (see the README).

1. **Our two styles map onto real families.** Modern V2 is the flat/institutional family (Coursera, Khan). Neobrutalism is the Codecademy family. Both are well represented among serious learning sites, so keeping these two is reasonable.
2. **Give Neobrutalism Codecademy-style motion.** Add a hard offset shadow with no blur on interactive cards and buttons, and on hover move the element up and lengthen the shadow. This would fit the "interaction states" item still open in section 1 of the theme task. Modern V2 could use the Duolingo bottom lip for primary buttons only, if we want it to feel more playful.
3. **Add a semantic color layer under the component keys.** Each palette currently has 69 component-specific keys (`buttonBackground`, `cardBorder`, `dashboardStreakCard`, …). Khan and Gamut instead define ~25 role tokens and derive components from them:
   - contexts: instructive, neutral, success, warning, critical, knockout, overlay;
   - intensities: subtle, default, strong.

   Doing the same would:
   - make Dark palettes easier to derive and check for contrast;
   - give the open hover, focus, selected, and disabled states one source each;
   - shrink what the editor has to show.
4. **Separate learning-progress colors from status colors.** Mastery, lesson completion, and correct/incorrect feedback should have their own small palette (Khan's four mastery levels). Today they would reuse `statusSuccess` and `statusWarning`, which also mean "saved" or "connection problem".
5. **Typography.** The site mixes Inter with Georgia: analytics headings, metric numbers, and even some buttons use Georgia. The surveyed sites use one UI family and keep a display face for large headings only. Options:
   - Restrict Georgia to page titles.
   - Replace it with one deliberate display face.

   Keep lesson prose to about 650–700px wide.
6. **Top bar.** At 76px it is 11–38px taller than the others. 56–64px would give the Learning Lab more vertical room.
7. **Learning Lab.** Patterns to check against `workspace-v2.tsx`:
   - resizable panes (lesson | remote desktop | tutor) with drag handles;
   - per-pane tab strips;
   - Run, Check, and Next actions attached to the pane they act on;
   - a compact lesson-progress strip (step dots) in the top bar, rather than a separate panel.
8. **Dark mode for a coding product.** freeCodeCamp and Boot.dev default to dark because learners spend their time in an editor or terminal. Our saved site default is Modern V2 Light; Modern V2 Dark is a reasonable default to offer for the Learning Lab specifically.

## Sources

- Khan Academy blog, "How We Rebuilt Khan Academy's Color System from the Ground Up" (23 March 2026): https://blog.khanacademy.org/how-we-rebuilt-khan-academys-color-system-from-the-ground-up/
- Codecademy Gamut source: https://github.com/Codecademy/gamut. See `packages/gamut-styles/src/variables/` (colors, borderRadii, elevation, typography, spacing) and `src/themes/core.ts`.
- Duolingo blog, "Elevating craft: how we refreshed our core tabs" (4 February 2026): https://blog.duolingo.com/core-tabs-redesign/
- Live pages measured: khanacademy.org (home, /math/algebra, an Algebra 1 practice exercise), duolingo.com, coursera.org, brilliant.org, edx.org, freecodecamp.org/learn and a Cat Photo App step, boot.dev (home and the first Python lesson), and theodinproject.com (Introduction to HTML and CSS lesson).
