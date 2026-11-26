---
slug: detail-only
status: complete
date: 2026-11-26
---

- `src/routes/exercises.js`: an `X-Partial: detail` request renders only the detail partial and skips the list query. Sends `Vary: X-Partial`.
- `views/partials/exercise-detail.ejs`: new, the detail content with a close link. Nothing is rendered when no exercise is selected.
- `views/exercises.ejs`: the list is full width, and the detail sits in `<dialog class="detail">`, opened by the server for a direct link so it works without the script.
- `public/js/exercises.js`: new. Row clicks fetch the partial and `showModal()`. Esc, the close button and the backdrop close it and push the list URL, and Back/Forward reopen or close it. A redirect (signed out), a server error or a network error falls back to a full page load.
- `public/css/app.css`: removed the split layout, the sticky panel and the one-panel-at-a-time phone rules. Added the dialog, backdrop, close button and a dimmed row while it loads. The dialog is full screen at 600px and below.
- `src/require-admin.js`: a passing account record is kept for 60s per uid per server instance. Refusals aren't cached, so a newly granted admin gets in right away. A revoked or disabled admin loses access within a minute.

Checked: `node --check` on the three JS files, and both templates render with sample data (an exercise, not found, none). Not yet clicked through in a browser.
