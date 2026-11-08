# AIVirTeach frontend

The AIVirTeach web client: login, dashboard, course catalog, the Learning Lab (lessons, remote desktop, AI tutor chat), progress analytics, and settings. Built with React 19 and TypeScript on the Next.js App Router, run through Vinext (Vite) and deployed as a Cloudflare Worker.

## Start locally

```powershell
npm install
npm run dev
```

Open http://localhost:3001 (the port is fixed in `vite.config.ts`) and log in with an account from the deployed server. New users activate their account at `/create-account` with the one-time invitation token AIVirTeach gives them.

## Screen sizes

For now the site is built and checked for **desktop screens only**. Phone and tablet layouts are out of scope: don't spend time optimizing for them, and don't treat a narrow-screen layout problem as a bug unless it also shows on desktop. Existing responsive CSS can stay as it is.

## Backend

The client talks to the **AIVirTeach control-plane server**, deployed at `https://aivirteach-server.vercel.app/api/v1`. Its source is in `../server-architecture-source/aivirteach-server-main`; API docs are at `https://aivirteach-server.vercel.app/docs`.

Selection is in the ignored `.env.local` (see `.env.example` for every value):

```dotenv
NEXT_PUBLIC_BACKEND_MODE=remote
NEXT_PUBLIC_REMOTE_API_BASE_URL=/api/v1
```

- **Remote mode** (current setup). The base URL is the relative `/api/v1`, and the dev server proxies it to the Vercel server (`server.proxy` in `vite.config.ts`). The browser stays on `localhost:3001`, so the server's CORS list doesn't matter in development. Login is email and password with JWT access tokens and rotating refresh tokens; `app/lib/api.ts` refreshes the token shortly before it expires and retries once on a 401.
- **Local mode** (`NEXT_PUBLIC_BACKEND_MODE=local`). Calls `http://localhost:4000/api/v1`, the older demo API in `../backend`, which you start yourself. There is no real login: the email picks one of three seeded learners, sent as the `X-Demo-User-Id` header.

If neither is set, development defaults to local and production builds default to remote (`app/lib/config.ts`). Restart `npm run dev` after changing `.env.local`, because `NEXT_PUBLIC_*` values are compiled in.

If a learning-data route returns 404, `useLearnerProfile` falls back to the built-in demo profile (`app/lib/mock-profile.ts`) instead of failing.

## Routes

| Route | File | What it is |
|---|---|---|
| `/` | `app/page.tsx` | Redirects to `/login` |
| `/login` | `app/login/page.tsx` | Login |
| `/create-account` | `app/create-account/page.tsx` | Activate an invited account |
| `/dashboard` | `app/dashboard/page.tsx` | My learning: resume banner, quick stats, the active course's modules and lessons, recent activity |
| `/courses` | `app/courses/page.tsx` | Course catalog and active-course selection |
| `/courses/welcome` | `app/courses/welcome/page.tsx` | Course welcome before starting |
| `/courses/python-basics` | `app/courses/python-basics/page.tsx` | Demo course |
| `/workspace` | `app/workspace/page.tsx` | Learning Lab |
| `/analysis` | `app/analysis/page.tsx` | Mastery: key numbers, lesson squares, skills by mastery level, weekly chart, achievements |
| `/analysis/v2` | `app/analysis/v2/page.tsx` | Older analytics layout, not linked from the top bar |
| `/settings` | `app/settings/page.tsx` | Settings, including the Advanced theme editor |
| `/settings/profile` | `app/settings/profile/page.tsx` | Learner profile |
| `/preview/lesson` | `app/preview/lesson/page.tsx` | Lesson preview the admin app shows in a frame (`NEXT_PUBLIC_ADMIN_ORIGIN`) |
| `/theme-gallery` | `app/theme-gallery/page.tsx` | Live gallery of themed components with an editor |

`/theme-gallery.html` only redirects to `/theme-gallery`.

## Where things live

**App shell and shared UI**
- `app/layout.tsx` — root layout. Mounts the preference components (theme, style, UI customization, scrollbar, language) that set attributes on `<html>`.
- `app/components/` — app-level components: `Sidebar` (the top bar: My learning, Courses, Learning Lab, Mastery), `AccountMenu` (profile, Settings, sign out), `NotificationMenu`, `TopbarSearch`, `CourseLessonView`, `LessonBlocks`, `ProgressWidgets` (lesson squares, skills table, weekly chart, achievements), and the theme editor `AdvancedUiSettings`.
- `components/ui/` — shared primitives (Button, Card, Input, Select, Dialog, and so on) in the shadcn style.
- `app/globals.css` — global styles and theme variables. `app/components/course-lesson.css` and `app/theme-gallery/theme-gallery.css` cover their own areas.

