# AI Daily Briefing tutorial pages

These two HTML files are the AI Daily Briefing tutorial (English and Simplified Chinese).

**Temporary:** until the server publishes this content, the Learning Lab shows the matching page in place of the server's lessons for `ai-daily-briefing` (see `app/lib/embedded-course.ts`).

- The page runs as-is in a frame, with its own section menu, Next/Previous, and progress (saved in the browser under `ai-daily-briefing-v2-motherduck-progress-v1`, cleared when the course is restarted).
- `app/workspace/EmbeddedCoursePage.tsx` recolours it by overriding the page's `--color-*` variables with the site's current theme colours, and updates them when the theme changes.
- The AI tutor follows the open section: each section maps to the server lesson it covers in `serverLessonFor`.
- Edits to these files show up in the Lab directly. To go back to server lessons, remove the course from `embeddedCourses`.
