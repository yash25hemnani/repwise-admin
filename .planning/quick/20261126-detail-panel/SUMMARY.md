---
slug: detail-panel
status: complete
date: 2026-11-26
---

- Wide screens (over 1000px) open the exercise in the right panel instead of the dialog. The panel is framed like the list (one outline, 28px corners) and scrolls inside it; the name and close button stick to the top. The URL still changes to `/admin/exercises/:id`, so a reload or shared link opens it, and close returns to the placeholder.
- Narrow screens keep the dialog. The script holds one copy of the detail and moves it between the panel and the dialog when the window crosses 1000px. Without the script, an open exercise shows below the list.
- New detail layout (shared by panel and dialog): name with group and equipment under it; the flip preview and two stills; a "Works" row with the target as a solid white pill and the secondaries outlined; level as three rising bars, plus category, force and mechanic; numbered steps in Archivo 900; a footer with the ID and "Imported from the dataset, not edited yet", "Edited <date>", "Added in the admin" or "Archived". The three tiles are gone.
- `getExercise` also returns `source` and `editedAt`.
- The topbar shows only the avatar; the email is gone (it is still the avatar's hover title).

Files: `views/partials/exercise-detail.ejs`, `views/exercises.ejs`, `views/partials/topbar.ejs`, `public/js/exercises.js`, `public/css/app.css`, `src/exercises.js`.

Checked: EJS render of empty, open, edited (no level, no stills) and not-found states; `node --check`. Not yet checked in a live browser.
