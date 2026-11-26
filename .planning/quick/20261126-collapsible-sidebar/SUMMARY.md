---
slug: collapsible-sidebar
status: complete
date: 2026-11-26
---

- Collapse button next to the wordmark; collapsed, the sidebar is a 72px icon strip with tooltips for the labels.
- State kept in a `sidebar` cookie that the server reads, so the page renders collapsed with no flash. Phones keep the slide-out.
- Animated: the column eases between 248px and 72px, icons stay put, labels wipe out with the strip and fade back in after it widens, and the wordmark condenses (font-stretch 125% to 62%) as it leaves and flexes back on return. Reduced motion turns it off.

- Fix: collapsed, the active pill spilled past the strip because each nav item kept its hidden label's width. The nav grid column is now `minmax(0, 1fr)`, the label shrinks (`min-width: 0; overflow: hidden`) and the item's gap closes to 0, so the pill is 46px wide, round the icon only.

Files: `views/partials/sidebar.ejs`, `views/admin.ejs`, `views/exercises.ejs`, `public/css/app.css`, `public/js/shell.js`, `src/server.js`.

Checked: `node --check`, EJS render of both states. Not yet checked in a live browser.
