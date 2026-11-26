---
slug: admin-shell
date: 2026-11-26
---

A sidebar and top bar for every admin page, in our green, with light and dark mode (the user's dashboard reference).

1. Shell
   - `views/partials/head.ejs`, `sidebar.ejs`, `topbar.ejs`: shared head, a charcoal sidebar (wordmark, Overview, Exercises, Sign out at the bottom) and a top bar (page title, theme toggle, initial and email).
   - `views/admin.ejs`, `views/exercises.ejs`: use the shell. The page title moves into the top bar.
2. Light and dark
   - `public/css/app.css`: admin tokens for light and dark. The page follows the system until the admin picks one, then `<html data-theme>` wins.
   - `src/server.js`: reads the `theme` cookie so the page renders in the chosen theme with no flash.
   - `public/js/shell.js`: the toggle (sets the cookie) and the phone menu.
3. Phones: below 860px the sidebar slides out from a menu button. Without the script, the menu still opens through `#sidebar`.
4. `.planning/DESIGN.md`: drop "dark only" and "no sidebar".

Check: `node --check`, templates render with sample data, then a headless screenshot in both themes.
