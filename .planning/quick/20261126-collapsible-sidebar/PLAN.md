---
slug: collapsible-sidebar
date: 2026-11-26
---

Make the desktop sidebar collapsible (approved plan, step 1 without the font change).

1. A collapse button sits next to the wordmark. Collapsed, the sidebar is a 72px icon strip, the wordmark is hidden and the button sits alone at the top.
2. Nav labels are visually hidden in the strip (still read by screen readers) and show as a small tooltip on hover or focus.
3. The state lives in a `sidebar` cookie set by `shell.js`; the server reads it into `res.locals.sidebarCollapsed` so the page renders collapsed with no flash. Without JS the button stays hidden and the sidebar stays open.
4. Phones keep the slide-out menu; the collapse button is hidden there and the close button sits in the same header row.

Files: `views/partials/sidebar.ejs`, `views/admin.ejs`, `views/exercises.ejs`, `public/css/app.css`, `public/js/shell.js`, `src/server.js`. Check with `node --check`.
