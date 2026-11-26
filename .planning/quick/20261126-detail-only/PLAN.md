---
slug: detail-only
date: 2026-11-26
---

Opening an exercise took about 2.2s of server time (localhost.har). Two fixes, plus a dialog at the user's request:

1. Detail-only loading in a dialog
   - `views/partials/exercise-detail.ejs`: the detail content, moved out of `exercises.ejs`.
   - `src/routes/exercises.js`: with an `X-Partial: detail` header, render only the partial (lists + one doc read, no list query).
   - `views/exercises.ejs` + `public/css/app.css`: the list goes full width, and the exercise shows in a `<dialog>` (full screen on phones).
   - `public/js/exercises.js`: row clicks fetch the partial and open the dialog. Esc, the close button and the backdrop close it, and Back/Forward follow. Any failure falls back to a normal page load.
2. Remember the admin check
   - `src/require-admin.js`: keep a passing user record for 60s per uid, so `auth.getUser` runs at most once a minute. The cookie is still verified on every request. Revoking admin takes up to a minute.

Check: `node --check` on the changed JS and a template render, then the user clicks through the list locally.
