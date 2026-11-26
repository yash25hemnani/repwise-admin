---
slug: admin-shell
status: complete
date: 2026-11-26
---

- `views/partials/head.ejs`, `sidebar.ejs` (new) and `topbar.ejs` (rewritten): shared head; a charcoal sidebar with the wordmark, Overview, Exercises and Sign out; a top bar with the page title, theme toggle, initial and email.
- `views/admin.ejs` (now "Overview") and `views/exercises.ejs`: use the shell. The Exercises title moved into the top bar. The search stays on the Exercises page, since it only searches exercises and the sidebar is hidden on phones.
- `public/css/app.css`: light and dark admin tokens. The page follows the system until `<html data-theme>` is set. Removed the old top bar, tabs and chalk list. The list, statuses, load more and dialog now read the tokens. Fixed "No images yet" sitting off-centre.
- `src/server.js`: reads the `theme` cookie (`light` or `dark` only) into `res.locals.theme`.
- `public/js/shell.js` (new): the toggle sets `data-theme` and a one-year `theme` cookie on `/admin`. The phone menu opens and closes with focus moved, Esc and the scrim. Without the script, the toggle stays hidden and the menu works through `#sidebar`.
- `.planning/DESIGN.md`: light and dark tokens, the sidebar, the top bar.

Checked: `node --check`, both pages render with sample data, headless Edge screenshots in light, dark, the dialog, and 390px phone with the menu open and closed. Not yet clicked through against the live server.