**Data and API**
- `app/lib/config.ts` — backend mode and base URL.
- `app/lib/api.ts` — typed API client, token storage and refresh, and the demo-user header.
- `app/hooks/useLearnerProfile.ts` — the signed-in learner's profile, dashboard, and notifications.
- `app/hooks/useCourseOutline.ts` — the active course's modules and lessons with completion state, from the course API, the browser demo course, or an estimate from the catalog lesson count. `app/lib/mastery.ts` maps a skill score to a mastery level.
- `app/lib/courses.ts`, `app/lib/mock-course.ts`, `app/lib/mock-profile.ts` — course helpers and demo data.
- `app/lib/language.ts` — English and Chinese strings (`localize`).

**Learning Lab (`app/workspace/`)**
- `workspace-v2.tsx` — the page itself: layout, the teacher and learning-path tabs, the floating prompt.
- `use-course-learning-session.ts`, `use-lesson-selection.ts`, `use-learning-progress.ts` — course, lesson, and progress state.
- `use-console-session.ts`, `console-session.ts`, `console-viewer.tsx` — starting and showing the remote desktop. `heartbeat.ts` keeps the workspace alive while the tab is visible.
- `use-tutor-request.ts`, `use-chat-messages.ts`, `chat-message-controller.ts`, `tutor-message.tsx` — AI tutor chat, including streamed replies.

## Theme system

The site has two visual styles, **Modern V2** (`v2`) and **Neobrutalism** (`neubrutal`), each with a **Light** and **Dark** palette: four combinations in total. Modern V2 Light is the default.

- `app/lib/site-ui-customization.json` — the saved site theme: style values per style, colors per style and mode, and the default combination. Changes to this file are committed with the code.
- `app/lib/theme-presets.ts` — schema, defaults, and validation for that file.
- `app/lib/theme-style.ts`, `app/lib/interface-version.ts`, `app/lib/theme.ts` — the selected style and mode. Old saved styles (`v1`, `soft`, `soft-brutal`, `brutal`) are mapped to the two current ones.
- `app/lib/ui-customization.ts` — turns the active values into CSS variables on the page.
- `app/design-refinements.css` — loaded after `globals.css`: purpose-named role colors (`--role-*`), learning-progress colors (`--learn-*`), the shorter top bar, and hover, press, and focus states for both styles. The font is Inter, self-hosted through `@fontsource-variable/inter`.
- `app/course-home.css` — My learning and Mastery page styles.
- `app/components/AdvancedUiSettings.tsx` (Settings → Advanced) and `/theme-gallery` — editors. Edits preview live in the browser; **Save** writes `site-ui-customization.json` through a route that only exists while `npm run dev` is running (`build/site-theme-writer.ts`).

The design inventory and the element-to-theme-setting map are in `docs/ui-inventory.md` and `docs/ui-theme-role-map.md`.

## Progress and notes

- `tasks-md-list/` — one Markdown plan per piece of work, with a checklist and status.
- `docs/verification/` — dated notes from checking finished work.

## Usually leave these alone

- `worker/`, `build/`, `.openai/`, `vite.config.ts`, `scripts/` — runtime, build, and hosting integration.
- `db/`, `drizzle/`, `drizzle.config.ts` — Worker database schema and migrations, not yet used by the app.
- `examples/`, `reference/` — reference material, not part of the running app.
- `dist/`, `.vinext/`, `.wrangler/`, `work/` — generated output.
- `package-lock.json` — generated lockfile.

## Commands

```powershell
npm run dev          # dev server on :3001
npm run test:unit    # Vitest unit tests
npm test             # unit tests, production build, then rendered-page checks
npm run lint
npm run build
```

`npm run typecheck` generates Cloudflare Worker types into `work/` and then runs `tsc`. Its `mkdir -p` step needs a POSIX shell such as Git Bash; once `work/worker-types.d.ts` exists, `npx tsc --noEmit` works from any shell.

## Deploy the production Cloudflare client

Run `npm run deploy:cloudflare` after `npm ci` and `wrangler login`. It builds for the existing `aivir-client-pr` Worker, checks the generated preview response, then deploys it, keeping existing Worker variables.

Production public addresses live in `scripts/build-cloudflare.mjs`. They are set before compilation because `NEXT_PUBLIC_*` values are embedded in browser bundles. The preview accepts messages and framing from `https://aivirteach-admin.vercel.app`, and the client uses the API at `https://aivirteach-server.vercel.app/api/v1`. To change these addresses, update the build script and its verification together.

`npm run build:cloudflare` builds and verifies without deploying. The check rejects a wrong Worker target, missing bindings, a blocked preview CSP, or a missing admin message origin. Local `npm run dev` still uses `.env.local` and local bindings.
