---
slug: black-neon
status: complete
date: 2026-11-26
---

- Light mode removed: no theme toggle, no `theme` cookie, no `data-theme`. `:root` and the admin tokens are dark only (login and home too).
- Admin surfaces are all black (`--bg`, `--panel`, `--tile` = `#000`). The sidebar is split from the page by a grey `#2A2A2E` line; the page has no rounded panel.
- Inner boxes (list card, search, icon buttons, thumbnails, tiles, chips, close button) get the same grey `#2A2A2E` line as the sidebar; only the dialog has a mint border.
- Secondary `#8B53FE`: focus outline, search focus, row and nav hover, the open row.
- Top bar title uses DM Sans 500 like the sidebar items (24px, 19px on phones).
- Status pills removed from list rows and the dialog, with their CSS.

Files: `public/css/app.css`, `public/js/shell.js`, `src/server.js`, `views/admin.ejs`, `views/exercises.ejs`, `views/partials/topbar.ejs`, `views/partials/exercise-detail.ejs`.
`.planning/DESIGN.md` updated to dark only, the line rule, violet and no statuses.
Checked: `node --check`. Not yet checked in the live browser.
